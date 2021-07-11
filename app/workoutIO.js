import * as fs from "fs";

export function weightTrainingRecordsExists() {
  return fs.existsSync("/private/data/weight-training.txt");
}

export function getWeightTrainingRecords() {
  return fs.readFileSync("weight-training.txt", "json");
}

export function saveWeightTrainingRecords(weighttrainingjson) {
  fs.writeFileSync("weight-training.txt", weighttrainingjson, "json");
}

export function workoutTypesExists() {
  return fs.existsSync("/private/data/workout-type.txt");
}

export function getWorkoutTypes() {
  return fs.readFileSync("workout-type.txt", "json");
}

export function saveWorkoutTypes(workoutTypesData) {
  fs.writeFileSync("workout-type.txt", workoutTypesData, "json");
}