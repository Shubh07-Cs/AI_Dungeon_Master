'use client';

import { useEffect, useState } from 'react';
import ParticleBackground from '@/components/ParticleBackground';
import StoryLog from '@/components/StoryLog';
import CommandCenter from '@/components/CommandCenter';
import CharacterSheet from '@/components/CharacterSheet';
import InventoryPanel from '@/components/InventoryPanel';
import RealityTimeline from '@/components/RealityTimeline';
import GameOverModal from '@/components/GameOverModal';
import { useGameState } from '@/hooks/useGameState';
import { useTimeline } from '@/hooks/useTimeline';

export default function GameDashboard() {
  const {
    player,
    inventory,
    storyLog,
    isLoading: isGameStateLoading,
    lastDiceRoll,
    isRolling,
    isGameOver,
    submitAction,
    refreshState,
    isServerless,
  } = useGameState();

  const {
    timeline,
    currentBranch,
    isLoading: isTimelineLoading,
    timeTravel,
    createBranch,
    refresh: refreshTimeline,
  } = useTimeline();

  // Combine initial chronicle from state API with new storyLog actions
  const [initialChronicleFetched, setInitialChronicleFetched] = useState(false);
  const [fullStoryLog, setFullStoryLog] = useState<typeof storyLog>([]);

  useEffect(() => {
    if (isServerless) {
      setInitialChronicleFetched(true);
      return;
    }

    // When the component mounts, we might want to fetch the initial chronicle
    const fetchInitialChronicle = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          // The chronicle comes back as markdown text, let's create a single entry for it
          // Only do this if we haven't already and the story log is empty
          if (data.chronicle && fullStoryLog.length === 0) {
             setFullStoryLog([{
               id: 'prologue',
               narration: data.chronicle,
             }]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial chronicle:', err);
      } finally {
        setInitialChronicleFetched(true);
      }
    };

    if (!initialChronicleFetched) {
      fetchInitialChronicle();
    }
  }, [initialChronicleFetched, fullStoryLog.length, isServerless]);

  // Merge the initial prologue with the ongoing story log from actions
  const displayedLog = isServerless 
    ? storyLog 
    : [
        ...fullStoryLog,
        ...storyLog.filter(entry => !fullStoryLog.some(e => e.id === entry.id))
      ];

  const handleAction = async (action: string) => {
    await submitAction(action);
    // After an action, the timeline has changed (a new commit was made)
    await refreshTimeline();
  };

  const handleTimeTravel = async (hash: string) => {
    await timeTravel(hash);
    // After time travel, the game state changes
    await refreshState();
    
    if (isServerless) {
      setFullStoryLog([]);
      return;
    }

    // Also reset the story log to just the current chronicle
    const res = await fetch('/api/state');
    if (res.ok) {
      const data = await res.json();
      setFullStoryLog([{
        id: `restored-${hash}`,
        narration: data.chronicle,
      }]);
    }
  };


  const isLoading = isGameStateLoading || isTimelineLoading;

  return (
    <div className="relative min-h-screen bg-void text-silver overflow-hidden selection:bg-arcane-glow">
      <ParticleBackground />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 glass-panel rounded-none border-t-0 border-l-0 border-r-0 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-bold text-glow-arcane bg-clip-text text-transparent bg-gradient-to-r from-arcane-light to-cyber-light">
            ⚔️ ChronosRPG
          </h1>
          <span className="text-sm font-body text-muted">The Spellsword's Chronicle</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse glow-emerald"></span>
            <span className="text-sm font-mono text-emerald-light">Engine Online</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 game-grid w-full">
        <div className="flex flex-col h-full min-h-0">
          <StoryLog entries={displayedLog.map(entry => ({
            id: entry.id,
            narration: entry.narration,
            mechanics: entry.mechanics ? {
              diceRoll: entry.mechanics.diceRoll || undefined,
              commitType: entry.mechanics.commitType,
              commitDescription: entry.mechanics.commitDescription
            } : undefined
          }))} />
        </div>

        {/* Center Column: Command Center */}
        <div className="flex flex-col h-full min-h-0">
          <CommandCenter 
            onSubmitAction={handleAction}
            isLoading={isLoading}
            diceRoll={lastDiceRoll}
            isRolling={isRolling}
          />
        </div>

        {/* Right Column: Character Status & Inventory */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          <CharacterSheet player={player} />
          <InventoryPanel inventory={inventory} />
        </div>

        {/* Bottom Row: Reality Timeline (spans all columns) */}
        <div className="col-span-full h-32">
          <RealityTimeline 
            timeline={timeline}
            onTimeTravel={handleTimeTravel}
            currentBranch={currentBranch}
            onCreateBranch={createBranch}
          />
        </div>
      </main>

      {/* Modals */}
      <GameOverModal 
        isVisible={isGameOver}
        timeline={timeline}
        onTimeTravel={handleTimeTravel}
      />
    </div>
  );
}
