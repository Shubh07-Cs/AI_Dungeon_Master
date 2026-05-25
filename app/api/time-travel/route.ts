import { NextResponse } from 'next/server';
import { timeTravel } from '@/lib/git-manager';
import { readPlayerState, readInventory } from '@/lib/game-engine';

export async function POST(request: Request) {
  try {
    const { commitHash } = await request.json();

    if (!commitHash || typeof commitHash !== 'string') {
      return NextResponse.json(
        { error: 'commitHash is required' },
        { status: 400 }
      );
    }

    // Execute time travel
    const result = await timeTravel(commitHash);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Time travel failed' },
        { status: 500 }
      );
    }

    // Read restored state
    const [player, inventory] = await Promise.all([
      readPlayerState(),
      readInventory(),
    ]);

    return NextResponse.json({
      success: true,
      message: `Reality restored to anchor point ${commitHash.substring(0, 7)}`,
      player,
      inventory,
    });
  } catch (error) {
    console.error('Time travel route error:', error);
    return NextResponse.json(
      { error: 'Temporal anomaly — time travel failed' },
      { status: 500 }
    );
  }
}
