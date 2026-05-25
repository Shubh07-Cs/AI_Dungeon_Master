'use client';

import { useState, useEffect } from 'react';

interface Particle {
  id: number;
  x: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
}

const COLORS = {
  arcane: '#8b5cf6',
  cyber: '#06b6d4',
  gold: '#f59e0b',
} as const;

function pickColor(rand: number): string {
  if (rand < 0.6) return COLORS.arcane;
  if (rand < 0.9) return COLORS.cyber;
  return COLORS.gold;
}

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        duration: 6 + Math.random() * 9,       // 6–15s
        delay: Math.random() * 10,              // 0–10s
        size: 2 + Math.random() * 3,            // 2–5px
        color: pickColor(Math.random()),
      }))
    );
  }, []);

  if (particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={
            {
              '--x': `${p.x}%`,
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--size': `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}40`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
