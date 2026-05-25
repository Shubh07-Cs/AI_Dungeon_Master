'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (isRolling) {
      setShowOverlay(true);
    } else if (diceRoll && showOverlay) {
      // Keep it up for 2.5s after roll finishes to show result
      const timer = setTimeout(() => setShowOverlay(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isRolling, diceRoll, showOverlay]);

  const style = diceRoll ? getDiceStyle(diceRoll) : null;

  return (
    <>
      {/* ─── Massive 3D Overlay ─── */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-[var(--color-void)]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isRolling ? (
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  className="w-32 h-32 flex items-center justify-center rounded-xl border-4 border-[var(--color-arcane)] bg-[var(--color-arcane)]/20 shadow-[0_0_50px_var(--color-arcane-glow)]"
                  animate={{
                    rotateX: [0, 720, 1440],
                    rotateY: [0, 1080, 2160],
                    rotateZ: [0, 360, 720],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Dices size={64} className="text-[var(--color-arcane-light)]" />
                </motion.div>
                <motion.span
                  className="text-2xl font-display font-bold text-glow-arcane text-[var(--color-arcane-light)] tracking-widest"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ROLLING FATE...
                </motion.span>
              </div>
            ) : diceRoll && style ? (
              <motion.div
                className="flex flex-col items-center gap-6"
                initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <div className={`w-32 h-32 flex items-center justify-center rounded-xl border-4 ${style.border} ${style.bg} ${style.glow} shadow-[0_0_100px_var(--color-arcane-glow)]`}>
                  <span className={`${style.text} font-display font-black text-6xl drop-shadow-2xl`}>
                    {diceRoll.roll}
                  </span>
                </div>
                
                <div className="flex flex-col items-center gap-2 bg-[var(--color-void)]/90 p-4 rounded-xl border border-[var(--color-border)] backdrop-blur-md">
                  <span className={`text-2xl font-display uppercase tracking-widest font-black ${style.labelColor} drop-shadow-lg`}>
                    {style.label}
                  </span>
                  
                  <div className="flex items-center gap-3 text-lg font-mono text-[var(--color-muted)]">
                    <span className="text-[var(--color-silver)] font-bold">{diceRoll.roll}</span>
                    {diceRoll.modifier !== 0 && (
                      <>
                        <span className="text-[var(--color-dim)]">{diceRoll.modifier > 0 ? '+' : '−'}</span>
                        <span className="text-[var(--color-silver)] font-bold">{Math.abs(diceRoll.modifier)}</span>
                      </>
                    )}
                    <span className="text-[var(--color-dim)]">=</span>
                    <span className={`font-black text-xl ${style.text}`}>{diceRoll.total}</span>
                    <span className="text-[var(--color-dim)] mx-2">vs</span>
                    <span className="text-[var(--color-silver)] font-bold">DC {diceRoll.dc}</span>
                  </div>
                  
                  <span className="px-3 py-1 mt-1 rounded bg-[var(--color-arcane)]/20 border border-[var(--color-arcane)]/40 text-sm text-[var(--color-arcane-light)] font-mono uppercase tracking-widest font-bold">
                    {diceRoll.statUsed} CHECK
                  </span>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mini Header Dice ─── */}
      {/* ─── Mini Header Dice ─── */}
      <div className="flex items-center">
        {isRolling ? (
          <div className="flex items-center justify-center opacity-50 px-2 py-1">
            <Dices size={20} className="text-[var(--color-arcane)] animate-spin" />
          </div>
        ) : !diceRoll ? (
          <div className="flex items-center text-[var(--color-dim)] px-2 py-1">
            <Dices size={20} />
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="flex items-center gap-2"
          >
            {/* Dice face */}
            <div className={`dice-face w-8 h-8 text-sm border ${style?.border} ${style?.bg} ${style?.glow}`}>
              <span className={`${style?.text} font-display font-bold`}>
                {diceRoll.roll}
              </span>
            </div>

            <div className="flex flex-col items-start leading-none">
              <span className={`text-[9px] font-mono uppercase tracking-widest font-bold ${style?.labelColor}`}>
                {style?.label}
              </span>
              <span className="text-[9px] font-mono text-[var(--color-muted)]">
                {diceRoll.statUsed}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
