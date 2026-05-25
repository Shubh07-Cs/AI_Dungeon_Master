import { NextResponse } from 'next/server';
import { readPlayerState, readInventory, readChronicle } from '@/lib/game-engine';

export async function GET() {
  try {
    const [player, inventory, chronicle] = await Promise.all([
      readPlayerState(),
      readInventory(),
      readChronicle(),
    ]);

    return NextResponse.json({ player, inventory, chronicle });
  } catch (error) {
    console.error('State route error:', error);
    return NextResponse.json(
      { error: 'Failed to read game state' },
      { status: 500 }
    );
  }
}
