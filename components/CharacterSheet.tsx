'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Heart,
  Zap,
  MapPin,
  Swords,
  Star,
  Brain,
  Eye,
} from 'lucide-react';

type Player = {
  name: string;
  class: string;
  level: number;
  health: { current: number; max: number };
  mana: { current: number; max: number };
  armor_class: number;
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    constitution: number;
    wisdom: number;
    charisma: number;
  };
  experience: { current: number; next_level: number };
  status_effects: string[];
  current_location: string;
  alignment: string;
  abilities: string[];
  kill_count: number;
  turns_played: number;
};

interface CharacterSheetProps {
  player: Player | null;
}

function modifier(stat: number): string {
  const mod = Math.floor((stat - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function hpColor(current: number, max: number): string {
  const pct = (current / max) * 100;
  if (pct > 60) return 'text-emerald-400';
  if (pct > 30) return 'text-yellow-400';
  return 'text-red-400';
}

function hpBarClass(current: number, max: number): string {
  const pct = (current / max) * 100;
  if (pct > 60) return 'progress-bar-fill progress-hp';
  if (pct > 30)
    return 'progress-bar-fill bg-gradient-to-r from-yellow-600 to-yellow-400';
  return 'progress-bar-fill bg-gradient-to-r from-red-700 to-red-400';
}

const STAT_META: {
  key: keyof Player['stats'];
  label: string;
  abbr: string;
  icon: typeof Swords;
  color: string;
}[] = [
  { key: 'strength', label: 'Strength', abbr: 'STR', icon: Swords, color: 'text-red-400' },
  { key: 'dexterity', label: 'Dexterity', abbr: 'DEX', icon: Zap, color: 'text-yellow-400' },
  { key: 'intelligence', label: 'Intelligence', abbr: 'INT', icon: Brain, color: 'text-blue-400' },
  { key: 'constitution', label: 'Constitution', abbr: 'CON', icon: Shield, color: 'text-orange-400' },
  { key: 'wisdom', label: 'Wisdom', abbr: 'WIS', icon: Eye, color: 'text-cyan-400' },
  { key: 'charisma', label: 'Charisma', abbr: 'CHA', icon: Star, color: 'text-pink-400' },
];

const STATUS_COLORS: Record<string, string> = {
  poisoned: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
  burning: 'bg-red-900/60 text-red-300 border-red-700/50',
  frozen: 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50',
  blessed: 'bg-yellow-900/60 text-yellow-300 border-yellow-700/50',
  cursed: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
  stunned: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
  invisible: 'bg-gray-900/60 text-gray-300 border-gray-600/50',
};

function statusColor(effect: string): string {
  const key = effect.toLowerCase();
  return STATUS_COLORS[key] ?? 'bg-violet-900/60 text-violet-300 border-violet-700/50';
}

/* ── Loading Skeleton ─────────────────────────────────── */
function Skeleton() {
  return (
    <div className="glass-panel p-4 space-y-4 animate-pulse">
      <div className="h-6 w-40 rounded bg-white/5" />
      <div className="h-4 w-24 rounded bg-white/5" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 rounded bg-white/5" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 rounded bg-white/5" />
        ))}
      </div>
    </div>
  );
}

/* ── Animated Bar Component ───────────────────────────── */
function AnimatedBar({
  current,
  max,
  barClass,
  flashColorDown,
  flashColorUp,
}: {
  current: number;
  max: number;
  barClass: string;
  flashColorDown: string;
  flashColorUp: string;
}) {
  const pct = Math.max(0, Math.min((current / max) * 100, 100));
  const [flash, setFlash] = useState<string | null>(null);
  const prevCurrent = useRef(current);

  useEffect(() => {
    if (current < prevCurrent.current) {
      setFlash(flashColorDown);
      const t = setTimeout(() => setFlash(null), 300);
      prevCurrent.current = current;
      return () => clearTimeout(t);
    } else if (current > prevCurrent.current) {
      setFlash(flashColorUp);
      const t = setTimeout(() => setFlash(null), 300);
      prevCurrent.current = current;
      return () => clearTimeout(t);
    }
  }, [current, flashColorDown, flashColorUp]);

  return (
    <div className="progress-bar relative overflow-hidden">
      <AnimatePresence>
        {flash && (
          <motion.div
            className={`absolute inset-0 z-10 ${flash}`}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
      <motion.div
        className={barClass}
        initial={{ width: `${pct}%` }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', bounce: 0.25, duration: 0.8 }}
      />
    </div>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function CharacterSheet({ player }: CharacterSheetProps) {
  if (!player) return <Skeleton />;

  const healthPct = Math.min((player.health.current / player.health.max) * 100, 100);
  const manaPct = Math.min((player.mana.current / player.mana.max) * 100, 100);
  const xpPct = Math.min((player.experience.current / player.experience.next_level) * 100, 100);

  return (
    <motion.div
      className="glass-panel glow-arcane p-4 flex flex-col gap-3 overflow-y-auto h-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Header ─────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold text-glow-arcane truncate text-[var(--color-arcane-light)]">
            {player.name}
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-void-lighter)] text-[var(--color-muted)]">
            {player.class}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Shield className="w-4 h-4 text-[var(--color-gold)]" />
          <span className="font-display font-bold text-sm text-[var(--color-gold)] text-glow-gold">
            Lv.{player.level}
          </span>
        </div>
      </div>

      {/* ── Bars ───────────────────────────── */}
      <div className="space-y-2">
        {/* HP */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-[var(--color-blood)]" />
              <span className="text-xs font-mono text-[var(--color-muted)]">HP</span>
            </div>
            <span className={`text-xs font-mono font-semibold ${hpColor(player.health.current, player.health.max)}`}>
              {player.health.current}/{player.health.max}
            </span>
          </div>
          <AnimatedBar
            current={player.health.current}
            max={player.health.max}
            barClass={hpBarClass(player.health.current, player.health.max)}
            flashColorDown="bg-[var(--color-blood-glow)]"
            flashColorUp="bg-[var(--color-emerald-glow)]"
          />
        </div>

        {/* Mana */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
               <Zap className="w-3.5 h-3.5 text-[var(--color-cyber)]" />
               <span className="text-xs font-mono text-[var(--color-muted)]">MP</span>
            </div>
            <span className="text-xs font-mono font-semibold text-[var(--color-cyber-light)]">
               {player.mana.current}/{player.mana.max}
            </span>
          </div>
          <AnimatedBar
            current={player.mana.current}
            max={player.mana.max}
            barClass="progress-bar-fill progress-mana"
            flashColorDown="bg-[var(--color-cyber-glow)]"
            flashColorUp="bg-[var(--color-cyber-glow)]"
          />
        </div>

        {/* XP */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
             <div className="flex items-center gap-1">
               <Star className="w-3.5 h-3.5 text-[var(--color-arcane)]" />
               <span className="text-xs font-mono text-[var(--color-muted)]">XP</span>
             </div>
             <span className="text-xs font-mono font-semibold text-[var(--color-arcane-light)]">
               {player.experience.current}/{player.experience.next_level}
             </span>
          </div>
          <AnimatedBar
            current={player.experience.current}
            max={player.experience.next_level}
            barClass="progress-bar-fill progress-xp"
            flashColorDown="bg-[var(--color-muted)]"
            flashColorUp="bg-[var(--color-gold-glow)]"
          />
        </div>
      </div>

      {/* ── AC ─────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
        <Shield className="w-3.5 h-3.5" />
        <span className="font-mono">AC</span>
        <span className="font-display font-bold text-sm text-[var(--color-silver)]">
          {player.armor_class}
        </span>
        <span className="mx-1 text-[var(--color-dim)]">│</span>
        <span className="font-mono">{player.alignment}</span>
      </div>

      {/* ── Stats Grid ─────────────────────── */}
      <div className="grid grid-cols-2 gap-1.5">
        {STAT_META.map(({ key, abbr, icon: Icon, color }) => {
          const value = player.stats[key];
          return (
            <motion.div
              key={key}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--color-void-lighter)] border border-[var(--color-border)]"
              whileHover={{ scale: 1.03, borderColor: 'var(--color-border-hover)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
              <span className="text-xs font-mono text-[var(--color-muted)] w-8">{abbr}</span>
              <span className="font-display font-bold text-sm text-[var(--color-silver)]">
                {value}
              </span>
              <span className={`text-xs font-mono ml-auto ${
                Math.floor((value - 10) / 2) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {modifier(value)}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* ── Location ───────────────────────── */}
      <div className="flex items-center gap-1.5 text-xs">
        <MapPin className="w-3.5 h-3.5 text-[var(--color-cyber)]" />
        <span className="font-mono text-[var(--color-cyber-light)] truncate">
          {player.current_location}
        </span>
      </div>

      {/* ── Status Effects ─────────────────── */}
      <AnimatePresence>
        {player.status_effects.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {player.status_effects.map((fx) => (
              <motion.span
                key={fx}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusColor(fx)}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                layout
              >
                {fx}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Abilities ──────────────────────── */}
      {player.abilities.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-dim)] mb-1">
            Abilities
          </p>
          <div className="flex flex-wrap gap-1">
            {player.abilities.map((ab) => (
              <span
                key={ab}
                className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--color-arcane-glow)] bg-[var(--color-arcane-glow)] text-[var(--color-arcane-light)]"
              >
                {ab}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer Stats ──────────────────── */}
      <div className="mt-auto pt-2 border-t border-[var(--color-border)] flex justify-between text-[10px] font-mono text-[var(--color-dim)]">
        <span>⚔ Kills: {player.kill_count}</span>
        <span>↻ Turns: {player.turns_played}</span>
      </div>
    </motion.div>
  );
}
