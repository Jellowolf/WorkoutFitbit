export function getWorkoutTypes() {
  console.log("Get Workout Types Called");
  return fetch("http://127.0.0.1:7000/workoutTypes").then(function(response) {
    return response.json() 
  });
}

export function saveWeightTraining(weightTraining) {
  console.log("Start Fetch");
  return fetch("http://127.0.0.1:7000/weightTraining", {
    method: 'POST',
    body: JSON.stringify(weightTraining),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}