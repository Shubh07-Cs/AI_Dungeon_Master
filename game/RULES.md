# RULES — ChronosRPG Gameplay Mechanics

> *"The dice do not lie. The dice do not care. The dice are the only honest things left in this world."*

---

## 1. Core Dice System

All uncertain outcomes are resolved with a **1d20 roll** plus the relevant **stat modifier**.

```
Result = 1d20 + Stat Modifier + Equipment Bonuses + Status Effect Modifiers
```

The result is compared against a **Difficulty Class (DC)** for skill checks, or an **Armor Class (AC)** for attack rolls.

- **Meet or exceed the DC/AC** → Success  
- **Fall below the DC/AC** → Failure  
- **Natural 20** → Critical Success (automatic success + bonus effect)  
- **Natural 1** → Critical Failure (automatic failure + negative consequence)

---

## 2. Stat Modifiers

Every stat has a derived modifier used in all checks, attacks, and saves.

```
Modifier = floor((Stat - 10) / 2)
```

| Stat Value | Modifier |
|:----------:|:--------:|
| 1          | -5       |
| 2–3        | -4       |
| 4–5        | -3       |
| 6–7        | -2       |
| 8–9        | -1       |
| 10–11      | +0       |
| 12–13      | +1       |
| 14–15      | +2       |
| 16–17      | +3       |
| 18–19      | +4       |
| 20         | +5       |

---

## 3. Difficulty Classes

| DC  | Difficulty    | Example                                                    |
|:---:|:-------------:|:-----------------------------------------------------------|
| 5   | Trivial       | Kicking open a rotted door                                 |
| 8   | Easy          | Climbing a rusted fire escape                              |
| 10  | Moderate      | Picking a standard mag-lock                                |
| 13  | Challenging   | Deciphering a corrupted rune-circuit                       |
| 15  | Hard          | Hacking a military-grade ward terminal                     |
| 18  | Very Hard     | Persuading a paranoid guild master to share secrets         |
| 20  | Extreme       | Disarming an elder glyph-trap mid-combat                   |
| 25  | Legendary     | Negotiating with a dragon whose hoard you just raided      |
| 30  | Impossible    | Rewriting the laws of the Chrono-Engine barehanded         |

The GM sets the DC based on context. Environmental factors, status effects, and equipment may grant **advantage** (+3) or **disadvantage** (-3) at GM discretion.

---

## 4. Skill Checks

Each skill check is tied to a primary stat. The GM may allow alternate stats with narrative justification.

| Skill              | Primary Stat  | Example Action                                     |
|:-------------------|:-------------:|:---------------------------------------------------|
| Sneaking           | DEX           | Slipping past a sentry drone                       |
| Lockpicking        | DEX           | Cracking a rune-sealed vault                       |
| Acrobatics         | DEX           | Leaping across collapsing catwalks                  |
| Persuasion         | CHA           | Convincing a merchant to lower prices               |
| Intimidation       | CHA           | Threatening a gang lieutenant into retreat           |
| Deception          | CHA           | Bluffing past a checkpoint with a forged ID glyph   |
| Investigation      | INT           | Analyzing a crime scene in the undercity            |
| Arcana             | INT           | Identifying a spell from its residual signature      |
| Hacking            | INT           | Overriding a security protocol                      |
| Athletics          | STR           | Breaking through a barricade                        |
| Grappling          | STR           | Restraining a thrashing chrono-beast                |
| Perception         | WIS           | Noticing a hidden trap in a corridor                |
| Survival           | WIS           | Navigating the toxic wastes between sectors         |
| Medicine           | WIS           | Stabilizing a wounded ally with a med-patch         |
| History / Lore     | INT           | Recalling the fall of the Old Kingdom               |

---

## 5. Combat System

### 5.1 Initiative

At the start of combat, all participants roll initiative:

```
Initiative = 1d20 + DEX modifier
```

Turn order proceeds from **highest to lowest**. Ties are broken by DEX stat (higher goes first). If still tied, the player acts first.

### 5.2 Actions Per Turn

Each combatant gets **one turn per round**, consisting of:

| Action Type    | Description                                          |
|:---------------|:-----------------------------------------------------|
| **Action**     | Attack, Cast Spell, Use Item, Dodge, Disengage, Help |
| **Bonus Action** | Off-hand attack (if dual-wielding), quick ability, or item swap |
| **Movement**   | Move up to 30 ft (6 grid squares)                    |
| **Reaction**   | One per round — opportunity attack, parry, counterspell |

### 5.3 Attack Rolls

```
Attack Roll = 1d20 + Stat Modifier + Weapon Bonus
```

- **Melee attacks** use **STR** modifier (or DEX for finesse weapons)
- **Ranged attacks** use **DEX** modifier
- **Spell attacks** use **INT** modifier

If the Attack Roll **≥ target's AC**, the attack hits.

### 5.4 Damage Rolls

On a hit:
```
Damage = Weapon Damage Die + Stat Modifier
```

- **Melee weapons:** damage die + STR modifier (or DEX for finesse)
- **Ranged weapons:** damage die + DEX modifier
- **Spells:** damage die + INT modifier

### 5.5 Armor Class (AC)

```
AC = 10 + Armor Bonus + DEX Modifier (if armor allows)
```

| Armor Type | DEX Modifier Allowed | Examples                        |
|:-----------|:--------------------:|:--------------------------------|
| None       | Full DEX mod         | Unarmored street clothes         |
| Light      | Full DEX mod         | Synth-Leather Jerkin, Glitch-Weave Coat |
| Medium     | Max +2 DEX           | Rune-Plated Vest, Carbon-Mesh Hauberk |
| Heavy      | No DEX mod           | Cathedral Plate, Siege Exoframe  |
| Shield     | +2 flat bonus        | Hex-Barrier Buckler              |

### 5.6 Critical Hits (Natural 20)

- The attack **automatically hits** regardless of AC
- **Roll damage dice twice** (double the dice, not the modifier)
- The GM narrates a **cinematic moment** of devastating impact

Example: A `1d6+1` weapon on a crit deals `2d6+1` damage.

### 5.7 Critical Failures (Natural 1)

- The attack **automatically misses** regardless of bonuses
- A **negative consequence** occurs at GM discretion:
  - Weapon jams or is dropped
  - Spell backfires (caster takes 1d4 damage)
  - Ally is accidentally struck
  - Position is compromised (enemies gain advantage next turn)

### 5.8 Opportunity Attacks

When a hostile creature leaves your melee range without Disengaging, you may use your **Reaction** to make one melee attack against it.

---

## 6. Spellcasting

### 6.1 Overview

Spellcasting draws from the character's **Mana** pool. All spellcasting checks use the **INT** modifier.

```
Spell Attack = 1d20 + INT Modifier
Spell Save DC = 8 + INT Modifier + Proficiency (level/2, rounded up)
```

### 6.2 Mana Costs

| Spell Tier   | Mana Cost | Minimum Level | Example Spells                        |
|:-------------|:---------:|:-------------:|:--------------------------------------|
| Cantrip      | 0         | 1             | Spark Bolt, Mage Hand, Minor Ward     |
| Tier 1       | 3         | 1             | Arcane Strike, Shield Glyph, Hex Pulse |
| Tier 2       | 5         | 3             | Shadow Step, Chain Lightning, Firewall |
| Tier 3       | 8         | 5             | Chrono Stutter, Void Lance, Mass Heal  |
| Tier 4       | 12        | 7             | Time Rip, Cataclysm, Resurrection     |
| Tier 5       | 20        | 10            | Chrono-Engine Override, Reality Splice  |

### 6.3 Mana Regeneration

- **Short Rest:** Recover 25% of max mana (rounded down)
- **Long Rest:** Recover 100% of max mana
- **Mana Shards:** Consumable items that restore fixed mana amounts

### 6.4 Concentration

Some spells require **concentration**. A character can only concentrate on one spell at a time. Taking damage requires a **CON check (DC 10 or half damage, whichever is higher)** to maintain concentration.

---

## 7. Leveling & Experience

### 7.1 XP Thresholds

| Level | Total XP Required | HP Bonus | Stat Point | New Ability |
|:-----:|:-----------------:|:--------:|:----------:|:-----------:|
| 1     | 0                 | —        | —          | —           |
| 2     | 100               | +8       | +1         | Yes         |
| 3     | 300               | +8       | —          | Yes         |
| 4     | 600               | +10      | +1         | —           |
| 5     | 1,000             | +10      | +1         | Yes         |
| 6     | 1,500             | +12      | —          | —           |
| 7     | 2,100             | +12      | +1         | Yes         |
| 8     | 2,800             | +14      | —          | —           |
| 9     | 3,600             | +14      | +1         | Yes         |
| 10    | 4,500             | +16      | +1         | Yes         |

### 7.2 XP Awards

| Source                          | XP Range     |
|:--------------------------------|:------------:|
| Minor enemy defeated            | 15–30 XP     |
| Standard enemy defeated         | 30–60 XP     |
| Elite enemy defeated            | 60–120 XP    |
| Boss enemy defeated             | 150–300 XP   |
| Puzzle / trap solved            | 20–50 XP     |
| Quest milestone                 | 50–100 XP    |
| Quest completed                 | 100–250 XP   |
| Exceptional roleplay / creative solution | 10–30 XP |
| Discovery (new area / lore)     | 10–25 XP     |

### 7.3 Level-Up Procedure

When `experience.current >= experience.next_level`:
1. Increment `level` by 1
2. Increase `health.max` by the HP bonus from the table above
3. Fully restore `health.current` and `mana.current`
4. If a stat point is granted, the player chooses which stat to increase by 1
5. If a new ability is granted, present 2–3 class-appropriate options for the player to choose
6. Update `experience.next_level` to the next threshold
7. Commit: `game: LEVEL_UP | Aelias reached Level X — [summary of gains]`

---

## 8. Status Effects

Status effects modify checks, combat, and behavior. They persist until cured, expired, or removed by rest/spell.

| Effect     | Mechanical Impact                                  | Duration       | Cure                            |
|:-----------|:---------------------------------------------------|:---------------|:--------------------------------|
| **Poisoned**   | -2 penalty to ALL checks and attack rolls      | 3 turns or cure | Antidote, Medicine check DC 13, Long Rest |
| **Stunned**    | Skip next turn entirely, AC reduced by 2       | 1 turn         | Automatic (wears off after 1 turn) |
| **Blessed**    | +2 bonus to ALL checks and attack rolls        | 3 turns        | Automatic (wears off after 3 turns) |
| **Burning**    | Take 5 fire damage at the start of each turn   | Until extinguished | Action to extinguish, water, spell |
| **Frozen**     | Movement halved, DEX checks at disadvantage (-3) | 2 turns or fire damage | Fire damage, Long Rest |
| **Cursed**     | -1 to ALL stats (recalculate modifiers)        | Until dispelled | Remove Curse spell, specific quest |
| **Blinded**    | All attack rolls at disadvantage (-3), auto-fail sight-based checks | 2 turns | Heal spell, Medicine check DC 12 |
| **Frightened** | Cannot willingly move toward source of fear, -2 to attacks | 2 turns | WIS check DC 13 at end of each turn |
| **Hasted**     | +1 bonus action per turn, +2 to initiative     | 2 turns        | Automatic |
| **Silenced**   | Cannot cast spells with verbal components       | 2 turns        | Dispel Magic, Long Rest |

Multiple status effects **stack**. A creature can be both Poisoned and Burning simultaneously.

---

## 9. Death & The Time Loop

### 9.1 Death Trigger

When `health.current` reaches **0**, the character is **dead**. There are no death saving throws. There is no last stand. The neon fades. The screen goes dark.

### 9.2 Death Procedure

1. Set `health.current` to 0 in `player.json`
2. Append an **obituary** to `world/chronicle.md`:
   ```
   ## ☠ Obituary — [Character Name]
   **Fell on Turn:** [turns_played]
   **Cause of Death:** [description]
   **Final Location:** [current_location]
   **Kills:** [kill_count]
   **Final Words:** [GM-crafted last words or thought]
   ```
3. Output the `[GAME OVER]` block as defined in SOUL.md
4. Commit: `game: DEATH | [Character Name] slain by [cause] — time loop initiated`

### 9.3 Resurrection via Git

The only escape from death is **time travel** — reverting to a previous git commit:
```bash
git log --oneline          # View the timeline
git checkout <commit-hash> # Step back through time
```

This is canonical. The Chrono-Engine within the lore is the git history. Death is not the end — it's a branch point.

---

## 10. Resting

### 10.1 Short Rest

- **Duration:** 1 turn (the player skips one action turn)
- **HP Recovery:** Restore **25% of max HP** (rounded down)
- **Mana Recovery:** Restore **25% of max Mana** (rounded down)
- **Status Effects:** No effect on active status effects
- **Restrictions:** Cannot short rest during combat or while a status effect deals damage (e.g., Burning)

### 10.2 Long Rest

- **Duration:** Requires a safe location; skips **1 full turn**
- **HP Recovery:** Restore to **100% of max HP**
- **Mana Recovery:** Restore to **100% of max Mana**
- **Status Effects:** Removes Poisoned, Frozen, Blinded, Silenced. Does NOT remove Cursed.
- **Restrictions:** Cannot long rest if enemies are within proximity. Random encounter roll (1d20; encounter on natural 1–3)

---

## 11. Loot Tables

### 11.1 By Area Difficulty

#### Low Threat Areas (Sectors 1–3)
| d20 Roll | Loot                                    |
|:--------:|:----------------------------------------|
| 1–5      | Nothing                                 |
| 6–10     | 1d6 gold                                |
| 11–14    | Minor Elixir of Restoration (15 HP)     |
| 15–17    | Fractured Mana Shard (10 Mana)          |
| 18–19    | Common weapon or armor piece            |
| 20       | Uncommon item + 2d6 gold               |

#### Medium Threat Areas (Sectors 4–6)
| d20 Roll | Loot                                    |
|:--------:|:----------------------------------------|
| 1–3      | Nothing                                 |
| 4–8      | 2d6 gold                                |
| 9–12     | Standard Elixir of Restoration (30 HP)  |
| 13–15    | Mana Crystal (20 Mana)                  |
| 16–18    | Uncommon weapon or armor piece          |
| 19       | Rare item + 3d6 gold                   |
| 20       | Rare item + enchantment scroll          |

#### High Threat Areas (Sectors 7–9)
| d20 Roll | Loot                                    |
|:--------:|:----------------------------------------|
| 1–2      | Nothing                                 |
| 3–6      | 3d6 gold                                |
| 7–10     | Greater Elixir of Restoration (50 HP)   |
| 11–13    | Resonant Mana Core (full mana restore)  |
| 14–16    | Rare weapon or armor piece              |
| 17–19    | Epic item + 4d6 gold                   |
| 20       | Legendary item + Chrono-Fragment        |

#### Boss Chambers
| Loot                                                    |
|:--------------------------------------------------------|
| Guaranteed: 1 Rare or Epic item + 5d10 gold             |
| 50% chance: Legendary item                              |
| 25% chance: Chrono-Fragment (key quest item)             |
| Always: Quest-relevant lore item or key                  |

### 11.2 Item Rarities

| Rarity      | Color Code | Modifier Range | Drop Chance |
|:------------|:-----------|:--------------:|:-----------:|
| Common      | ⬜ White    | +0 to +1       | 60%         |
| Uncommon    | 🟢 Green   | +1 to +2       | 25%         |
| Rare        | 🔵 Blue    | +2 to +3       | 10%         |
| Epic        | 🟣 Purple  | +3 to +4       | 4%          |
| Legendary   | 🟡 Gold    | +4 to +5       | 1%          |

---

## 12. Gold Economy

### 12.1 Merchant Prices (Base)

| Category             | Price Range      |
|:---------------------|:----------------:|
| Minor consumable     | 5–15 gold        |
| Standard consumable  | 15–30 gold       |
| Greater consumable   | 30–60 gold       |
| Common gear          | 10–25 gold       |
| Uncommon gear        | 25–75 gold       |
| Rare gear            | 75–200 gold      |
| Epic gear            | 200–500 gold     |
| Legendary gear       | 500–1,500 gold   |
| Ammunition (×10)     | 5 gold           |
| Lodging (long rest)  | 5–20 gold        |
| Information / rumors | 10–50 gold       |

### 12.2 Selling

Players sell items at **50% of base value** (rounded down). Quest items cannot be sold.

### 12.3 Haggling

A **CHA check** against the merchant's DC can modify prices:
- **Success:** 10% discount on purchase / 10% bonus on sale
- **Critical Success:** 20% discount / 20% bonus
- **Failure:** No change
- **Critical Failure:** Merchant is offended — prices increase by 10% for this visit

---

## 13. Encounter Difficulty Scaling

The GM should calibrate encounters relative to the player's level:

| Encounter Tier | Enemy HP Range | Enemy AC | Damage/Round | XP Value    |
|:---------------|:--------------:|:--------:|:------------:|:-----------:|
| Minion         | 8–15           | 10–12    | 1d4+1        | 15–25 XP    |
| Standard       | 15–35          | 12–14    | 1d6+2        | 30–60 XP    |
| Elite          | 35–70          | 14–16    | 1d8+3        | 60–120 XP   |
| Boss           | 70–150         | 16–19    | 1d10+5       | 150–300 XP  |
| Legendary      | 150+           | 19+      | 2d8+6        | 300+ XP     |

---

*These rules are immutable law. The dice are cast. The Engine turns.*
