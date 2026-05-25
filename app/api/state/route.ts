import { NextResponse } from 'next/server';
import { readPlayerState, readInventory, readChronicle, isServerless } from '@/lib/game-engine';
import { autoInitializePlayBranch } from '@/lib/git-manager';
import { INITIAL_PLAYER_STATE, INITIAL_INVENTORY_STATE, INITIAL_CHRONICLE } from '@/lib/initial-state';

export async function GET() {
  try {
    if (isServerless()) {
      return NextResponse.json({
        player: INITIAL_PLAYER_STATE,
        inventory: INITIAL_INVENTORY_STATE,
        chronicle: INITIAL_CHRONICLE,
        isServerless: true,
      });
    }

    // Auto-switch away from main codebase branch to chronicle branch locally
    await autoInitializePlayBranch();

    const [player, inventory, chronicle] = await Promise.all([

      readPlayerState(),
      readInventory(),
      readChronicle(),
    ]);

    return NextResponse.json({
      player,
      inventory,
      chronicle,
      isServerless: false,
    });
  } catch (error) {
    console.error('State route error:', error);
    return NextResponse.json(
      { error: 'Failed to read game state' },
      { status: 500 }
    );
  }
}

