'use client';

import { useEffect, useState, useMemo } from 'react';
import ParticleBackground from '@/components/ParticleBackground';
import CRTOverlay from '@/components/CRTOverlay';
import StoryLog from '@/components/StoryLog';
import CommandCenter from '@/components/CommandCenter';
import CharacterSheet from '@/components/CharacterSheet';
import InventoryPanel from '@/components/InventoryPanel';
import SpellbookPanel from '@/components/SpellbookPanel';
import QuestLogPanel from '@/components/QuestLogPanel';
import RealityTimeline from '@/components/RealityTimeline';
import GameOverModal from '@/components/GameOverModal';
import TimeGlitchOverlay from '@/components/TimeGlitchOverlay';
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
    uiMode,
    setUiMode,
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
  
  const [isTimeGlitching, setIsTimeGlitching] = useState(false);
  
  // Right Sidebar Tab State
  const [activeTab, setActiveTab] = useState<'character' | 'inventory' | 'spellbook' | 'quests'>('character');

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
               immersiveLore: data.chronicle,
               tacticalSummary: 'The Chronicle auto-initialized',
               engineAlert: '> Initialization complete.'
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
    setIsTimeGlitching(true);
    
    // Wait for the glitch effect to reach its peak before state swap
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    await timeTravel(hash);
    // After time travel, the game state changes
    await refreshState();
    
    setTimeout(() => setIsTimeGlitching(false), 400);
    
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
        immersiveLore: data.chronicle,
        tacticalSummary: 'Reality anchor restored',
        engineAlert: `> Temporal shift to anchor ${hash.substring(0, 7)} complete.`
      }]);
    }
  };


  const isLoading = isGameStateLoading || isTimelineLoading;

  const locationClass = useMemo(() => {
    if (!player?.current_location) return 'bg-loc-default';
    const loc = player.current_location.toLowerCase();
    if (loc.includes('crypt')) return 'bg-loc-crypt';
    if (loc.includes('neon')) return 'bg-loc-neon';
    if (loc.includes('void')) return 'bg-loc-void';
    return 'bg-loc-default';
  }, [player?.current_location]);

  return (
    <div className={`relative min-h-screen bg-void text-silver overflow-hidden selection:bg-arcane-glow transition-colors duration-1000 ${locationClass} ${isTimeGlitching ? 'time-glitch-active' : ''}`}>
      <TimeGlitchOverlay isGlitching={isTimeGlitching} />
      <CRTOverlay />
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
          <StoryLog 
            entries={displayedLog.map(entry => ({
              id: entry.id,
              immersiveLore: entry.immersiveLore,
              tacticalSummary: entry.tacticalSummary,
              engineAlert: entry.engineAlert,
              mechanics: entry.mechanics ? {
                diceRoll: entry.mechanics.diceRoll || undefined,
                commitType: entry.mechanics.commitType,
                commitDescription: entry.mechanics.commitDescription,
                threatDetected: entry.mechanics.threatDetected || undefined,
                objective: entry.mechanics.objective || undefined
              } : undefined
            }))} 
            uiMode={uiMode}
            onToggleUiMode={() => setUiMode(uiMode === 'tactical' ? 'immersive' : 'tactical')}
          />
        </div>

        {/* Center Column: Command Center */}
        <div className="flex flex-col h-full min-h-0">
          <CommandCenter 
            onSubmitAction={handleAction}
            isLoading={isGameStateLoading}
            diceRoll={lastDiceRoll}
            isRolling={isRolling}
            equippedWeapon={inventory?.equipped?.weapon}
          />
        </div>

        {/* Right Column: Tabbed Sidebar */}
        <div className="flex flex-col gap-2 h-full min-h-0 bg-void/40 rounded-xl border border-border backdrop-blur-sm p-2">
          {/* Tabs Navigation */}
          <div className="flex gap-1 border-b border-border pb-2 shrink-0">
            {['character', 'inventory', 'spellbook', 'quests'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded transition-colors ${
                  activeTab === tab 
                    ? 'bg-arcane/20 text-arcane-light border border-arcane/30 glow-arcane' 
                    : 'text-muted hover:text-silver hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {activeTab === 'character' && <CharacterSheet player={player} />}
            {activeTab === 'inventory' && (
              <InventoryPanel 
                inventory={inventory} 
                onItemAction={handleAction}
              />
            )}
            {activeTab === 'spellbook' && (
              <SpellbookPanel 
                abilities={player?.abilities || []} 
                currentMana={player?.mana?.current || 0}
                onCastSpell={handleAction}
              />
            )}
            {activeTab === 'quests' && (
              <QuestLogPanel 
                quests={(player as any)?.quests || []} 
              />
            )}
          </div>
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
