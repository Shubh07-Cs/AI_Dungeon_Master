'use client';

import { motion } from 'motion/react';
import { Dices } from 'lucide-react';

interface DiceRollResult {
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

interface DiceRollerProps {
  diceRoll: DiceRollResult | null;
  isRolling: boolean;
}

function getDiceStyle(result: DiceRollResult) {
  if (result.isCritical) {
    return {
      bg: 'bg-[var(--color-gold)]/20',
      border: 'border-[var(--color-gold)]',
      text: 'text-[var(--color-gold-light)]',
      glow: 'glow-gold',
      label: 'NAT 20!',
      labelColor: 'text-[var(--color-gold-light)]',
    };
  }
  if (result.isCritFail) {
    return {
      bg: 'bg-[var(--color-blood)]/20',
      border: 'border-[var(--color-blood)]',
      text: 'text-[var(--color-blood-light)]',
      glow: 'glow-blood',
      label: 'NAT 1!',
      labelColor: 'text-[var(--color-blood-light)]',
    };
  }
  if (result.success) {
    return {
      bg: 'bg-[var(--color-emerald)]/20',
      border: 'border-[var(--color-emerald)]',
      text: 'text-[var(--color-emerald-light)]',
      glow: 'glow-emerald',
      label: 'Success',
      labelColor: 'text-[var(--color-emerald-light)]',
    };
  }
  return {
    bg: 'bg-[var(--color-muted)]/20',
    border: 'border-[var(--color-dim)]',
    text: 'text-[var(--color-dim)]',
    glow: '',
    label: 'Failure',
    labelColor: 'text-[var(--color-dim)]',
  };
}

export default function DiceRoller({ diceRoll, isRolling }: DiceRollerProps) {
  // Rolling state — animated spinner
  if (isRolling) {
    return (
      <div className="flex flex-col items-center gap-2 py-3">
        <motion.div
          className="dice-face dice-rolling border border-[var(--color-arcane)] bg-[var(--color-arcane)]/15"
          animate={{ rotate: [0, 360], scale: [1, 1.15, 1] }}
          transition={{
            rotate: { duration: 0.6, repeat: Infinity, ease: 'linear' },
            scale: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <Dices size={22} className="text-[var(--color-arcane-light)]" />
        </motion.div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-arcane-light)] animate-[glow-pulse_1.5s_ease-in-out_infinite]">
          Rolling...
        </span>
      </div>
    );
  }

  // No result yet — idle state
  if (!diceRoll) {
    return (
      <div className="flex flex-col items-center gap-2 py-3">
        <div className="dice-face border border-[var(--color-border)] bg-[var(--color-void-lighter)]">
          <Dices size={20} className="text-[var(--color-dim)]" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-dim)]">
          d20
        </span>
      </div>
    );
  }

  // Result display
  const style = getDiceStyle(diceRoll);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      className="flex flex-col items-center gap-2 py-3"
    >
      {/* Dice face */}
      <div className={`dice-face border ${style.border} ${style.bg} ${style.glow}`}>
        <span className={`${style.text} font-display font-bold`}>
          {diceRoll.roll}
        </span>
      </div>

      {/* Critical / result label */}
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`text-[10px] font-mono uppercase tracking-widest font-bold ${style.labelColor}`}
      >
        {style.label}
      </motion.span>

      {/* Breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex items-center gap-1 text-[11px] font-mono text-[var(--color-muted)]"
      >
        <span className="text-[var(--color-silver)]">{diceRoll.roll}</span>
        {diceRoll.modifier !== 0 && (
          <>
            <span className="text-[var(--color-dim)]">
              {diceRoll.modifier > 0 ? '+' : '−'}
            </span>
            <span className="text-[var(--color-silver)]">
              {Math.abs(diceRoll.modifier)}
            </span>
          </>
        )}
        <span className="text-[var(--color-dim)]">=</span>
        <span className={`font-bold ${style.text}`}>{diceRoll.total}</span>
        <span className="text-[var(--color-dim)] mx-0.5">vs</span>
        <span className="text-[var(--color-silver)]">DC {diceRoll.dc}</span>
      </motion.div>

      {/* Stat used badge */}
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
        className="px-2 py-0.5 rounded bg-[var(--color-arcane)]/15 border border-[var(--color-arcane)]/25 text-[10px] text-[var(--color-arcane-light)] font-mono uppercase tracking-wider"
      >
        {diceRoll.statUsed}
      </motion.span>
    </motion.div>
  );
}
