/*
 * Entry point for the companion app
 */
import * as workoutClient from "./workoutClient.js";
import * as workoutMessaging from "./workoutMessaging.js";

console.log("Companion code started");

workoutMessaging.startUp(messageHandler);

function messageHandler(evt) {
  const messageData = evt.data;
  switch(messageData.action) {
    case 'sync':
      console.log("Sync Called");
      workoutClient.getWorkoutTypes().then(function(responseJson) {
        const response = {
          action : 'sync',
          data : responseJson
        }
        workoutMessaging.send(response);
      });
      break;
    case 'saveWeightTraining':
      console.log("Save Weight Training");
      console.log(JSON.stringify(messageData.data));
      workoutClient.saveWeightTraining(messageData.data).then(function(appResponse) {
        if (appResponse.ok) {
          const response = {
            action : 'clearWeightTrainingRecords'
          }
          workoutMessaging.send(response);
        }
      });
      break;
    default:
      break;
  }
}