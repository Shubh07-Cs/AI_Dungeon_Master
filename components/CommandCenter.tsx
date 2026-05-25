'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { Send, Loader2 } from 'lucide-react';
import DiceRoller from './DiceRoller';

interface CommandCenterProps {
  onSubmitAction: (action: string) => void;
  isLoading: boolean;
  diceRoll: any | null;
  isRolling: boolean;
}

const QUICK_ACTIONS: { emoji: string; label: string; command: string }[] = [
  { emoji: '⚔️', label: 'Attack', command: 'I attack the nearest enemy' },
  { emoji: '🔍', label: 'Inspect', command: 'I carefully inspect my surroundings' },
  { emoji: '🛡️', label: 'Defend', command: 'I take a defensive stance' },
  { emoji: '💤', label: 'Rest', command: 'I find a safe spot to rest' },
  { emoji: '🎒', label: 'Inventory', command: 'I check my inventory' },
  { emoji: '🔮', label: 'Cast Spell', command: 'I cast an arcane spell' },
];

const MAX_HISTORY = 20;

export default function CommandCenter({
  onSubmitAction,
  isLoading,
  diceRoll,
  isRolling,
}: CommandCenterProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [savedInput, setSavedInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setHistory((prev) => {
        const next = [trimmed, ...prev.filter((h) => h !== trimmed)];
        return next.slice(0, MAX_HISTORY);
      });
      setHistoryIdx(-1);
      setSavedInput('');
      setInput('');
      onSubmitAction(trimmed);
    },
    [isLoading, onSubmitAction],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit(input);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) return;
      if (historyIdx === -1) setSavedInput(input);
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx <= 0) {
        setHistoryIdx(-1);
        setInput(savedInput);
        return;
      }
      const nextIdx = historyIdx - 1;
      setHistoryIdx(nextIdx);
      setInput(history[nextIdx]);
    }
  };

  return (
    <motion.div
      className="glass-panel glow-arcane p-4 flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ─────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-[var(--color-silver)]">
          ⌨️ Command
        </h2>
        <DiceRoller diceRoll={diceRoll} isRolling={isRolling} />
      </div>

      {/* ── Quick Actions ──────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_ACTIONS.map(({ emoji: em, label, command }) => (
          <button
            key={label}
            type="button"
            className="btn-action"
            disabled={isLoading}
            onClick={() => submit(command)}
          >
            <span>{em}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Input Row ──────────────────────── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            className={`game-input ${isLoading ? 'animate-pulse opacity-60' : ''}`}
            placeholder="> What do you do, adventurer?"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setHistoryIdx(-1);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </div>

        <motion.button
          type="button"
          className="btn-action btn-primary px-4 shrink-0 flex items-center gap-1.5"
          disabled={isLoading || !input.trim()}
          onClick={() => submit(input)}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="text-sm font-body">Send</span>
        </motion.button>
      </div>

      {/* ── History hint ───────────────────── */}
      {history.length > 0 && (
        <p className="text-[10px] font-mono text-[var(--color-dim)] text-right">
          ↑↓ history ({history.length})
        </p>
      )}
    </motion.div>
  );
}
