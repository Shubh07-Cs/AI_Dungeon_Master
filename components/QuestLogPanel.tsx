'use client';

import { motion } from 'motion/react';
import { Scroll, CheckCircle, Circle, XCircle } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
}

interface QuestLogPanelProps {
  quests?: Quest[];
}

export default function QuestLogPanel({ quests = [] }: QuestLogPanelProps) {
  return (
    <motion.div
      className="glass-panel p-4 flex flex-col gap-3 h-full overflow-y-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-2 border-b border-[var(--color-border)] pb-2">
        <Scroll className="text-[var(--color-gold)] w-5 h-5" />
        <h2 className="font-display text-lg font-bold text-glow-gold text-[var(--color-gold-light)]">
          Quest Log
        </h2>
      </div>

      {quests.length === 0 ? (
        <div className="text-center text-[var(--color-dim)] font-mono text-sm py-8 italic">
          No active quests. The world waits.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quests.map((quest) => {
            const isCompleted = quest.status === 'completed';
            const isFailed = quest.status === 'failed';
            const isActive = quest.status === 'active';

            return (
              <motion.div 
                key={quest.id}
                className={`p-3 rounded-lg border bg-[var(--color-void-lighter)] flex flex-col gap-2 ${
                  isActive ? 'border-[var(--color-gold)]/30' : 'border-[var(--color-border)] opacity-70'
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-[var(--color-emerald)]" />
                      ) : isFailed ? (
                        <XCircle className="w-4 h-4 text-[var(--color-blood)]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[var(--color-gold)]" />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-display font-bold ${
                        isCompleted ? 'text-[var(--color-emerald-light)]' : 
                        isFailed ? 'text-[var(--color-blood-light)] line-through' : 
                        'text-[var(--color-gold-light)]'
                      }`}>
                        {quest.title}
                      </h3>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-dim)]">
                        {quest.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-muted)] font-body leading-relaxed pl-6">
                  {quest.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
