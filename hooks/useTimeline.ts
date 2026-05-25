'use client';

import { useState, useEffect, useCallback } from 'react';

interface TimelineEntry {
  hash: string;
  hashShort: string;
  date: string;
  message: string;
  type: string;
  description: string;
  isCurrent: boolean;
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
      setTimeline(data.timeline || []);
    } catch (err) {
      console.error('Timeline fetch error:', err);
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch('/api/branch');
      if (!res.ok) throw new Error('Failed to fetch branches');
      const data = await res.json();
      setCurrentBranch(data.current || 'main');
    } catch (err) {
      console.error('Branch fetch error:', err);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchTimeline(), fetchBranches()]);
    setIsLoading(false);
  }, [fetchTimeline, fetchBranches]);

  const timeTravel = useCallback(
    async (hash: string) => {
      setIsLoading(true);
      try {
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
        const res = await fetch('/api/branch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', branchName: name }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to create branch');
        }
        // Refresh branches after creation
        await refresh();
      } catch (err) {
        console.error('Branch creation error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [refresh]
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
