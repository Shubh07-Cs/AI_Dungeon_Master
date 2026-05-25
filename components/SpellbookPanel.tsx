'use client';

import { motion } from 'motion/react';
import { BookOpen, Zap, Droplet } from 'lucide-react';

const ABILITIES_DB: Record<string, { description: string; mana: number; type: string; damage?: string }> = {
  "Arcane Strike": {
    description: "Infuses your weapon with raw arcane energy, dealing bonus magic damage on your next strike.",
    mana: 5,
    type: "Offensive",
    damage: "1d6 Arcane",
  },
  "Shadow Step": {
    description: "Slip through the spaces between seconds, teleporting up to 30 feet to an unoccupied space you can see.",
    mana: 8,
    type: "Utility",
  },
  "Fireball": {
    description: "Hurls a sphere of compressed flame that detonates on impact.",
    mana: 15,
    type: "Offensive",
    damage: "3d6 Fire",
  },
  "Heal": {
    description: "Channels restorative magic to mend wounds.",
    mana: 10,
    type: "Restoration",
  }
};

interface SpellbookPanelProps {
  abilities: string[];
  currentMana: number;
  onCastSpell: (spell: string) => void;
}

export default function SpellbookPanel({ abilities, currentMana, onCastSpell }: SpellbookPanelProps) {
  return (
    <motion.div
      className="glass-panel p-4 flex flex-col gap-3 h-full overflow-y-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-2 border-b border-[var(--color-border)] pb-2">
        <BookOpen className="text-[var(--color-arcane)] w-5 h-5" />
        <h2 className="font-display text-lg font-bold text-glow-arcane text-[var(--color-arcane-light)]">
          Spellbook
        </h2>
      </div>

      {abilities.length === 0 ? (
        <div className="text-center text-[var(--color-dim)] font-mono text-sm py-8 italic">
          Your spellbook is empty.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {abilities.map((abilityName) => {
            const spell = ABILITIES_DB[abilityName] || {
              description: "An unknown arcane art.",
              mana: 0,
              type: "Unknown",
            };
            
            const canCast = currentMana >= spell.mana;

            return (
              <motion.div 
                key={abilityName}
                className={`p-3 rounded-lg border bg-[var(--color-void-lighter)] flex flex-col gap-2 transition-colors ${
                  canCast ? 'border-[var(--color-arcane)]/30 hover:border-[var(--color-arcane)]' : 'border-[var(--color-border)] opacity-60 grayscale'
                }`}
                whileHover={canCast ? { scale: 1.02 } : {}}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-bold text-[var(--color-silver)]">{abilityName}</h3>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-dim)]">
                      {spell.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-[var(--color-cyber-light)]">
                    <Droplet className="w-3 h-3 text-[var(--color-cyber)]" />
                    {spell.mana} MP
                  </div>
                </div>

                <p className="text-xs text-[var(--color-muted)] font-body leading-relaxed">
                  {spell.description}
                </p>

                {spell.damage && (
                  <div className="text-xs font-mono text-[var(--color-blood-light)] flex items-center gap-1 mt-1">
                    <Zap className="w-3 h-3" />
                    Damage: {spell.damage}
                  </div>
                )}

                <button
                  onClick={() => canCast && onCastSpell(`I cast ${abilityName}`)}
                  disabled={!canCast}
                  className={`mt-2 py-1.5 w-full rounded text-xs font-mono uppercase tracking-widest font-bold transition-all ${
                    canCast 
                      ? 'bg-[var(--color-arcane)]/20 text-[var(--color-arcane-light)] border border-[var(--color-arcane)]/50 hover:bg-[var(--color-arcane)]/40 hover:glow-arcane' 
                      : 'bg-transparent text-[var(--color-dim)] border border-[var(--color-border)] cursor-not-allowed'
                  }`}
                >
                  {canCast ? 'Cast Spell' : 'Insufficient Mana'}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
