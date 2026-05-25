'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlayerState, InventoryState, DiceRoll, TurnResult } from '@/lib/game-engine';

interface StoryEntry {
  id: string;
  narration: string;
  mechanics?: TurnResult['mechanics'];
}

export function useGameState() {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [inventory, setInventory] = useState<InventoryState | null>(null);
  const [storyLog, setStoryLog] = useState<StoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDiceRoll, setLastDiceRoll] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const fetchState = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/state');
      if (!res.ok) {
        throw new Error('Failed to fetch game state');
      }
      const data = await res.json();
      setPlayer(data.player);
      setInventory(data.inventory);
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
      const [, res] = await Promise.all([
        diceTimer.then(() => setIsRolling(false)),
        fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }),
      ]);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to process action');
      }

      const result: TurnResult = await res.json();

      setPlayer(result.playerState);
      setInventory(result.inventory);

      setStoryLog((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          narration: result.narration,
          mechanics: result.mechanics,
        },
      ]);

      if (result.mechanics?.diceRoll) {
        setLastDiceRoll(result.mechanics.diceRoll);
      }

      setIsGameOver(result.isGameOver);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsRolling(false);
      setIsLoading(false);
    }
  }, []);

  const refreshState = useCallback(async () => {
    await fetchState();
  }, [fetchState]);

  // Fetch state on mount
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return {
    player,
    inventory,
    storyLog,
    isLoading,
    error,
    lastDiceRoll,
    isRolling,
    isGameOver,
    submitAction,
    refreshState,
  };
}
