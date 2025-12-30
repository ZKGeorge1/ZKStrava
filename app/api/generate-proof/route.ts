import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { stravaToken, month, year } = await request.json();

    if (!stravaToken || !month || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Always return demo mode message on Vercel
    return NextResponse.json({
      error: 'This is a UI demo. Zero-knowledge proof generation requires local setup.\n\n✨ To generate real proofs:\n1. Clone: git clone https://github.com/ZKGeorge1/ZKStrava.git\n2. Install: npm install\n3. Run: npm run dev\n4. Open: http://localhost:3001\n\nThe full zkApp works perfectly locally with Strava OAuth and ZK proof generation!',
      demoMode: true
    });
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json(
      { error: 'Demo mode - see GitHub for full implementation' },
      { status: 500 }
    );
  }
}
