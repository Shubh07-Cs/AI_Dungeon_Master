import { NextResponse } from 'next/server';
import { simpleGit } from 'simple-git';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const git = simpleGit(process.cwd());
    
    // We only need basic stats for the tooltip, so we read game/characters/player.json
    // from the specified commit hash.
    const fileContent = await git.show([`${hash}:game/characters/player.json`]);
    
    if (!fileContent) {
      return NextResponse.json({ error: 'Player state not found at this commit' }, { status: 404 });
    }
    
    const playerState = JSON.parse(fileContent);
    return NextResponse.json({ player: playerState });
  } catch (error) {
    console.error(`Error fetching state for hash:`, error);
    return NextResponse.json({ error: 'Failed to fetch state for commit' }, { status: 500 });
  }
}
