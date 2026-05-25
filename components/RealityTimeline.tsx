'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitBranch, Clock, GitCommit, X } from 'lucide-react';

interface TimelineEntry {
  hash: string;
  hashShort: string;
  date: string;
  message: string;
  type: string;
  description: string;
  isCurrent: boolean;
}

interface RealityTimelineProps {
  timeline: TimelineEntry[];
  onTimeTravel: (hash: string) => void;
  currentBranch: string;
  onCreateBranch: (name: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  LOOT: '#f59e0b',
  COMBAT: '#ef4444',
  LEVEL_UP: '#10b981',
  EXPLORE: '#06b6d4',
  STEALTH: '#64748b',
  MAGIC: '#8b5cf6',
  DEATH: '#991b1b',
  REST: '#3b82f6',
  QUEST: '#d97706',
  SYSTEM: '#475569',
};

function getNodeColor(type: string): string {
  return TYPE_COLORS[type] || TYPE_COLORS.SYSTEM;
}

export default function RealityTimeline({
  timeline,
  onTimeTravel,
  currentBranch,
  onCreateBranch,
}: RealityTimelineProps) {
  const [tooltip, setTooltip] = useState<{
    entry: TimelineEntry;
    x: number;
    y: number;
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<TimelineEntry | null>(null);
  const [branchModal, setBranchModal] = useState(false);
  const [branchName, setBranchName] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the rightmost (current) node on mount / timeline change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [timeline]);

  const handleNodeClick = (entry: TimelineEntry) => {
    if (entry.isCurrent) return;
    setConfirmModal(entry);
  };

  const handleConfirmTravel = () => {
    if (confirmModal) {
      onTimeTravel(confirmModal.hash);
      setConfirmModal(null);
    }
  };

  const handleCreateBranch = () => {
    if (branchName.trim()) {
      onCreateBranch(branchName.trim());
      setBranchName('');
      setBranchModal(false);
    }
  };

  // Reverse so oldest is on the left, newest on the right
  const orderedTimeline = [...timeline].reverse();

  return (
    <div className="glass-panel p-3 relative">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-sm text-[var(--color-silver)] flex items-center gap-2">
            <Clock size={14} className="text-[var(--color-arcane-light)]" />
            ⏳ Reality Timeline
          </h3>
          {/* Branch Badge */}
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono bg-[var(--color-void-lighter)] border border-[var(--color-arcane-dark)] text-[var(--color-arcane-light)]">
            <GitBranch size={10} />
            {currentBranch}
          </span>
        </div>
        <button
          onClick={() => setBranchModal(true)}
          className="btn-action text-xs flex items-center gap-1.5"
        >
          🌿 Branch Reality
        </button>
      </div>

      {/* Scrollable Timeline */}
      <div
        ref={scrollRef}
        className="flex items-center gap-0 overflow-x-auto pb-2 pt-4 px-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {orderedTimeline.map((entry, idx) => {
          const color = getNodeColor(entry.type);
          return (
            <div key={entry.hash} className="flex items-center">
              {/* Connector line (skip before first node) */}
              {idx > 0 && (
                <div
                  className="timeline-connector"
                  style={{
                    background: `linear-gradient(90deg, ${getNodeColor(orderedTimeline[idx - 1].type)}44, ${color}44)`,
                  }}
                />
              )}
              {/* Node */}
              <motion.div
                className={`timeline-node ${entry.isCurrent ? 'current' : ''}`}
                style={{
                  backgroundColor: color,
                  width: entry.isCurrent ? 20 : 16,
                  height: entry.isCurrent ? 20 : 16,
                  boxShadow: entry.isCurrent
                    ? `0 0 12px ${color}, 0 0 24px ${color}66`
                    : `0 0 6px ${color}44`,
                }}
                whileHover={{ scale: 1.4 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={(e) => {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setTooltip({ entry, x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => handleNodeClick(entry)}
              >
                {entry.isCurrent && (
                  <GitCommit
                    size={10}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80"
                  />
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="fixed z-50 glass-panel glow-arcane px-3 py-2 rounded-lg max-w-xs pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y - 8,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="text-xs font-body text-[var(--color-silver)] mb-1">
              {tooltip.entry.description}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted)]">
              <span className="font-mono">{tooltip.entry.hashShort}</span>
              <span>•</span>
              <span>{new Date(tooltip.entry.date).toLocaleDateString()}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                style={{
                  backgroundColor: `${getNodeColor(tooltip.entry.type)}22`,
                  color: getNodeColor(tooltip.entry.type),
                }}
              >
                {tooltip.entry.type}
              </span>
            </div>
            {tooltip.entry.isCurrent && (
              <p className="text-[10px] text-[var(--color-arcane-light)] mt-1">
                ◆ Current Reality
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Time-Travel Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="glass-panel glow-arcane p-6 rounded-xl max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-display text-lg text-[var(--color-arcane-light)] mb-2 flex items-center gap-2">
                <Clock size={18} />
                Travel to this reality anchor?
              </h4>
              <p className="text-sm text-[var(--color-silver)] mb-1">
                {confirmModal.description}
              </p>
              <p className="text-xs text-[var(--color-muted)] font-mono mb-4">
                {confirmModal.hashShort} •{' '}
                {new Date(confirmModal.date).toLocaleString()}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="btn-action text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTravel}
                  className="btn-action btn-primary text-xs"
                >
                  ⏳ Time Travel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Branch Creation Modal */}
      <AnimatePresence>
        {branchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setBranchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="glass-panel glow-emerald p-6 rounded-xl max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display text-lg text-[var(--color-emerald-light)] flex items-center gap-2">
                  <GitBranch size={18} />
                  🌿 Branch Reality
                </h4>
                <button
                  onClick={() => setBranchModal(false)}
                  className="text-[var(--color-muted)] hover:text-[var(--color-silver)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-[var(--color-muted)] mb-3">
                Fork a new alternate timeline from this point in reality.
              </p>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateBranch()}
                placeholder="alternate-timeline-name"
                className="game-input text-sm mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setBranchModal(false)}
                  className="btn-action text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBranch}
                  disabled={!branchName.trim()}
                  className="btn-action btn-primary text-xs disabled:opacity-40"
                >
                  🌿 Create Branch
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
