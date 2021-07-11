/*
 * Entry point for the watch app
 */
import document from "document";
import me from "appbit";
import device from "device";
import * as fs from "fs";
import * as workoutMessaging from "./workoutMessaging.js";
import * as workoutIO from "./workoutIO.js";
import { appView } from "./appView.js";
import { workoutStage } from "./workoutStage.js";
import { vibration } from "haptics";

let count = 0;
let sets = 0;
let reps = 0;
let weight = 0;
let date;
let weightTrainingRecords = new Array();
let workouttypes;
let selectedworkouttype;
let selectednumber;
let activeView;
let activeWorkoutStage;
let nextWorkoutStage;
let recordInProgress = false;
let stopCountdown = false;

let root = document.getElementById('root');

// views
let menuview = document.getElementById("menuview");
let counterview = document.getElementById("counterview");
let workoutTypeSelectorView = document.getElementById("workoutTypeSelectorView");
let numberSelectorView = document.getElementById("numberSelectorView");

// counter view elements
let countertext = document.getElementById("countertext");
let incrementbutton = document.getElementById("incrementbutton");
let donebutton = document.getElementById("donebutton");
let syncbutton = document.getElementById("syncbutton");
let stopalarmbutton = document.getElementById("stopalarmbutton");
let stopearlybutton = document.getElementById("stopearlybutton");

// menu view elements
let menubackbutton = document.getElementById("menubackbutton");
let startcounterbutton = document.getElementById("startcounterbutton");

// workout type selector
let workouttypeselectorheader = document.getElementById("workouttypeselectorheader");
let workouttypeselectortext = document.getElementById("workouttypeselectortext");
let workoutTypeList = document.getElementById("workout-type-list");

// number selector
let numberselectorheader = document.getElementById("numberselectorheader");
let numberselectortext = document.getElementById("numberselectortext");
let numberList = document.getElementById("number-list");

const views = {
  [appView.MENU]: menuview,
  [appView.COUNTER]: counterview,
  [appView.WORKOUT_TYPE_SELECTOR]: workoutTypeSelectorView,
  [appView.NUMBER_SELECTOR]: numberSelectorView
};

init();

function init() {
  me.onunload = saveWeightTrainingRecords;
  workoutMessaging.startUp(messageHandler);

  clearViews();
  changeView(appView.MENU);

  numberselectorheader.layer = 1;
  workouttypeselectorheader.layer = 1;
  numberselectortext.layer = 2;
  workouttypeselectortext.layer = 2;

  loadData();

  me.appTimeoutEnabled = false;
}

workoutTypeList.delegate = {
  getTileInfo: function(index) {
    return {
      type: "type-list-pool",
      value: workouttypes[index],
      index: index
    };
  },
  configureTile: function(tile, info) {
    if (info.type == "type-list-pool") {
      tile.getElementById("text").text = info.value.description;
      let itemRect = tile.getElementById("tile-item-rect");
      itemRect.onclick = evt => {
        console.log(`itemRect pressed: ${info.index}`);
        selectedworkouttype = info.value;
        startWorkoutStage(workoutStage.REPS);
      };
    }
  }
};

workoutTypeList.length = workouttypes.length;

numberList.delegate = {
  getTileInfo: function(index) {
    return {
      type: "number-list-pool",
      index: index
    };
  },
  configureTile: function(tile, info) {
    if (info.type == "number-list-pool") {
      tile.getElementById("text").text = info.index;
      let itemRect = tile.getElementById("tile-item-rect");
      itemRect.onclick = evt => {
        console.log(`number itemRect pressed: ${info.index}`);
        setStageValue(activeWorkoutStage, info.index);
        numberList.length = 100;
        startWorkoutStage(nextWorkoutStage);
      };
    }
  }
};

numberList.length = 100;

startcounterbutton.onactivate = function(evt) {
  console.log("counter start button pressed");
  recordInProgress = true;
  changeView(appView.WORKOUT_TYPE_SELECTOR);
}

menubackbutton.onactivate = function(evt) {
  console.log("menu back button pressed");
  count = 0;
  changeView(appView.MENU);
}

incrementbutton.onactivate = function(evt) {
  count = count + 1;
  console.log("button pressed, count: " + count);
  
  let countdownTime = 30;
  countertext.text = countdownTime;
  incrementbutton.style.display = "none";
  donebutton.style.display = "none";
  menubackbutton.style.display = "none";
  stopearlybutton.style.display = "inline";
  doCountdown(countdownTime);
}

function doCountdown(time) {
  if (time !== 0) {
    if (stopCountdown) {
      stopearlybutton.style.display = "none";
      countertext.style.display = "inline";
      countertext.text = count;
      stopCountdown = false;
    }
    else {
      setTimeout(function(){ countertext.text = --time; doCountdown(time);  }, 1000);
    }
  }
  else {
    vibration.start("alert");
    stopearlybutton.style.display = "none";
    stopalarmbutton.style.display = "inline";
    countertext.style.display = "none";
    countertext.text = count;
  }
}

stopalarmbutton.onactivate = function(evt) {
  vibration.stop();
  stopalarmbutton.style.display = "none";
  countertext.style.display = "inline";
  incrementbutton.style.display = "inline";
  donebutton.style.display = "inline";
  menubackbutton.style.display = "inline";
}

stopearlybutton.onactivate = function(evt) {
  stopCountdown = true;
  stopearlybutton.style.display = "none";
  countertext.style.display = "inline";
  incrementbutton.style.display = "inline";
  donebutton.style.display = "inline";
  menubackbutton.style.display = "inline";
}

donebutton.onactivate = function(evt) {
  console.log("done pressed");
  recordInProgress = false;
  weightTrainingRecords.push(getCurrentRecord());
  console.log(JSON.stringify(weightTrainingRecords));
  saveWeightTrainingRecords();
  count = 0;
  countertext.text = count;
  workoutTypeList.length = workouttypes.length;
  changeView(appView.MENU);
}

function saveWeightTrainingRecordsToApp() {
  var request = {
    action: 'saveWeightTraining',
    data : {
      data : weightTrainingRecords
    }
  };
  console.log(JSON.stringify(request));
  workoutMessaging.send(request);
}

function getCurrentRecord() {
  date = new Date();
  return {
    sets : count,
    reps : reps,
    weight : weight,
    typeId : selectedworkouttype.typeId,
    date : {
      year: date.getFullYear(),
      month: date.getMonth(),
      dayOfMonth: date.getDate(),
      hourOfDay: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds()
    }
  };
}

syncbutton.onactivate = function(evt) {
  var request = {
    action: 'sync'
  };
  workoutMessaging.send(request);
  saveWeightTrainingRecordsToApp();
}

function loadData() {
  console.log("start data load");
  if (workoutIO.workoutTypesExists()) {
    let workouttypejson = workoutIO.getWorkoutTypes();
    workouttypes = workouttypejson;
    console.log("workout types loaded: " + JSON.stringify(workouttypes));
  }
  if (workoutIO.weightTrainingRecordsExists()) {
    let weighttrainingrecordsjson  = workoutIO.getWeightTrainingRecords();
    console.log("weight training records loaded: " + JSON.stringify(weighttrainingrecordsjson));
    weightTrainingRecords = weighttrainingrecordsjson.data;
    
    let currentRecord = weighttrainingrecordsjson.currentRecord;
    if (currentRecord !== undefined) {
      count = currentRecord.sets;
      reps = currentRecord.reps;
      weight = currentRecord.weight;
      date = new Date();
      date.setFullYear(currentRecord.date.year);
      date.setMonth(currentRecord.date.month);
      date.setDate(currentRecord.date.dayOfMonth);
      date.setHours(currentRecord.date.hourOfDay);
      date.setMinutes(currentRecord.date.minute);
      date.setSeconds(currentRecord.date.second);
      selectedworkouttype = weighttrainingrecordsjson.currentWorkoutType;
      
      console.log("workout stage start: " + JSON.stringify(weighttrainingrecordsjson.currentStage));
      startWorkoutStage(weighttrainingrecordsjson.currentStage);
    }
  }
}

function saveWorkoutTypes(workoutTypeData) {
  console.log("start workout type save");
  workoutIO.saveWorkoutTypes(workoutTypeData);
}

function saveWeightTrainingRecords() {
  console.log("start weight training records save");
  let currentRecord;
  let saveData = {
    currentRecord: recordInProgress ? getCurrentRecord() : undefined,
    currentStage: recordInProgress ? activeWorkoutStage : undefined,
    currentWorkoutType: recordInProgress ? selectedworkouttype : undefined,
    data: weightTrainingRecords
  };
  console.log(JSON.stringify(saveData));
  workoutIO.saveWeightTrainingRecords(saveData);
}

function messageHandler(evt) {
  const messageData = evt.data;
  switch(messageData.action) {
    case 'sync':
      workouttypes = messageData.data;
      saveWorkoutTypes(messageData.data);
      workoutTypeList.length = workouttypes.length;
      console.log("workout types synced: " + JSON.stringify(workouttypes));
      break;
    case 'clearWeightTrainingRecords':
      console.log("clear weight training records");
      weightTrainingRecords = new Array();
      break;
    default:
      break;
  }
}

function changeView(view) {
  if (activeView !== undefined) {
    views[activeView].style.display = "none";
  }
  views[view].style.display = "inline";
  activeView = view;
}

function clearViews() {
  for (const view in views) {
    views[view].style.display = "none";
  }
}

function startWorkoutStage(stage) {
  switch(stage) {
    case workoutStage.REPS:
      activeWorkoutStage = stage;
      nextWorkoutStage = workoutStage.WEIGHT;
      numberselectortext.x = (device.screen.width / 2) - 30;
      numberselectortext.text = "Reps";
      changeView(appView.NUMBER_SELECTOR);
      break;
    case workoutStage.WEIGHT:
      activeWorkoutStage = stage;
      nextWorkoutStage = workoutStage.SETS;
      numberselectortext.x = (device.screen.width / 2) - 35;
      numberselectortext.text = "Weight";
      changeView(appView.NUMBER_SELECTOR);
      break;
    case workoutStage.SETS:
      activeWorkoutStage = stage;
      countertext.text = count;
      stopalarmbutton.style.display = "none";
      stopearlybutton.style.display = "none";
      changeView(appView.COUNTER);
      break;
    default:
      break;
  }
}

function setStageValue(stage, value) {
  switch(stage) {
    case workoutStage.REPS:
      reps = value;
      break;
    case workoutStage.WEIGHT:
      weight = value;
      break;
    default:
      break;
  }
}