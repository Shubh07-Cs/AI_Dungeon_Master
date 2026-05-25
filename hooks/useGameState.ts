'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlayerState, InventoryState, DiceRoll, TurnResult } from '@/lib/game-engine';

interface StoryEntry {
  id: string;
  immersiveLore: string;
  tacticalSummary: string;
  engineAlert: string | null;
  mechanics?: TurnResult['mechanics'];
}

interface TimelineEntry {
  hash: string;
  hashShort: string;
  date: string;
  message: string;
  type: string;
  description: string;
  isCurrent: boolean;
  playerSnapshot: PlayerState;
  inventorySnapshot: InventoryState;
}

export function useGameState() {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [inventory, setInventory] = useState<InventoryState | null>(null);
  const [storyLog, setStoryLog] = useState<StoryEntry[]>([]);
  const [uiMode, setUiMode] = useState<'tactical' | 'immersive'>('tactical');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDiceRoll, setLastDiceRoll] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isServerless, setIsServerless] = useState<boolean | null>(null);

  // Initialize uiMode from localStorage on mount
  useEffect(() => {
    const savedUiMode = localStorage.getItem('chronos_ui_mode');
    if (savedUiMode === 'tactical' || savedUiMode === 'immersive') {
      setUiMode(savedUiMode);
    }
  }, []);

  const handleSetUiMode = useCallback((mode: 'tactical' | 'immersive') => {
    setUiMode(mode);
    localStorage.setItem('chronos_ui_mode', mode);
  }, []);

  const fetchState = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/state');
      if (!res.ok) {
        throw new Error('Failed to fetch game state');
      }
      const data = await res.json();
      
      if (data.isServerless) {
        setIsServerless(true);
        
        // Load player from localStorage
        const storedPlayer = localStorage.getItem('chronos_player');
        const storedInventory = localStorage.getItem('chronos_inventory');
        const storedStoryLog = localStorage.getItem('chronos_story_log');

        if (storedPlayer && storedInventory) {
          setPlayer(JSON.parse(storedPlayer));
          setInventory(JSON.parse(storedInventory));
          
          if (storedStoryLog) {
            setStoryLog(JSON.parse(storedStoryLog));
          } else {
            const initialLog: StoryEntry[] = [{ id: 'prologue', immersiveLore: data.chronicle, tacticalSummary: 'The Chronicle auto-initialized', engineAlert: '> Initialization complete.' }];
            setStoryLog(initialLog);
            localStorage.setItem('chronos_story_log', JSON.stringify(initialLog));
          }
        } else {
          // Initialize fresh local session
          setPlayer(data.player);
          setInventory(data.inventory);
          
          const initialLog: StoryEntry[] = [{ id: 'prologue', immersiveLore: data.chronicle, tacticalSummary: 'The Chronicle auto-initialized', engineAlert: '> Initialization complete.' }];
          setStoryLog(initialLog);
          
          localStorage.setItem('chronos_player', JSON.stringify(data.player));
          localStorage.setItem('chronos_inventory', JSON.stringify(data.inventory));
          localStorage.setItem('chronos_story_log', JSON.stringify(initialLog));

          // Also initialize timeline if empty
          if (!localStorage.getItem('chronos_timeline')) {
            const initCommit: TimelineEntry = {
              hash: 'init-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
              hashShort: 'initial',
              date: new Date().toISOString(),
              message: 'game: QUEST | The Chronicle auto-initialized',
              type: 'QUEST',
              description: 'The Chronicle auto-initialized',
              isCurrent: true,
              playerSnapshot: data.player,
              inventorySnapshot: data.inventory,
            };
            const timeline = [initCommit];
            localStorage.setItem('chronos_timeline', JSON.stringify(timeline));
            
            const branches = { main: timeline };
            localStorage.setItem('chronos_branches', JSON.stringify(branches));
            localStorage.setItem('chronos_current_branch', 'main');
          }
        }
      } else {
        setIsServerless(false);
        setPlayer(data.player);
        setInventory(data.inventory);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  }, []);

  const submitAction = useCallback(async (action: string) => {
    setIsLoading(true);
    setIsRolling(true);
    setError(null);

    // Start dice animation timer — resolves after 600ms
    const diceTimer = new Promise<void>((resolve) => setTimeout(resolve, 600));

    try {
      const isClientServerless = isServerless === true;
      const payload: Record<string, any> = { action };

      if (isClientServerless) {
        // Retrieve latest values directly from state to avoid stale closure references
        const storedPlayer = localStorage.getItem('chronos_player');
        const storedInventory = localStorage.getItem('chronos_inventory');
        if (storedPlayer && storedInventory) {
          payload.playerState = JSON.parse(storedPlayer);
          payload.inventoryState = JSON.parse(storedInventory);
        }
      }

      const [, res] = await Promise.all([
        diceTimer.then(() => setIsRolling(false)),
        fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
      ]);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to process action');
      }

      const result: TurnResult = await res.json();

      setPlayer(result.playerState);
      setInventory(result.inventory);

      const newStoryEntry: StoryEntry = {
        id: String(Date.now()),
        immersiveLore: result.immersiveLore,
        tacticalSummary: result.tacticalSummary,
        engineAlert: result.engineAlert,
        mechanics: result.mechanics,
      };

      setStoryLog((prev) => {
        const updated = [...prev, newStoryEntry];
        if (isClientServerless) {
          localStorage.setItem('chronos_story_log', JSON.stringify(updated));
        }
        return updated;
      });

      if (result.mechanics?.diceRoll) {
        setLastDiceRoll(result.mechanics.diceRoll);
      }

      setIsGameOver(result.isGameOver);

      if (isClientServerless) {
        // Save states
        localStorage.setItem('chronos_player', JSON.stringify(result.playerState));
        localStorage.setItem('chronos_inventory', JSON.stringify(result.inventory));

        // Create client-side commit for timeline
        const commitType = result.mechanics.commitType;
        const commitDesc = result.mechanics.commitDescription;
        const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        const newCommit: TimelineEntry = {
          hash,
          hashShort: hash.substring(0, 7),
          date: new Date().toISOString(),
          message: `game: ${commitType} | ${commitDesc}`,
          type: commitType,
          description: commitDesc,
          isCurrent: true,
          playerSnapshot: result.playerState,
          inventorySnapshot: result.inventory,
        };

        const storedTimeline = localStorage.getItem('chronos_timeline');
        let timeline: TimelineEntry[] = storedTimeline ? JSON.parse(storedTimeline) : [];
        
        // Mark previous commits as not current
        timeline = timeline.map(c => ({ ...c, isCurrent: false }));
        timeline.push(newCommit);
        
        localStorage.setItem('chronos_timeline', JSON.stringify(timeline));

        // Update branch catalog
        const currentBranch = localStorage.getItem('chronos_current_branch') || 'main';
        const storedBranches = localStorage.getItem('chronos_branches');
        const branches = storedBranches ? JSON.parse(storedBranches) : {};
        branches[currentBranch] = timeline;
        localStorage.setItem('chronos_branches', JSON.stringify(branches));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsRolling(false);
      setIsLoading(false);
    }
  }, [isServerless]);

  const refreshState = useCallback(async () => {
    // If serverless, load fresh state from localStorage instead of hitting api
    const storedServerless = localStorage.getItem('chronos_is_serverless') || (isServerless ? 'true' : 'false');
    
    if (storedServerless === 'true') {
      const storedPlayer = localStorage.getItem('chronos_player');
      const storedInventory = localStorage.getItem('chronos_inventory');
      const storedStoryLog = localStorage.getItem('chronos_story_log');

      if (storedPlayer && storedInventory) {
        setPlayer(JSON.parse(storedPlayer));
        setInventory(JSON.parse(storedInventory));
        
        // Check game over
        const playerObj = JSON.parse(storedPlayer);
        setIsGameOver(playerObj.health.current <= 0);
      }
      if (storedStoryLog) {
        setStoryLog(JSON.parse(storedStoryLog));
      }
    } else {
      await fetchState();
    }
  }, [fetchState, isServerless]);

  // Fetch state on mount
  useEffect(() => {
    fetchState();
    
    const handleStateChange = () => {
      refreshState();
    };

    window.addEventListener('chronos_state_change', handleStateChange);
    return () => {
      window.removeEventListener('chronos_state_change', handleStateChange);
    };
  }, [fetchState, refreshState]);


  // Keep an indicator of serverless mode in localStorage for easy lookup
  useEffect(() => {
    if (isServerless !== null) {
      localStorage.setItem('chronos_is_serverless', String(isServerless));
    }
  }, [isServerless]);

  return {
    player,
    inventory,
    storyLog,
    uiMode,
    setUiMode: handleSetUiMode,
    isLoading,
    error,
    lastDiceRoll,
    isRolling,
    isGameOver,
    submitAction,
    refreshState,
    isServerless,
  };
}
