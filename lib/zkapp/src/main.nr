global MIN_WORKOUTS: u32 = 12;
global MIN_AVG_DISTANCE: u32 = 5000;
global MIN_TOTAL_DURATION: u32 = 600;

fn main(
    workout_count: u32,
    workout_distances: [u32; 31],
    workout_durations: [u32; 31],
    user_id_hash: Field,
    month_timestamp: pub Field,
    qualifies: pub bool
) {
    assert(workout_count >= MIN_WORKOUTS);
    assert(workout_count <= 31);
    
    let mut total_distance: u32 = 0;
    let mut total_duration: u32 = 0;
    
    for i in 0..31 {
        if i < workout_count {
            total_distance += workout_distances[i];
            total_duration += workout_durations[i];
            
            assert(workout_distances[i] > 0);
            assert(workout_distances[i] < 100000);
            assert(workout_durations[i] > 0);
            assert(workout_durations[i] < 600);
        }
    }
    
    assert(total_duration >= MIN_TOTAL_DURATION);
    
    let avg_distance = total_distance / workout_count;
    assert(avg_distance >= MIN_AVG_DISTANCE);
    
    assert(user_id_hash != 0);
    assert(qualifies == true);
}

#[test]
fn test_qualifying_workouts() {
    let mut distances: [u32; 31] = [0; 31];
    let mut durations: [u32; 31] = [0; 31];
    
    for i in 0..15 {
        distances[i] = 6000;
        durations[i] = 45;
    }
    
    main(15, distances, durations, 12345, 202412, true);
}

#[test(should_fail)]
fn test_insufficient_workouts() {
    let mut distances: [u32; 31] = [0; 31];
    let mut durations: [u32; 31] = [0; 31];
    
    for i in 0..8 {
        distances[i] = 6000;
        durations[i] = 45;
    }
    
    main(8, distances, durations, 12345, 202412, true);
}
