import * as messaging from "messaging";

export function startUp(messageHandler) {
  console.log("Register messaging handlers");
  messaging.peerSocket.onerror = errorHandler;
  messaging.peerSocket.onopen = openHandler;
  messaging.peerSocket.onmessage = messageHandler;
}

function errorHandler(err) {
  console.log("Connection error: " + err.code + " - " + err.message);
}

function openHandler() {}

export function send(request) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(request);
  }
}