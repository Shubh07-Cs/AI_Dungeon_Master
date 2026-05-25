import { NextResponse } from 'next/server';
import { createBranch, listBranches, switchBranch, getCurrentBranch } from '@/lib/git-manager';
import { isServerless } from '@/lib/game-engine';

export async function GET() {
  try {
    if (isServerless()) {
      return NextResponse.json({
        branches: [{ name: 'main', current: true }],
        current: 'main',
        isServerless: true,
      });
    }

    const branches = await listBranches();
    const current = await getCurrentBranch();
    return NextResponse.json({ branches, current, isServerless: false });
  } catch (error) {
    console.error('Branch route error:', error);
    return NextResponse.json(
      { error: 'Failed to list branches' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (isServerless()) {
      return NextResponse.json({
        success: true,
        message: 'Reality branched in client timeline',
        isServerless: true,
      });
    }

    const { action, branchName } = await request.json();


    if (!branchName || typeof branchName !== 'string') {
      return NextResponse.json(
        { error: 'branchName is required' },
        { status: 400 }
      );
    }

    if (action === 'create') {
      const result = await createBranch(branchName);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to create branch' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: `Alternate reality "${branchName}" created and activated`,
      });
    }

    if (action === 'switch') {
      const result = await switchBranch(branchName);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to switch branch' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: `Shifted to reality "${branchName}"`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "create" or "switch"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Branch route error:', error);
    return NextResponse.json(
      { error: 'Failed to manage branches' },
      { status: 500 }
    );
  }
}
