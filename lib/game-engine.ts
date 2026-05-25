import fs from 'fs/promises';
import path from 'path';

const GAME_DIR = path.join(process.cwd(), process.env.GAME_DIR || 'game');

export const isServerless = () => 
  !!process.env.VERCEL || 
  process.env.NEXT_PUBLIC_SERVERLESS === 'true';


/* ─── Types ──────────────────────────────────────────── */

export interface PlayerState {
  name: string;
  class: string;
  level: number;
  health: { current: number; max: number };
  mana: { current: number; max: number };
  armor_class: number;
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    constitution: number;
    wisdom: number;
    charisma: number;
  };
  experience: { current: number; next_level: number };
  status_effects: string[];
  current_location: string;
  alignment: string;
  abilities: string[];
  quests: any[];
  memory_fragments: string[];
  kill_count: number;
  turns_played: number;
}

export interface EquippedItem {
  name: string;
  damage?: string;
  bonus?: string;
  type?: string;
  ac_bonus?: number;
}

export interface BagItem {
  id: string;
  name: string;
  qty: number;
  effect?: string;
  description?: string;
  type: string;
}

export interface InventoryState {
  gold: number;
  equipped: {
    weapon: EquippedItem | null;
    armor: EquippedItem | null;
    accessory: EquippedItem | null;
  };
  bag: BagItem[];
}

export interface DiceRoll {
  roll: number;
  modifier: number;
  total: number;
  sides: number;
  statUsed: string;
  dc: number;
  success: boolean;
  isCritical: boolean;
  isCritFail: boolean;
}

export interface TurnResult {
  immersiveLore: string;
  tacticalSummary: string;
  engineAlert: string | null;
  mechanics: {
    diceRoll: DiceRoll | null;
    hpChange: number;
    xpChange: number;
    manaChange: number;
    goldChange: number;
    itemsGained: BagItem[];
    itemsLost: string[];
    statusEffectsAdded: string[];
    statusEffectsRemoved: string[];
    locationChange: string | null;
    commitType: string;
    commitDescription: string;
    levelUp: boolean;
    threatDetected: string | null;
    objective: string | null;
    memoryFragmentUnlocked: string | null;
  };
  playerState: PlayerState;
  inventory: InventoryState;
  isGameOver: boolean;
}

/* ─── File I/O ───────────────────────────────────────── */

export async function readPlayerState(): Promise<PlayerState> {
  const filePath = path.join(GAME_DIR, 'characters', 'player.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function writePlayerState(state: PlayerState): Promise<void> {
  const filePath = path.join(GAME_DIR, 'characters', 'player.json');
  await fs.writeFile(filePath, JSON.stringify(state, null, 2), 'utf-8');
}

export async function readInventory(): Promise<InventoryState> {
  const filePath = path.join(GAME_DIR, 'characters', 'inventory.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

export async function writeInventory(inventory: InventoryState): Promise<void> {
  const filePath = path.join(GAME_DIR, 'characters', 'inventory.json');
  await fs.writeFile(filePath, JSON.stringify(inventory, null, 2), 'utf-8');
}

export async function readChronicle(): Promise<string> {
  const filePath = path.join(GAME_DIR, 'world', 'chronicle.md');
  return fs.readFile(filePath, 'utf-8');
}

export async function appendChronicle(entry: string): Promise<void> {
  const filePath = path.join(GAME_DIR, 'world', 'chronicle.md');
  const existing = await fs.readFile(filePath, 'utf-8');
  await fs.writeFile(filePath, existing + '\n' + entry, 'utf-8');
}

export async function readSoul(): Promise<string> {
  const filePath = path.join(GAME_DIR, 'SOUL.md');
  return fs.readFile(filePath, 'utf-8');
}

export async function readRules(): Promise<string> {
  const filePath = path.join(GAME_DIR, 'RULES.md');
  return fs.readFile(filePath, 'utf-8');
}

/* ─── Dice Engine ────────────────────────────────────── */

/**
 * Calculate the D&D-style modifier from a stat value
 * modifier = floor((stat - 10) / 2)
 */
export function getModifier(statValue: number): number {
  return Math.floor((statValue - 10) / 2);
}

/**
 * Roll a die with a given number of sides
 */
export function rollDie(sides: number = 20): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll a skill check: 1d20 + stat modifier vs difficulty class
 */
export function rollSkillCheck(
  statValue: number,
  dc: number,
  statName: string
): DiceRoll {
  const roll = rollDie(20);
  const modifier = getModifier(statValue);
  const total = roll + modifier;
  const isCritical = roll === 20;
  const isCritFail = roll === 1;
  const success = isCritical || (!isCritFail && total >= dc);

  return {
    roll,
    modifier,
    total,
    sides: 20,
    statUsed: statName,
    dc,
    success,
    isCritical,
    isCritFail,
  };
}

/**
 * Roll damage: parse "1d6+2" format
 */
export function rollDamage(damageStr: string): number {
  const match = damageStr.match(/(\d+)d(\d+)(?:\+(\d+))?/);
  if (!match) return 0;
  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const bonus = match[3] ? parseInt(match[3]) : 0;
  let total = bonus;
  for (let i = 0; i < count; i++) {
    total += rollDie(sides);
  }
  return total;
}

/* ─── XP & Leveling ──────────────────────────────────── */

const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

export function checkLevelUp(player: PlayerState): {
  leveledUp: boolean;
  newLevel: number;
  hpIncrease: number;
  manaIncrease: number;
} {
  const nextThreshold = XP_THRESHOLDS[player.level] || player.experience.next_level;
  if (player.experience.current >= nextThreshold) {
    const newLevel = player.level + 1;
    const hpIncrease = 8 + getModifier(player.stats.constitution);
    const manaIncrease = 5 + getModifier(player.stats.intelligence);
    return { leveledUp: true, newLevel, hpIncrease, manaIncrease };
  }
  return { leveledUp: false, newLevel: player.level, hpIncrease: 0, manaIncrease: 0 };
}

/**
 * Determine the stat used for a given action type
 */
export function determineSkillStat(action: string): { stat: string; dc: number } {
  const actionLower = action.toLowerCase();

  // Combat actions
  if (/attack|strike|hit|slash|stab|fight|punch|kick/.test(actionLower)) {
    return { stat: 'strength', dc: 12 };
  }
  // Stealth & agility
  if (/sneak|hide|dodge|evade|climb|jump|acrobat|stealth|pick\s*lock/.test(actionLower)) {
    return { stat: 'dexterity', dc: 14 };
  }
  // Magic & knowledge
  if (/cast|spell|magic|arcane|enchant|decipher|read\s*rune|study|analyze|investigate/.test(actionLower)) {
    return { stat: 'intelligence', dc: 13 };
  }
  // Perception & insight
  if (/look|search|inspect|examine|perceive|sense|listen|spot|detect/.test(actionLower)) {
    return { stat: 'wisdom', dc: 11 };
  }
  // Social
  if (/talk|persuade|intimidate|charm|negotiate|bribe|deceive|lie|bluff/.test(actionLower)) {
    return { stat: 'charisma', dc: 13 };
  }
  // Endurance
  if (/endure|resist|survive|tank|push|force|break|lift|pull/.test(actionLower)) {
    return { stat: 'constitution', dc: 13 };
  }
  // Rest action
  if (/rest|sleep|camp|meditate|heal/.test(actionLower)) {
    return { stat: 'constitution', dc: 5 };
  }
  // Default: general exploration
  return { stat: 'wisdom', dc: 10 };
}
