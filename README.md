# Workout Fitbit Companion App
A Fitbit app for use with the Android app in my Workout repo that allows for a user to enter workouts as they are performed and send them to the app.

## Current State
This app is pretty functional since I was actively using it while working out, the biggest outstanding issues are adding security to the REST calls and a bug that
causes duplicate data to sync. Although there is an option in the Android app to delete duplicate data, it was just a temp fix.

## Features
- Allows the user to enter workout records including sets, reps, and weight for workout types set up in the Android app
- The sync button on the main screen allows you to sync workout types from the Android app and sync workout records to the app
- After specifying the workout type, reps, and weight there is a counter for sets, allowing you to enter them as they are performed
- After a set the app starts a 30 second cooldown timer and which vibrates when it's time to start another set
