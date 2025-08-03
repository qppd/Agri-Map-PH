import { NextRequest, NextResponse } from 'next/server';
import { simulateAndSaveEntries } from '@/lib/simulateData';

export async function POST(req: NextRequest) {
  try {
    await simulateAndSaveEntries(100);
    return NextResponse.json({ message: 'Simulation complete. 100 entries added.' });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || 'Simulation failed.' }, { status: 500 });
  }
}
