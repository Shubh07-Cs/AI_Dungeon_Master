import { simpleGit, SimpleGit, LogResult } from 'simple-git';
import path from 'path';

export interface TimelineEntry {
  hash: string;
  hashShort: string;
  date: string;
  message: string;
  type: string;
  description: string;
  isCurrent: boolean;
}

export interface BranchInfo {
  name: string;
  current: boolean;
}

const GAME_DIR = path.join(process.cwd(), process.env.GAME_DIR || 'game');

function getGit(): SimpleGit {
  return simpleGit(process.cwd());
}

/**
 * Parse a game commit message like "game: LOOT | Found a Silver Ring"
 * into { type: "LOOT", description: "Found a Silver Ring" }
 */
function parseCommitMessage(message: string): { type: string; description: string } {
  const match = message.match(/^game:\s*(\w+)\s*\|\s*(.+)$/);
  if (match) {
    return { type: match[1], description: match[2].trim() };
  }
  return { type: 'SYSTEM', description: message };
}

/**
 * Get the git commit timeline, parsed into structured entries
 */
export async function getTimeline(maxCount: number = 50): Promise<TimelineEntry[]> {
  const git = getGit();

  try {
    const log: LogResult = await git.log({ maxCount });
    const currentHash = (await git.revparse(['HEAD'])).trim();

    return log.all.map((entry) => {
      const parsed = parseCommitMessage(entry.message);
      return {
        hash: entry.hash,
        hashShort: entry.hash.substring(0, 7),
        date: entry.date,
        message: entry.message,
        type: parsed.type,
        description: parsed.description,
        isCurrent: entry.hash === currentHash,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Time travel: reset the repo to a specific commit hash
 */
export async function timeTravel(commitHash: string): Promise<{ success: boolean; error?: string }> {
  const git = getGit();

  try {
    // Validate the hash exists
    await git.revparse([commitHash]);

    // Hard reset to the target commit
    await git.reset(['--hard', commitHash]);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during time travel';
    return { success: false, error: message };
  }
}

/**
 * Commit all game state files with a structured message
 */
export async function commitGameState(
  type: string,
  description: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  const git = getGit();
  const message = `game: ${type} | ${description}`;

  try {
    // Stage all game files
    await git.add(path.join(GAME_DIR, '**'));

    // Commit
    const result = await git.commit(message);

    return {
      success: true,
      hash: result.commit || undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during commit';
    return { success: false, error: message };
  }
}

/**
 * Create a new branch (alternate reality)
 */
export async function createBranch(branchName: string): Promise<{ success: boolean; error?: string }> {
  const git = getGit();

  try {
    await git.checkoutLocalBranch(branchName);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error creating branch';
    return { success: false, error: message };
  }
}

/**
 * List all branches
 */
export async function listBranches(): Promise<BranchInfo[]> {
  const git = getGit();

  try {
    const branches = await git.branch();
    return branches.all.map((name) => ({
      name: name.replace('remotes/origin/', ''),
      current: name === branches.current,
    }));
  } catch {
    return [];
  }
}

/**
 * Switch to a different branch
 */
export async function switchBranch(branchName: string): Promise<{ success: boolean; error?: string }> {
  const git = getGit();

  try {
    await git.checkout(branchName);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error switching branch';
    return { success: false, error: message };
  }
}

/**
 * Get the current branch name
 */
export async function getCurrentBranch(): Promise<string> {
  const git = getGit();

  try {
    const branches = await git.branch();
    return branches.current;
  } catch {
    return 'unknown';
  }
}

/**
 * Auto-initialize play branch: if currently on 'main', auto-create/checkout 'chronicle' branch
 */
export async function autoInitializePlayBranch(): Promise<string> {
  const current = await getCurrentBranch();
  
  if (current === 'main') {
    const git = getGit();
    try {
      const branches = await git.branchLocal();
      const hasChronicle = branches.all.includes('chronicle');
      
      if (!hasChronicle) {
        await git.checkoutLocalBranch('chronicle');
      } else {
        await git.checkout('chronicle');
      }
      return 'chronicle';
    } catch (err) {
      console.error('Error auto-initializing play branch:', err);
    }
  }
  return current;
}

