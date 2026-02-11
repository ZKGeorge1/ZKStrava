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

    // Check if running on Vercel
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
      // Demo mode on Vercel
      return NextResponse.json({
        error: 'This is a UI demo. Zero-knowledge proof generation requires local setup.\n\n✨ To generate real proofs:\n1. Clone: git clone https://github.com/ZKGeorge1/ZKStrava.git\n2. Install: npm install\n3. Run: npm run dev\n4. Open: http://localhost:3001',
        demoMode: true
      });
    }

    // Full proof generation locally
    const { ProofOfStravaGenerator } = await import('@/lib/zkapp/integration');
    
    console.log(`Generating proof for ${year}-${month}`);
    const generator = new ProofOfStravaGenerator();
    await generator.initialize();

    const result = await generator.generateInsuranceProof(
      stravaToken,
      'user123',
      year,
      month
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to generate proof' },
      { status: 500 }
    );
  }
}
