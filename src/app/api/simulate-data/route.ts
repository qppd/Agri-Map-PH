import { NextRequest, NextResponse } from 'next/server';
import { simulateAndSaveEntries } from '@/lib/simulateData';

export async function POST(req: NextRequest) {
  try {
    await simulateAndSaveEntries(100);
    return NextResponse.json({ message: 'Simulation complete. 100 entries added.' });
  } catch (e: unknown) {
    let message = 'Simulation failed.';
    if (e && typeof e === 'object' && 'message' in e && typeof (e as any).message === 'string') {
      message = (e as { message: string }).message;
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
