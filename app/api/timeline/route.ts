import { NextResponse } from 'next/server';
import { getTimeline } from '@/lib/git-manager';

export async function GET() {
  try {
    const timeline = await getTimeline(50);
    return NextResponse.json({ timeline });
  } catch (error) {
    console.error('Timeline route error:', error);
    return NextResponse.json(
      { error: 'Failed to read timeline' },
      { status: 500 }
    );
  }
}
