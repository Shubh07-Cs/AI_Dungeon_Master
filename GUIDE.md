# 📜 ChronosRPG — The Spellsword's Chronicle & Gameplay Manual

*“Reality is not a solid canvas. It is a sequence of commits, written in blood and data. And you carry the key to rewrite it.”*

Welcome, adventurer. This manual contains all the rules, formulas, and strategies required to survive the deep corridors of **Tenebris Machina** and master the temporal powers of **ChronosRPG**.

---

## 🔮 The Core Concept: Version-Controlled Fate

Unlike traditional RPGs, your choices in ChronosRPG are backed by **Git version control** (either physically on your local computer, or simulated in your browser session). 

* Every action you take is an **action commit** (represented by color-coded circles on your timeline).
* If you make a mistake, walk into a deadly trap, or die, you can **Time Travel**—restoring your character stats, items, and story back to any previous timeline node.
* If you want to explore an alternate path, you can **Branch Reality**, creating a separate gameplay timeline where you can test other decisions and switch back whenever you wish.

---

## 🎲 1. The Core Dice System

ChronosRPG utilizes a classic **1d20 system** (D&D 5e style) to resolve all active choices and checks.

$$\text{Check Total} = \text{1d20 Roll} + \text{Stat Modifier} + \text{Status Bonuses}$$

### Stat Modifiers
Your base attributes determine your modifiers. The higher the attribute, the stronger your modifier:

$$\text{Modifier} = \lfloor \frac{\text{Attribute} - 10}{2} \rfloor$$

| Attribute Value | Modifier | Attribute Value | Modifier |
| :---: | :---: | :---: | :---: |
| **8** | -1 | **16** | +3 |
| **10** | 0 | **18** | +4 |
| **12** | +1 | **20** | +5 |
| **14** | +2 | **22** | +6 |

---

## ⚔️ 2. Core Attributes & Action Mapping

The Game Master automatically scans the text actions you type and maps them to one of your **six core attributes** to resolve the outcome:

| Attribute | Triggers / Action Keywords | DC / Modifier Impact |
| :--- | :--- | :--- |
| **💪 Strength** | `attack`, `strike`, `hit`, `slash`, `fight`, `punch`, `force`, `break` | Determines physical melee damage and martial successes. |
| **🤸 Dexterity** | `sneak`, `hide`, `dodge`, `evade`, `climb`, `stealth`, `pick lock`, `acrobat` | Governs pick-locking, stealth operations, and trap evasions. |
| **🧠 Intelligence** | `cast`, `spell`, `magic`, `arcane`, `enchant`, `decipher`, `read runes` | Used for casting spells, deciphering ancient code, and scroll usage. |
| **👁️ Wisdom** | `look`, `search`, `inspect`, `examine`, `perceive`, `spot`, `detect` | Governs awareness, locating hidden items, and detecting traps. |
| **🗣️ Charisma** | `talk`, `persuade`, `negotiate`, `intimidate`, `bribe`, `deceive`, `lie` | Governs bartering, diplomatic dialogue, and intimidation checks. |
| **🛡️ Constitution** | `endure`, `resist`, `survive`, `rest`, `sleep`, `meditate`, `heal` | Determines health recovery during rests and resistance to poison/burns. |

### Difficulty Classes (DC)
The severity of your checks depends on the difficulty set by the GM narrator:
* **DC 5 (Trivial)**: Resting, inspecting an empty room.
* **DC 10 (Easy)**: Spotting a standard tripwire, lockpicking a rusted chest.
* **DC 13 (Medium)**: Striking a basic patrol drone, negotiating with a merchant.
* **DC 15 (Hard)**: Sneaking past an elite Glitch-Wraith, deciphering a spell server.
* **DC 20 (Very Hard)**: Dismantling a heavy security matrix, fighting a major boss.
* **DC 30 (Impossible)**: Bypassing the security logs of dead gods.

---

## 🛡️ 3. Combat, Spellcasting & Armor Class

When engaging in combat or spellcasting:

### Melee Combat
* Your Equipped Weapon determines your damage range (e.g. **Runic Vibro-Dagger: 1d6+1**).
* Attack rolls use **Strength** or **Dexterity** depending on the weapon type.
* Critical Hits (rolling a natural 20) double your damage and deal lethal blow effects.
* Critical Fails (rolling a natural 1) cause your weapons to malfunction or leave you disoriented.

### Spellcasting
* Casting a spell consumes **Mana**.
* Spell success rolls are calculated using **Intelligence** vs. the target's resistance.
* Failing a spellcheck still consumes mana but can cause chaotic magical glitches (such as the *Glitched* status effect).

### Armor Class (AC)
* Your **Armor Class** determines how difficult it is for enemies to deal damage to you.
* AC is calculated as:
  $$\text{AC} = 10 + \text{Dexterity Modifier} + \text{Equipped Armor AC Bonus}$$
* Standard starting equipment gives you an **AC of 12** (Synth-Leather Jerkin + Dex modifier).

---

## 🧪 4. Status Effects Glossary

Status effects alter your character modifiers and tick down or apply damage every turn.

| Effect | Icon | Modifier Impact | Combat / Turn Impact |
| :--- | :---: | :--- | :--- |
| **Blessed** | ✨ | **+2** to all skill rolls | Surrounded by divine code, shields you from harm. |
| **Blessed (High)** | 🌟 | **+4** to all skill rolls | Power surge of pure magic. |
| **Poisoned** | 🤢 | **-2** to all skill rolls | Toxicity bogs down your reaction speed. |
| **Burning** | 🔥 | None | Deals **5 damage** to health every turn. |
| **Stunned** | 🌀 | None | Skips your active combat turn, leaving you vulnerable. |
| **Glitched** | 👾 | Random | Your stats fluctuate erratically between turns. |
| **Cursed** | 💀 | **-1** to all base stats | Restricts your maximum attributes until cleansed. |

---

## 📈 5. Progression & Level-Ups

Defeating cybernetic anomalies, finding lost data-shards, and solving quests grants **Experience Points (XP)**. 

### XP Thresholds
Reaching standard thresholds automatically triggers a **Level Up**, instantly healing you to full and increasing your thresholds:
* **Level 1**: 0 XP
* **Level 2**: 100 XP
* **Level 3**: 300 XP
* **Level 4**: 600 XP
* **Level 5**: 1,000 XP
* *Formula:* Next threshold scales exponentially based on your level.

### Level Up Benefits
* Max HP increases permanently by $+8 + \text{Constitution modifier}$.
* Max Mana increases permanently by $+5 + \text{Intelligence modifier}$.
* Health and Mana are fully restored.

---

## ⏳ 6. Temporal Time Travel Guide

When your health drops to **0 HP**, your character experiences a **Temporal Collapse**. 

```
 💀 TEMPORAL COLLAPSE DETECTED
 Your consciousness fractures across the timeline.
 Use Time Travel to restore a previous reality anchor.
```

### Escape Death:
1. Do not panic. The dashboard overlay will lock, displaying the timeline of past commits.
2. Review the timeline nodes. Look for a stable node before the encounter (e.g. `Turn 11 — Rested in safe room`).
3. Click the node and confirm the recall.
4. **Reality Restored**: Your character sheet, HP, inventory bags, and narrative chronicle are instantly rolled back to that exact turn!
5. Approach the threat differently—sneaking, spellcasting, or fleeing are highly viable choices.
