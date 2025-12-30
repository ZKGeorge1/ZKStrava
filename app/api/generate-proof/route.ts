import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

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

    // Path to your working zkApp
    const zkappPath = path.join(process.cwd(), '..', 'proof_of_strava');

    // Write .env file
    const envContent = `STRAVA_ACCESS_TOKEN=${stravaToken}
USER_ID=user123
PROOF_YEAR=${year}
PROOF_MONTH=${month}`;

    fs.writeFileSync(path.join(zkappPath, '.env'), envContent);

    // Run the proof generation
    const { stdout, stderr } = await execAsync('npm run prove', {
      cwd: zkappPath,
    });

    console.log('📊 Output:', stdout);

    // Parse the output
    const qualified = stdout.includes('QUALIFIED FOR INSURANCE DISCOUNT');
    const workoutMatch = stdout.match(/Workouts:\s*(\d+)/i);
    const distanceMatch = stdout.match(/Avg Distance:\s*([\d.]+)\s*km/i);
    const timeMatch = stdout.match(/Total Time:\s*([\d.]+)\s*hours/i);

    const workoutCount = workoutMatch ? parseInt(workoutMatch[1]) : 0;
    const avgDistance = distanceMatch ? parseFloat(distanceMatch[1]) * 1000 : 0;
    const totalDuration = timeMatch ? parseFloat(timeMatch[1]) * 60 : 0;

    return NextResponse.json({
      verified: true,
      qualifies: qualified,
      stats: {
        workoutCount,
        avgDistance,
        totalDuration,
      },
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
