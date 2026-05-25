'use client';

import { useRef, useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollText, ChevronDown, Terminal, BookOpen, AlertTriangle } from 'lucide-react';

export interface StoryEntry {
  id: string;
  immersiveLore: string;
  tacticalSummary: string;
  engineAlert: string | null;
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
    threatDetected?: string | null;
    objective?: string | null;
  };
}

interface StoryLogProps {
  entries: StoryEntry[];
  uiMode: 'tactical' | 'immersive';
  onToggleUiMode: () => void;
}

function MechanicsBlock({
  mechanics,
  defaultExpanded = false
}: {
  mechanics: NonNullable<StoryEntry['mechanics']>;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Update expanded state if defaultExpanded changes
  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const { diceRoll, commitType, commitDescription, threatDetected, objective } = mechanics;

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
              
              {/* Context row: Threat & Objective */}
              {(threatDetected || objective) && (
                <div className="flex flex-wrap gap-3 pb-2 border-b border-[var(--color-border)]">
                  {threatDetected && (
                    <div className="flex items-center gap-1.5 text-[var(--color-blood-light)]">
                      <AlertTriangle size={12} />
                      <span>THREAT: {threatDetected}</span>
                    </div>
                  )}
                  {objective && (
                    <div className="flex items-center gap-1.5 text-[var(--color-gold-light)]">
                      <span className="text-lg leading-none">⚑</span>
                      <span>OBJ: {objective}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Dice Roll */}
              {diceRoll && (
                <div className="flex items-center gap-3 flex-wrap pt-1">
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
              <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)] mt-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${
                    commitType === 'COMBAT' || commitType === 'DEATH'
                      ? 'bg-[var(--color-blood)]/20 text-[var(--color-blood-light)]'
                      : commitType === 'LEVEL_UP'
                        ? 'bg-[var(--color-emerald)]/20 text-[var(--color-emerald-light)]'
                        : commitType === 'LOOT' || commitType === 'QUEST'
                          ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold-light)]'
                          : commitType === 'MAGIC'
                            ? 'bg-[var(--color-arcane)]/20 text-[var(--color-arcane-light)]'
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

const StoryEntryItem = memo(function StoryEntryItem({ 
  entry, 
  isHighlighted,
  uiMode
}: { 
  entry: StoryEntry;
  isHighlighted?: boolean;
  uiMode: 'tactical' | 'immersive';
}) {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative pl-4 border-l-2 transition-colors duration-500 ${
        isHighlighted 
          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 py-2 rounded-r' 
          : uiMode === 'tactical' 
            ? 'border-[var(--color-cyber)]/40' 
            : 'border-[var(--color-arcane)]/30'
      }`}
    >
      {uiMode === 'tactical' ? (
        <div className="space-y-1">
          <p className="font-mono text-sm leading-relaxed text-[var(--color-cyber-light)]">
            <span className="text-[var(--color-dim)] mr-2">&gt;</span>
            {entry.tacticalSummary}
          </p>
          {entry.engineAlert && (
            <p className="font-mono text-xs text-[var(--color-gold-light)] bg-[var(--color-gold)]/10 px-2 py-1 rounded inline-block">
              {entry.engineAlert}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-body text-sm leading-relaxed text-[var(--color-silver)]/90 whitespace-pre-wrap">
            {entry.immersiveLore}
          </p>
        </div>
      )}

      {/* Mechanics */}
      {entry.mechanics && (
        <MechanicsBlock 
          mechanics={entry.mechanics} 
          defaultExpanded={uiMode === 'tactical'} 
        />
      )}
    </motion.div>
  );
});

export default memo(function StoryLog({ entries, uiMode, onToggleUiMode }: StoryLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Auto-scroll to bottom on new entries if not highlighting
  useEffect(() => {
    if (highlightedId) return;
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [entries.length, highlightedId]);

  // Listen for timeline highlight events
  useEffect(() => {
    const handleHighlight = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const description = customEvent.detail;
      
      const matchingEntry = entries.find(
        (entry) => entry.mechanics?.commitDescription === description
      );
      
      if (matchingEntry) {
        setHighlightedId(matchingEntry.id);
        // Clear highlight after a few seconds
        setTimeout(() => setHighlightedId(null), 3000);
      }
    };

    window.addEventListener('highlight-log', handleHighlight);
    return () => window.removeEventListener('highlight-log', handleHighlight);
  }, [entries]);

  return (
    <div className="glass-panel flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
        {uiMode === 'tactical' ? (
          <Terminal size={18} className="text-[var(--color-cyber-light)]" />
        ) : (
          <ScrollText size={18} className="text-[var(--color-arcane-light)]" />
        )}
        <h2 className="font-display text-sm font-semibold tracking-wide text-[var(--color-silver)]">
          {uiMode === 'tactical' ? 'TERMINAL_LOG' : 'Chronicle'}
        </h2>
        
        {/* UI Mode Toggle */}
        <div className="ml-auto flex items-center bg-[var(--color-void-lighter)] rounded-full p-0.5 border border-[var(--color-border)]">
          <button
            onClick={onToggleUiMode}
            disabled={uiMode === 'tactical'}
            className={`flex items-center justify-center w-8 h-6 rounded-full transition-colors ${
              uiMode === 'tactical' 
                ? 'bg-[var(--color-cyber)]/20 text-[var(--color-cyber-light)]' 
                : 'text-[var(--color-dim)] hover:text-[var(--color-muted)]'
            }`}
            title="Tactical Mode"
          >
            <Terminal size={12} />
          </button>
          <button
            onClick={onToggleUiMode}
            disabled={uiMode === 'immersive'}
            className={`flex items-center justify-center w-8 h-6 rounded-full transition-colors ${
              uiMode === 'immersive' 
                ? 'bg-[var(--color-arcane)]/20 text-[var(--color-arcane-light)]' 
                : 'text-[var(--color-dim)] hover:text-[var(--color-muted)]'
            }`}
            title="Immersive Mode"
          >
            <BookOpen size={12} />
          </button>
        </div>
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
              {uiMode === 'tactical' ? '> Awaiting input stream...' : 'The chronicle awaits your first action...'}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <StoryEntryItem 
                key={entry.id} 
                entry={entry} 
                isHighlighted={entry.id === highlightedId}
                uiMode={uiMode}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-border)] text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider shrink-0 bg-[var(--color-void)]/50">
        <div className="flex items-center gap-1.5">
          <span className={uiMode === 'tactical' ? "text-[var(--color-cyber-light)]" : "text-[var(--color-arcane-light)]"}>
            {uiMode === 'tactical' ? '■' : '📖'}
          </span>
          <span>{uiMode === 'tactical' ? 'SYS_ONLINE' : 'Archive Secure'}</span>
        </div>
        <span>Chronicle Engine v2.7</span>
      </div>
    </div>
  );
});
