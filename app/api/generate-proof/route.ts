import { NextRequest, NextResponse } from 'next/server';
import { ProofOfStravaGenerator } from '@/lib/zkapp/integration';

export const maxDuration = 60; // Vercel Pro tier allows up to 60 seconds

export async function POST(request: NextRequest) {
  try {
    const { stravaToken, month, year } = await request.json();

    if (!stravaToken || !month || !year) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`📥 Generating proof for ${year}-${month}`);

    const generator = new ProofOfStravaGenerator();
    await generator.initialize();

    const result = await generator.generateInsuranceProof(
      stravaToken,
      'user123',
      year,
      month
    );

    console.log('✅ Proof generated successfully!');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
