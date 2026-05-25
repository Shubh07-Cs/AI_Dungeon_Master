'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Skull, Clock, RotateCcw } from 'lucide-react';

interface TimelineAnchor {
  hash: string;
  hashShort: string;
  description: string;
  type: string;
}

interface GameOverModalProps {
  isVisible: boolean;
  timeline: TimelineAnchor[];
  onTimeTravel: (hash: string) => void;
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

export default function GameOverModal({
  isVisible,
  timeline,
  onTimeTravel,
}: GameOverModalProps) {
  // Filter out DEATH entries and take the last 5
  const anchors = timeline
    .filter((entry) => entry.type !== 'DEATH')
    .slice(-5)
    .reverse();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="game-over-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            boxShadow: 'inset 0 0 120px rgba(239, 68, 68, 0.15)',
          }}
        >
          {/* Red pulsing border */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              boxShadow: [
                'inset 0 0 60px rgba(239, 68, 68, 0.1)',
                'inset 0 0 100px rgba(239, 68, 68, 0.25)',
                'inset 0 0 60px rgba(239, 68, 68, 0.1)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Skull Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
            className="mb-6"
          >
            <Skull size={64} className="text-[var(--color-blood)]" />
          </motion.div>

          {/* Glitch Title */}
          <motion.h1
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 120, delay: 0.4 }}
            className="glitch-text font-display text-4xl md:text-6xl font-black text-[var(--color-blood)] mb-4 text-center tracking-wider"
            style={{
              textShadow:
                '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3), 0 0 80px rgba(239, 68, 68, 0.15)',
            }}
          >
            TEMPORAL COLLAPSE
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-[var(--color-muted)] text-sm md:text-base mb-10 text-center font-body flex items-center gap-2"
          >
            <Clock size={14} className="text-[var(--color-blood-light)]" />
            Time-loop collapse detected. Initiating temporal recall...
          </motion.p>

          {/* Reality Anchors */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="w-full max-w-md px-4"
          >
            <h3 className="font-display text-sm text-[var(--color-silver)] mb-3 text-center flex items-center justify-center gap-2">
              <RotateCcw size={14} className="text-[var(--color-arcane-light)]" />
              Reality Anchors
            </h3>
            <div className="flex flex-col gap-2">
              {anchors.map((anchor, idx) => {
                const color = TYPE_COLORS[anchor.type] || TYPE_COLORS.SYSTEM;
                return (
                  <motion.button
                    key={anchor.hash}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onTimeTravel(anchor.hash)}
                    className="glass-panel px-4 py-3 text-left flex items-center justify-between gap-3 group cursor-pointer hover:border-[var(--color-arcane)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: color,
                          boxShadow: `0 0 8px ${color}66`,
                        }}
                      />
                      <span className="text-sm text-[var(--color-silver)] truncate group-hover:text-white transition-colors">
                        {anchor.description}
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded flex-shrink-0"
                      style={{
                        backgroundColor: `${color}22`,
                        color: color,
                      }}
                    >
                      {anchor.type}
                    </span>
                  </motion.button>
                );
              })}
              {anchors.length === 0 && (
                <p className="text-center text-[var(--color-muted)] text-xs">
                  No reality anchors found. The timeline has been erased.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
