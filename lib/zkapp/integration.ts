import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface StravaActivity {
  id: number;
  distance: number;
  moving_time: number;
  start_date: string;
  type: string;
}

export class ProofOfStravaGenerator {
  private backend: BarretenbergBackend | null = null;
  private noir: Noir | null = null;
  
  async initialize() {
    const circuitPath = path.join(process.cwd(), 'lib/zkapp/target/proof_of_strava.json');
    const circuitData = JSON.parse(fs.readFileSync(circuitPath, 'utf-8'));
    this.backend = new BarretenbergBackend(circuitData);
    this.noir = new Noir(circuitData);
  }
  
  async fetchStravaActivities(
    accessToken: string,
    year: number,
    month: number
  ): Promise<StravaActivity[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const after = Math.floor(startDate.getTime() / 1000);
    const before = Math.floor(endDate.getTime() / 1000);
    
    try {
      const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { after, before, per_page: 100 }
      });
      
      return response.data.filter((activity: StravaActivity) => 
        ['Run', 'Ride', 'VirtualRun', 'VirtualRide'].includes(activity.type)
      );
    } catch (error) {
      console.error('Error fetching Strava activities:', error);
      throw new Error('Failed to fetch Strava data');
    }
  }
  
  prepareCircuitInputs(
    activities: StravaActivity[],
    userId: string,
    monthTimestamp: number
  ): { inputs: Record<string, any>, qualifies: boolean, stats: any } {
    activities.sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    
    const limitedActivities = activities.slice(0, 31);
    
    const distances: string[] = new Array(31).fill('0');
    const durations: string[] = new Array(31).fill('0');
    
    limitedActivities.forEach((activity, index) => {
      distances[index] = Math.floor(activity.distance).toString();
      durations[index] = Math.floor(activity.moving_time / 60).toString();
    });
    
    const userIdHash = crypto.createHash('sha256').update(userId).digest('hex');
    const userIdHashBigInt = BigInt('0x' + userIdHash.slice(0, 62));
    const userIdHashField = userIdHashBigInt.toString();
    
    const totalDistance = limitedActivities.reduce((sum, a) => sum + a.distance, 0);
    const totalDuration = limitedActivities.reduce((sum, a) => sum + a.moving_time / 60, 0);
    const avgDistance = limitedActivities.length > 0 ? totalDistance / limitedActivities.length : 0;
    
    const qualifies = 
      limitedActivities.length >= 12 &&
      avgDistance >= 5000 &&
      totalDuration >= 600;
    
    return {
      inputs: {
        workout_count: limitedActivities.length.toString(),
        workout_distances: distances,
        workout_durations: durations,
        user_id_hash: userIdHashField,
        month_timestamp: monthTimestamp.toString(),
        qualifies: qualifies
      },
      qualifies,
      stats: {
        workoutCount: limitedActivities.length,
        totalDistance: totalDistance,
        avgDistance: avgDistance,
        totalDuration: totalDuration
      }
    };
  }
  
  async generateProof(inputs: Record<string, any>) {
    if (!this.noir || !this.backend) throw new Error('Not initialized');
    
    console.log('Generating proof...');
    const { witness } = await this.noir.execute(inputs);
    const proof = await this.backend.generateProof(witness);
    console.log('✓ Proof generated!');
    return proof;
  }
  
  async verifyProof(proofData: any): Promise<boolean> {
    if (!this.backend) throw new Error('Not initialized');
    
    console.log('Verifying proof...');
    const verified = await this.backend.verifyProof(proofData);
    console.log('Verification:', verified ? 'SUCCESS ✓' : 'FAILED ✗');
    return verified;
  }
  
  async generateInsuranceProof(
    stravaAccessToken: string,
    userId: string,
    year: number,
    month: number
  ) {
    console.log(`\n🏃 Fetching Strava activities for ${year}-${month}...`);
    const activities = await this.fetchStravaActivities(stravaAccessToken, year, month);
    console.log(`Found ${activities.length} activities\n`);
    
    const monthTimestamp = year * 100 + month;
    const { inputs, qualifies, stats } = this.prepareCircuitInputs(activities, userId, monthTimestamp);
    
    console.log(`📊 Workout count: ${inputs.workout_count}`);
    console.log(`🎯 Qualifies: ${qualifies ? 'YES ✓' : 'NO ✗'}\n`);
    
    if (!qualifies) {
      console.log('⚠️  Note: Circuit expects qualifying data. This will fail proof generation.');
      console.log('   The circuit is designed to only generate proofs for qualifying workouts.\n');
    }
    
    try {
      const proofData = await this.generateProof(inputs);
      const verified = await this.verifyProof(proofData);
      
      return { proofData, verified, qualifies, stats };
    } catch (error) {
      if (!qualifies) {
        console.log('❌ Proof generation failed (expected - you don\'t qualify yet)');
        return { proofData: null, verified: false, qualifies, stats };
      }
      throw error;
    }
  }
}
