'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollText, ChevronDown } from 'lucide-react';

export interface StoryEntry {
  id: string;
  narration: string;
  mechanics?: {
    diceRoll?: {
      roll: number;
      modifier: number;
      total: number;
      sides: number;
      statUsed: string;
      dc: number;
      success: boolean;
      isCritical: boolean;
      isCritFail: boolean;
    };
    commitType: string;
    commitDescription: string;
  };
}

interface StoryLogProps {
  entries: StoryEntry[];
}

function MechanicsBlock({
  mechanics,
}: {
  mechanics: NonNullable<StoryEntry['mechanics']>;
}) {
  const [expanded, setExpanded] = useState(false);

  const { diceRoll, commitType, commitDescription } = mechanics;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-mono text-[var(--color-muted)] hover:text-[var(--color-cyber-light)] transition-colors"
      >
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          <ChevronDown size={14} />
        </motion.span>
        <span className="uppercase tracking-wider">Mechanics</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 rounded-lg bg-[var(--color-void-lighter)] border border-[var(--color-border)] font-mono text-xs space-y-2">
              {/* Dice Roll */}
              {diceRoll && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--color-muted)]">d{diceRoll.sides}:</span>
                    <span
                      className={`font-bold ${
                        diceRoll.isCritical
                          ? 'text-[var(--color-gold-light)]'
                          : diceRoll.isCritFail
                            ? 'text-[var(--color-blood-light)]'
                            : 'text-[var(--color-silver)]'
                      }`}
                    >
                      {diceRoll.roll}
                    </span>
                    {diceRoll.modifier !== 0 && (
                      <>
                        <span className="text-[var(--color-dim)]">
                          {diceRoll.modifier > 0 ? '+' : ''}
                          {diceRoll.modifier}
                        </span>
                        <span className="text-[var(--color-dim)]">=</span>
                        <span className="text-[var(--color-silver)] font-bold">
                          {diceRoll.total}
                        </span>
                      </>
                    )}
                    <span className="text-[var(--color-dim)]">vs DC {diceRoll.dc}</span>
                  </div>

                  {/* Result indicator */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold ${
                      diceRoll.isCritical
                        ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold-light)] border border-[var(--color-gold)]/30'
                        : diceRoll.isCritFail
                          ? 'bg-[var(--color-blood)]/20 text-[var(--color-blood-light)] border border-[var(--color-blood)]/30'
                          : diceRoll.success
                            ? 'bg-[var(--color-emerald)]/20 text-[var(--color-emerald-light)] border border-[var(--color-emerald)]/30'
                            : 'bg-[var(--color-muted)]/20 text-[var(--color-dim)] border border-[var(--color-muted)]/30'
                    }`}
                  >
                    {diceRoll.isCritical
                      ? 'Critical!'
                      : diceRoll.isCritFail
                        ? 'Crit Fail!'
                        : diceRoll.success
                          ? 'Success'
                          : 'Failure'}
                  </span>

                  {/* Stat badge */}
                  <span className="px-2 py-0.5 rounded bg-[var(--color-arcane)]/15 text-[var(--color-arcane-light)] border border-[var(--color-arcane)]/25 text-[10px] uppercase tracking-wider">
                    {diceRoll.statUsed}
                  </span>
                </div>
              )}

              {/* Commit info */}
              <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${
                    commitType === 'major'
                      ? 'bg-[var(--color-arcane)]/20 text-[var(--color-arcane-light)]'
                      : commitType === 'minor'
                        ? 'bg-[var(--color-cyber)]/20 text-[var(--color-cyber-light)]'
                        : 'bg-[var(--color-muted)]/20 text-[var(--color-dim)]'
                  }`}
                >
                  {commitType}
                </span>
                <span className="text-[var(--color-muted)] truncate">
                  {commitDescription}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StoryLog({ entries }: StoryLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [entries.length]);

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
        <ScrollText size={18} className="text-[var(--color-arcane-light)]" />
        <h2 className="font-display text-sm font-semibold tracking-wide text-[var(--color-silver)]">
          📜 Chronicle
        </h2>
        <span className="ml-auto text-[10px] font-mono text-[var(--color-dim)] uppercase tracking-widest">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Scrollable log */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {entries.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-4"
            >
              <ScrollText
                size={40}
                className="text-[var(--color-arcane-dark)]"
              />
            </motion.div>
            <p className="font-display text-sm text-[var(--color-dim)] italic tracking-wide">
              The chronicle awaits your first action...
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-2 font-mono">
              Your story is unwritten. Forge your destiny.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative pl-4 border-l-2 border-[var(--color-arcane)]/30"
              >
                {/* Narration */}
                <p className="font-body text-sm leading-relaxed text-[var(--color-silver)]/90">
                  {entry.narration}
                </p>

                {/* Mechanics */}
                {entry.mechanics && (
                  <MechanicsBlock mechanics={entry.mechanics} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer to match mockup */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-border)] text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider shrink-0 bg-[var(--color-void)]/50">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--color-arcane-light)]">📖</span>
          <span>Archive Secure</span>
        </div>
        <span>Chronicle Engine v2.7</span>
      </div>
    </div>
  );
}
