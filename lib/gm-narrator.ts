import OpenAI from 'openai';
import {
  PlayerState,
  InventoryState,
  DiceRoll,
  readSoul,
  readRules,
} from './game-engine';

/* ─── OpenRouter Client ──────────────────────────────── */

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
});

const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

/* ─── Types ──────────────────────────────────────────── */

export interface NarrationResult {
  immersiveLore: string;
  tacticalSummary: string;
  engineAlert: string | null;
  commitType: string;
  commitDescription: string;
  hpChange: number;
  xpGain: number;
  manaChange: number;
  goldChange: number;
  itemsGained: { id: string; name: string; qty: number; effect?: string; type: string }[];
  itemsLost: string[];
  statusAdded: string[];
  statusRemoved: string[];
  locationChange: string | null;
  threatDetected: string | null;
  objective: string | null;
  memoryFragmentUnlocked: string | null;
}

/* ─── Prompt Construction ─────────────────────────────── */

function buildTurnPrompt(
  action: string,
  player: PlayerState,
  inventory: InventoryState,
  diceRoll: DiceRoll
): string {
  return `
<current_state>
PLAYER CHARACTER:
${JSON.stringify(player, null, 2)}

INVENTORY:
${JSON.stringify(inventory, null, 2)}
</current_state>

<dice_result>
Roll: ${diceRoll.roll} (1d${diceRoll.sides})
Modifier: ${diceRoll.modifier >= 0 ? '+' : ''}${diceRoll.modifier} (${diceRoll.statUsed.toUpperCase()})
Total: ${diceRoll.total}
DC: ${diceRoll.dc}
Result: ${diceRoll.isCritical ? 'CRITICAL SUCCESS!' : diceRoll.isCritFail ? 'CRITICAL FAILURE!' : diceRoll.success ? 'SUCCESS' : 'FAILURE'}
</dice_result>

<player_action>
${action}
</player_action>

Based on the dice result and the player's action, generate the narrative outcome. You MUST respond in EXACTLY this JSON format (no markdown, no code fences, ONLY raw JSON):

{
  "immersiveLore": "Atmospheric narrative description of what happens (max 150 words). Be vivid, dramatic, and genre-appropriate. Use typewriter-style pacing.",
  "tacticalSummary": "A short, punchy sentence summarizing the action's immediate outcome. (e.g. 'Your blade tears through the Wraith’s unstable form.')",
  "engineAlert": "Optional. A mechanical/lore alert from the Chrono-Engine (e.g., '> Reality instability detected: 42%'). Null if none.",
  "threatDetected": "Optional. The name of the current active threat or enemy (e.g. 'Glitch-Wraith'). Null if safe.",
  "objective": "Optional. The immediate short-term goal for the current scene (e.g. 'Survive the hidden passage'). Null if wandering.",
  "memoryFragmentUnlocked": "Optional. Text of a discovered lore fragment (max 1 sentence) if the player explores well. Null otherwise.",
  "commitType": "One of: LOOT, COMBAT, LEVEL_UP, EXPLORE, STEALTH, MAGIC, DIALOGUE, DEATH, REST, QUEST",
  "commitDescription": "Short description for the git commit (e.g., 'Found a Silver Ring and 12 Gold')",
  "hpChange": 0,
  "xpGain": 0,
  "manaChange": 0,
  "goldChange": 0,
  "itemsGained": [],
  "itemsLost": [],
  "statusAdded": [],
  "statusRemoved": [],
  "locationChange": null
}

RULES:
- hpChange is negative for damage taken, positive for healing
- xpGain is always positive (10-30 for minor actions, 50+ for major events)
- If the player dies (HP would reach 0), set commitType to "DEATH"
- For combat, deal 3-15 damage based on enemy strength
- For loot, give 5-50 gold and/or 1 item
- For rest, heal 25% of max HP (short rest) or 100% (long rest with no threats)
- Keep immersiveLore atmospheric and genre-consistent (Dark Fantasy Cyberpunk)
- Critical successes should be especially rewarding and perhaps unlock a memoryFragment
- Critical failures should be dramatically punishing
`;
}

/* ─── AI Narration ────────────────────────────────────── */

export async function generateNarration(
  action: string,
  player: PlayerState,
  inventory: InventoryState,
  diceRoll: DiceRoll
): Promise<NarrationResult> {
  try {
    // Read SOUL.md for system prompt
    let systemPrompt: string;
    try {
      const soul = await readSoul();
      const rules = await readRules();
      systemPrompt = soul + '\n\n---\n\n' + rules;
    } catch {
      systemPrompt = getDefaultSystemPrompt();
    }

    const userPrompt = buildTurnPrompt(action, player, inventory, diceRoll);

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || '';

    // Parse the JSON response (strip markdown fences if present)
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      immersiveLore: parsed.immersiveLore || 'The world shifts around you...',
      tacticalSummary: parsed.tacticalSummary || 'Action resolved.',
      engineAlert: parsed.engineAlert || null,
      commitType: parsed.commitType || 'EXPLORE',
      commitDescription: parsed.commitDescription || action.substring(0, 50),
      hpChange: parsed.hpChange || 0,
      xpGain: parsed.xpGain || 10,
      manaChange: parsed.manaChange || 0,
      goldChange: parsed.goldChange || 0,
      itemsGained: parsed.itemsGained || [],
      itemsLost: parsed.itemsLost || [],
      statusAdded: parsed.statusAdded || [],
      statusRemoved: parsed.statusRemoved || [],
      locationChange: parsed.locationChange || null,
      threatDetected: parsed.threatDetected || null,
      objective: parsed.objective || null,
      memoryFragmentUnlocked: parsed.memoryFragmentUnlocked || null,
    };
  } catch (error) {
    console.error('AI narration error, falling back to mock:', error);
    return generateMockNarration(action, player, diceRoll);
  }
}

/* ─── Fallback Mock Narration ─────────────────────────── */

function generateMockNarration(
  action: string,
  player: PlayerState,
  diceRoll: DiceRoll
): NarrationResult {
  const actionLower = action.toLowerCase();
  const success = diceRoll.success;
  const crit = diceRoll.isCritical;
  const critFail = diceRoll.isCritFail;

  const defaultFields = {
    engineAlert: null,
    threatDetected: null,
    objective: null,
    memoryFragmentUnlocked: null,
  };

  // Combat actions
  if (/attack|strike|hit|slash|stab|fight/.test(actionLower)) {
    if (critFail) {
      return {
        ...defaultFields,
        immersiveLore: `Your blade arcs through the stale, neon-lit air — and catches on your own cloak. You stumble forward, crashing into a pile of corroded servo-parts. The sound echoes through the crypts like a death knell. Something stirs in the darkness ahead, drawn by the noise. Your cheeks burn with embarrassment, but the cold bite of fear is sharper.`,
        tacticalSummary: 'Critical miss — stumbled and alerted enemies.',
        threatDetected: 'Approaching Swarm',
        commitType: 'COMBAT',
        commitDescription: 'Critical miss — stumbled and alerted enemies',
        hpChange: -3,
        xpGain: 5,
        manaChange: 0,
        goldChange: 0,
        itemsGained: [],
        itemsLost: [],
        statusAdded: [],
        statusRemoved: [],
        locationChange: null,
      };
    }
    if (crit) {
      return {
        ...defaultFields,
        immersiveLore: `Time fractures. Your Runic Vibro-Dagger hums with an unholy resonance as you drive it home with devastating precision. The blade finds the gap between corroded plating and synthetic flesh — a perfect strike. Your enemy crumples, circuits sparking, leaking both oil and something darker. The neon runes along your weapon flare triumphant gold. You feel power coursing through you — the kill was clean, surgical, and absolute.`,
        tacticalSummary: 'Critical hit! Devastating strike against enemy.',
        engineAlert: '> Combat sequence resolved with maximum efficiency.',
        commitType: 'COMBAT',
        commitDescription: 'Critical hit! Devastating strike against enemy',
        hpChange: 0,
        xpGain: 35,
        manaChange: 0,
        goldChange: 8,
        itemsGained: [],
        itemsLost: [],
        statusAdded: [],
        statusRemoved: [],
        locationChange: null,
      };
    }
    if (success) {
      return {
        ...defaultFields,
        immersiveLore: `Your ${player.stats.strength >= 14 ? 'powerful' : 'swift'} strike connects. The vibro-edge of your dagger bites through corroded armor plating, sending a shower of sparks into the gloom. Your foe staggers back, a guttural sound escaping damaged vocal processors. The neon flicker of dying lights plays across the fresh wound. Not a killing blow — but enough to matter.`,
        tacticalSummary: 'Landed a solid strike.',
        commitType: 'COMBAT',
        commitDescription: 'Landed a solid strike in combat',
        hpChange: -5,
        xpGain: 20,
        manaChange: 0,
        goldChange: 0,
        itemsGained: [],
        itemsLost: [],
        statusAdded: [],
        statusRemoved: [],
        locationChange: null,
      };
    }
    return {
      ...defaultFields,
      immersiveLore: `You lunge forward, blade singing through recycled air — but your target is faster. It sidesteps with mechanical precision, your dagger scoring a line of sparks across the wall instead. A counter-blow catches you in the ribs. Pain blooms hot and electric through your synth-leather jerkin. You taste copper and ozone.`,
      tacticalSummary: 'Missed attack, took counter-damage.',
      threatDetected: 'Hostile Entity',
      commitType: 'COMBAT',
      commitDescription: 'Missed attack, took counter-damage',
      hpChange: -8,
      xpGain: 10,
      manaChange: 0,
      goldChange: 0,
      itemsGained: [],
      itemsLost: [],
      statusAdded: [],
      statusRemoved: [],
      locationChange: null,
    };
  }

  // Stealth actions
  if (/sneak|hide|stealth|creep|shadow/.test(actionLower)) {
    if (success) {
      return {
        ...defaultFields,
        immersiveLore: `You melt into the shadows like smoke through circuitry. The neon glyphs along the corridor walls cast shifting patterns, but you move between them — a ghost in the machine. Your boots make no sound on the grated floor. Whatever lurks ahead remains blissfully unaware of the predator in their midst. The darkness is your ally here.`,
        tacticalSummary: 'Successfully sneaked past danger undetected.',
        commitType: 'STEALTH',
        commitDescription: 'Successfully sneaked past danger undetected',
        hpChange: 0,
        xpGain: 15,
        manaChange: 0,
        goldChange: 0,
        itemsGained: [],
        itemsLost: [],
        statusAdded: [],
        statusRemoved: [],
        locationChange: null,
      };
    }
    return {
      ...defaultFields,
      immersiveLore: `A corroded floor panel gives way beneath your foot with a shriek of tortured metal. The sound reverberates through the crypt like a digital scream. Red warning lights flicker to life along the corridor. You've been spotted — or heard. Either way, stealth is no longer an option. Prepare yourself.`,
      tacticalSummary: 'Stealth failed — detected by enemies.',
      threatDetected: 'Crypt Guardian',
      engineAlert: '> Perimeter breach detected.',
      commitType: 'STEALTH',
      commitDescription: 'Stealth failed — detected by enemies',
      hpChange: 0,
      xpGain: 5,
      manaChange: 0,
      goldChange: 0,
      itemsGained: [],
      itemsLost: [],
      statusAdded: [],
      statusRemoved: [],
      locationChange: null,
    };
  }

  // Exploration / inspection
  if (/look|search|inspect|examine|explore/.test(actionLower)) {
    if (success) {
      return {
        ...defaultFields,
        immersiveLore: `Your keen eyes catch what others would miss. Behind a tangle of dead wiring and ancient stonework, a faint glow pulses — arcane circuitry still alive after centuries. You pry loose a panel to reveal a small cache: tarnished coins bearing the sigil of the Old Net, and a glass vial filled with luminescent fluid. The crypt gives up its secrets reluctantly, but you are patient.`,
        tacticalSummary: 'Discovered a hidden cache.',
        memoryFragmentUnlocked: crit ? 'The Old Net collapsed not from war, but from the sheer weight of its own collected memories.' : null,
        commitType: 'LOOT',
        commitDescription: 'Discovered a hidden cache during exploration',
        hpChange: 0,
        xpGain: 15,
        manaChange: 0,
        goldChange: 12,
        itemsGained: [{ id: 'glow_vial', name: 'Vial of Neon Essence', qty: 1, effect: 'Illuminates dark areas for 3 turns', type: 'consumable' }],
        itemsLost: [],
        statusAdded: [],
        statusRemoved: [],
        locationChange: null,
      };
    }
    return {
      ...defaultFields,
      immersiveLore: `You scan the area methodically, running your fingers along cold stone and corroded metal. But this section of the crypt has been picked clean — by scavengers, time, or both. Nothing but dust, dead wiring, and the ever-present hum of failing power cells. The darkness here feels heavier somehow, as if the crypt resents your intrusion.`,
      tacticalSummary: 'Explored the area but found nothing of note.',
      commitType: 'EXPLORE',
      commitDescription: 'Explored the area but found nothing of note',
      hpChange: 0,
      xpGain: 5,
      manaChange: 0,
      goldChange: 0,
      itemsGained: [],
      itemsLost: [],
      statusAdded: [],
      statusRemoved: [],
      locationChange: null,
    };
  }

  // Magic / casting
  if (/cast|spell|magic|arcane/.test(actionLower)) {
    if (success) {
      return {
        ...defaultFields,
        immersiveLore: `You extend your hand, fingers tracing glyphs of power in the stale air. Mana surges through your neural pathways — blue-white arcs of energy dancing between your fingertips. The spell takes shape: a crackling bolt of arcane force that illuminates the crypt in stark, beautiful violence. It strikes true, and the air smells of ozone and old magic. The ancient circuitry in the walls flickers in sympathetic resonance.`,
        tacticalSummary: 'Successfully cast a spell.',
        commitType: 'MAGIC',
        commitDescription: 'Successfully cast a spell',
        hpChange: 0,
        xpGain: 20,
        manaChange: -5,
        goldChange: 0,
        itemsGained: [],
        itemsLost: [],
        statusAdded: [],
        statusRemoved: [],
        locationChange: null,
      };
    }
    return {
      ...defaultFields,
      immersiveLore: `The mana builds... and fizzles. Your concentration breaks as a distant scream echoes through the ventilation shafts. The half-formed spell collapses in a shower of harmless sparks, leaving your hands tingling and your reserves diminished. The crypt seems to mock you with its silence. Even the neon glyphs on the walls dim momentarily, as if disappointed.`,
      tacticalSummary: 'Spell casting failed — mana wasted.',
      commitType: 'MAGIC',
      commitDescription: 'Spell casting failed — mana wasted',
      hpChange: 0,
      xpGain: 5,
      manaChange: -3,
      goldChange: 0,
      itemsGained: [],
      itemsLost: [],
      statusAdded: [],
      statusRemoved: [],
      locationChange: null,
    };
  }

  // Rest
  if (/rest|sleep|camp|meditate/.test(actionLower)) {
    const hpRestore = Math.ceil(player.health.max * 0.25);
    return {
      ...defaultFields,
      immersiveLore: `You find a defensible alcove where the crypt's ancient wards still hold. Leaning against cold stone that thrums with dormant power, you close your eyes. Sleep comes in fitful waves — dreams of fractured timelines and neon-lit abysses. But your body knows its work. When you wake, the worst of your wounds have knitted, and your mind feels sharper. The crypts wait, patient and eternal.`,
      tacticalSummary: `Rested and recovered ${hpRestore} HP.`,
      engineAlert: '> Biometrics stabilized.',
      commitType: 'REST',
      commitDescription: `Rested and recovered ${hpRestore} HP`,
      hpChange: hpRestore,
      xpGain: 5,
      manaChange: Math.ceil(player.mana.max * 0.25),
      goldChange: 0,
      itemsGained: [],
      itemsLost: [],
      statusAdded: [],
      statusRemoved: [],
      locationChange: null,
    };
  }

  // Default: generic exploration
  return {
    ...defaultFields,
    immersiveLore: `You press deeper into the labyrinth. The air grows thicker, laden with the scent of ancient stone and ozone from failing neon conduits. Every shadow holds a question, every flicker of light a half-remembered warning. ${success ? 'Your instincts guide you true — the path ahead seems safer than what lies behind.' : 'An uneasy feeling settles in your gut. The crypts are watching, calculating, waiting for the perfect moment to test you again.'}`,
    tacticalSummary: success ? 'Explored safely and gained experience.' : 'Ventured deeper into unknown territory.',
    commitType: 'EXPLORE',
    commitDescription: success ? 'Explored safely and gained experience' : 'Ventured deeper into unknown territory',
    hpChange: success ? 0 : -2,
    xpGain: 10,
    manaChange: 0,
    goldChange: 0,
    itemsGained: [],
    itemsLost: [],
    statusAdded: [],
    statusRemoved: [],
    locationChange: null,
  };
}

/* ─── Default System Prompt (fallback if SOUL.md missing) */

function getDefaultSystemPrompt(): string {
  return `You are the ChronosRPG Game Master, a git-native AI Dungeon Master operating in a Dark Fantasy Cyberpunk world. 
You narrate atmospheric, vivid stories. Every player action results in dice rolls and state changes.
You must respond ONLY in valid JSON format as specified in the user prompt.
Keep narration under 150 words, atmospheric, and genre-appropriate.
The world is a fusion of crumbling dark fantasy architecture and neon-lit cyberpunk technology.`;
}
