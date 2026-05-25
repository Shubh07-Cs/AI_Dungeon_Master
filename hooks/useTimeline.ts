'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlayerState, InventoryState } from '@/lib/game-engine';

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

export function useTimeline() {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTimeline = useCallback(async () => {
    try {
      const res = await fetch('/api/timeline');
      if (!res.ok) throw new Error('Failed to fetch timeline');
      const data = await res.json();
      
      if (data.isServerless) {
        // Load from localStorage
        const storedTimeline = localStorage.getItem('chronos_timeline');
        if (storedTimeline) {
          setTimeline(JSON.parse(storedTimeline));
        }
      } else {
        setTimeline(data.timeline || []);
      }
    } catch (err) {
      console.error('Timeline fetch error:', err);
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch('/api/branch');
      if (!res.ok) throw new Error('Failed to fetch branches');
      const data = await res.json();
      
      if (data.isServerless) {
        // Load from localStorage
        const storedBranch = localStorage.getItem('chronos_current_branch');
        if (storedBranch) {
          setCurrentBranch(storedBranch);
        }
      } else {
        setCurrentBranch(data.current || 'main');
      }
    } catch (err) {
      console.error('Branch fetch error:', err);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    // Determine serverless directly from localStorage for quick responsive check
    const isServerless = localStorage.getItem('chronos_is_serverless') === 'true';

    if (isServerless) {
      const storedTimeline = localStorage.getItem('chronos_timeline');
      const storedBranch = localStorage.getItem('chronos_current_branch');
      if (storedTimeline) {
        setTimeline(JSON.parse(storedTimeline));
      }
      if (storedBranch) {
        setCurrentBranch(storedBranch);
      }
      setIsLoading(false);
    } else {
      await Promise.all([fetchTimeline(), fetchBranches()]);
      setIsLoading(false);
    }
  }, [fetchTimeline, fetchBranches]);

  const timeTravel = useCallback(
    async (hash: string) => {
      setIsLoading(true);
      try {
        const isServerless = localStorage.getItem('chronos_is_serverless') === 'true';

        if (isServerless) {
          const storedTimeline = localStorage.getItem('chronos_timeline');
          if (!storedTimeline) throw new Error('No timeline found');

          let timelineArr: TimelineEntry[] = JSON.parse(storedTimeline);
          const targetIndex = timelineArr.findIndex((c) => c.hash === hash);

          if (targetIndex === -1) throw new Error('Anchor point not found');

          const targetCommit = timelineArr[targetIndex];

          // Restore state snapshots
          localStorage.setItem('chronos_player', JSON.stringify(targetCommit.playerSnapshot));
          localStorage.setItem('chronos_inventory', JSON.stringify(targetCommit.inventorySnapshot));

          // Reconstruct story log: keep prologue and turns up to target commit's turns_played
          const storedStoryLog = localStorage.getItem('chronos_story_log');
          if (storedStoryLog) {
            const storyLog = JSON.parse(storedStoryLog);
            const turnsPlayed = targetCommit.playerSnapshot.turns_played;
            
            // Keep prologue (index 0) + matching turns
            // Let's filter the entries. Turn 0 is always there. Subsequent turns have turn counts.
            const filteredLog = storyLog.slice(0, turnsPlayed + 1);
            localStorage.setItem('chronos_story_log', JSON.stringify(filteredLog));
          }

          // Truncate timeline after the travel target
          timelineArr = timelineArr.slice(0, targetIndex + 1);
          timelineArr = timelineArr.map((c) => ({
            ...c,
            isCurrent: c.hash === hash,
          }));

          localStorage.setItem('chronos_timeline', JSON.stringify(timelineArr));

          // Save active branch timeline
          const activeBranch = localStorage.getItem('chronos_current_branch') || 'main';
          const storedBranches = localStorage.getItem('chronos_branches');
          const branches = storedBranches ? JSON.parse(storedBranches) : {};
          branches[activeBranch] = timelineArr;
          localStorage.setItem('chronos_branches', JSON.stringify(branches));

          // Custom event to notify other components to refresh
          window.dispatchEvent(new Event('chronos_state_change'));
          
          await refresh();
        } else {
          const res = await fetch('/api/time-travel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commitHash: hash }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Time travel failed');
          }
          // Refresh everything after time travel
          await refresh();
        }
      } catch (err) {
        console.error('Time travel error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [refresh]
  );

  const createBranch = useCallback(
    async (name: string) => {
      setIsLoading(true);
      try {
        const isServerless = localStorage.getItem('chronos_is_serverless') === 'true';

        if (isServerless) {
          const storedBranches = localStorage.getItem('chronos_branches');
          const branches = storedBranches ? JSON.parse(storedBranches) : {};
          
          if (branches[name]) {
            throw new Error('Reality branch already exists');
          }

          // Fork active timeline
          const activeBranch = localStorage.getItem('chronos_current_branch') || 'main';
          const forkedTimeline = branches[activeBranch] || timeline;

          branches[name] = [...forkedTimeline];
          localStorage.setItem('chronos_branches', JSON.stringify(branches));
          localStorage.setItem('chronos_current_branch', name);
          localStorage.setItem('chronos_timeline', JSON.stringify(forkedTimeline));

          setCurrentBranch(name);
          await refresh();
        } else {
          const res = await fetch('/api/branch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', branchName: name }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to create branch');
          }
          await refresh();
        }
      } catch (err) {
        console.error('Branch creation error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [refresh, timeline]
  );

  // Fetch on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    timeline,
    currentBranch,
    isLoading,
    timeTravel,
    createBranch,
    refresh,
  };
}
