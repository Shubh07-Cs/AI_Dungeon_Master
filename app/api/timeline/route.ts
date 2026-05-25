import { NextResponse } from 'next/server';
import { getTimeline } from '@/lib/git-manager';
import { isServerless } from '@/lib/game-engine';

export async function GET() {
  try {
    if (isServerless()) {
      return NextResponse.json({ timeline: [], isServerless: true });
    }

    const timeline = await getTimeline(50);
    return NextResponse.json({ timeline, isServerless: false });
  } catch (error) {
    console.error('Timeline route error:', error);
    return NextResponse.json(
      { error: 'Failed to read timeline' },
      { status: 500 }
    );
  }
}

