import { NextResponse } from 'next/server';
import {
  readPlayerState,
  readInventory,
  writePlayerState,
  writeInventory,
  appendChronicle,
  rollSkillCheck,
  determineSkillStat,
  checkLevelUp,
  DiceRoll,
  PlayerState,
  InventoryState,
  TurnResult,
  isServerless,
} from '@/lib/game-engine';
import { generateNarration } from '@/lib/gm-narrator';
import { commitGameState } from '@/lib/git-manager';
import { INITIAL_PLAYER_STATE, INITIAL_INVENTORY_STATE } from '@/lib/initial-state';

export async function POST(request: Request) {
  try {
    const { action, playerState: clientPlayerState, inventoryState: clientInventoryState } = await request.json();

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Step 1: READ STATE
    let player: PlayerState;
    let inventory: InventoryState;
    
    const serverless = isServerless() || (!!clientPlayerState && !!clientInventoryState);

    if (serverless) {
      player = clientPlayerState || INITIAL_PLAYER_STATE;
      inventory = clientInventoryState || INITIAL_INVENTORY_STATE;
    } else {
      try {
        player = await readPlayerState();
        inventory = await readInventory();
      } catch {
        return NextResponse.json(
          { error: 'Failed to read game state. Is the game initialized?' },
          { status: 500 }
        );
      }
    }


    // Check if player is dead
    if (player.health.current <= 0) {
      return NextResponse.json({
        immersiveLore: '[GAME OVER] Time-loop collapse detected. Your consciousness fractures across the timeline. Use Time Travel to restore a previous reality anchor.',
        tacticalSummary: 'CRITICAL FAILURE: VITAL SIGNS LOST.',
        engineAlert: '> System Purge Initiated.',
        mechanics: { diceRoll: null, hpChange: 0, xpChange: 0, manaChange: 0, goldChange: 0, itemsGained: [], itemsLost: [], statusEffectsAdded: [], statusEffectsRemoved: [], locationChange: null, commitType: 'DEATH', commitDescription: 'Character is dead', levelUp: false, threatDetected: null, objective: null, memoryFragmentUnlocked: null },
        playerState: player,
        inventory,
        isGameOver: true,
      } as TurnResult);
    }

    // Step 2: RESOLVE MECHANICS
    const { stat, dc } = determineSkillStat(action);
    const statValue = player.stats[stat as keyof typeof player.stats];
    const diceRoll: DiceRoll = rollSkillCheck(statValue, dc, stat);

    // Step 3: GENERATE NARRATION (AI or fallback)
    const narrationResult = await generateNarration(action, player, inventory, diceRoll);

    // Step 4: UPDATE STATE
    // Apply HP changes
    player.health.current = Math.max(
      0,
      Math.min(player.health.max, player.health.current + narrationResult.hpChange)
    );

    // Apply mana changes
    player.mana.current = Math.max(
      0,
      Math.min(player.mana.max, player.mana.current + narrationResult.manaChange)
    );

    // Apply XP
    player.experience.current += narrationResult.xpGain;

    // Apply gold
    inventory.gold = Math.max(0, inventory.gold + narrationResult.goldChange);

    // Apply items gained
    for (const item of narrationResult.itemsGained) {
      const existing = inventory.bag.find((i) => i.id === item.id);
      if (existing) {
        existing.qty += item.qty;
      } else {
        inventory.bag.push(item);
      }
    }

    // Apply items lost
    for (const itemId of narrationResult.itemsLost) {
      const idx = inventory.bag.findIndex((i) => i.id === itemId);
      if (idx >= 0) {
        inventory.bag[idx].qty -= 1;
        if (inventory.bag[idx].qty <= 0) {
          inventory.bag.splice(idx, 1);
        }
      }
    }

    // Apply status effects
    for (const s of narrationResult.statusAdded) {
      if (!player.status_effects.includes(s)) {
        player.status_effects.push(s);
      }
    }
    for (const s of narrationResult.statusRemoved) {
      player.status_effects = player.status_effects.filter((e) => e !== s);
    }

    // Location change
    if (narrationResult.locationChange) {
      player.current_location = narrationResult.locationChange;
    }

    // Increment turn counter
    player.turns_played += 1;

    // Check for level up
    let levelUp = false;
    const levelCheck = checkLevelUp(player);
    if (levelCheck.leveledUp) {
      levelUp = true;
      player.level = levelCheck.newLevel;
      player.health.max += levelCheck.hpIncrease;
      player.health.current = player.health.max;
      player.mana.max += levelCheck.manaIncrease;
      player.mana.current = player.mana.max;
      player.experience.next_level = levelCheck.newLevel * 100 + (levelCheck.newLevel - 1) * 100;
    }

    // Check for death
    const isGameOver = player.health.current <= 0;
    if (isGameOver) {
      player.health.current = 0;
    }

    const commitType = levelUp ? 'LEVEL_UP' : narrationResult.commitType;
    const commitDesc = levelUp
      ? `Reached Level ${player.level} ${player.class}! ${narrationResult.commitDescription}`
      : narrationResult.commitDescription;

    if (!serverless) {
      // Step 4b: WRITE STATE FILES
      await writePlayerState(player);
      await writeInventory(inventory);

      // Append to chronicle
      const chronicleEntry = `- **Turn ${player.turns_played}**: ${commitDesc}${isGameOver ? ' 💀 DEATH' : ''}`;
      await appendChronicle(chronicleEntry);

      // Step 5: GIT COMMIT
      await commitGameState(commitType, commitDesc);
    }


    // Build response
    const immersiveLoreAppend = isGameOver
      ? '\n\n[GAME OVER] Time-loop collapse detected. Initiating temporal recall... Use Time Travel to restore a previous reality anchor.'
      : (levelUp ? `\n\n✨ **LEVEL UP!** You have reached Level ${player.level}! Your strength grows, your wounds mend, and new power courses through your veins.` : '');

    if (narrationResult.memoryFragmentUnlocked) {
      if (!player.memory_fragments) player.memory_fragments = [];
      player.memory_fragments.push(narrationResult.memoryFragmentUnlocked);
      if (!serverless) await writePlayerState(player);
    }

    const result: TurnResult = {
      immersiveLore: narrationResult.immersiveLore + immersiveLoreAppend,
      tacticalSummary: narrationResult.tacticalSummary,
      engineAlert: narrationResult.engineAlert,
      mechanics: {
        diceRoll,
        hpChange: narrationResult.hpChange,
        xpChange: narrationResult.xpGain,
        manaChange: narrationResult.manaChange,
        goldChange: narrationResult.goldChange,
        itemsGained: narrationResult.itemsGained,
        itemsLost: narrationResult.itemsLost,
        statusEffectsAdded: narrationResult.statusAdded,
        statusEffectsRemoved: narrationResult.statusRemoved,
        locationChange: narrationResult.locationChange,
        commitType,
        commitDescription: commitDesc,
        levelUp,
        threatDetected: narrationResult.threatDetected,
        objective: narrationResult.objective,
        memoryFragmentUnlocked: narrationResult.memoryFragmentUnlocked,
      },
      playerState: player,
      inventory,
      isGameOver,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Action route error:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
