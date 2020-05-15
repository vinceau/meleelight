/* eslint-disable */
import { keyMap } from 'settings';
import { menuMove } from "menus/menu";
import { updateNetworkInputs, giveInputs } from "./multiplayer/streamclient";
import { saveGameState } from "./replay";
import { nullInputs, pollInputs, nullInput } from "../input/input";
import { deaden } from "../input/meleeInputs";
import { getGamepadNameAndInfo } from "../input/gamepad/findGamepadInfo";
import { customGamepadInfo } from "../input/gamepad/gamepads/custom";
import { buttonState } from "../input/gamepad/retrieveGamepadInputs";
import { updateGamepadSVGState, updateGamepadSVGColour, cycleGamepadColour } from "../input/gamepad/drawGamepad";
import { deepObjectMerge } from "./util/deepCopyObject";

const player = [0, 0, 0, 0];
let gameEnd = false;
export let controllerResetCountdowns = [0, 0, 0, 0];
let keyboardOccupied = false;
let usingCustomControls = [false, false, false, false];
let firstTimeDetected = [true, true, true, true];
window.mType = [null, null, null, null];
const mType = [null, null, null, null];
const currentPlayers = [];
const playerType = [-1, -1, -1, -1];
let ports = 0;
let playing = false;
let frameByFrame = false;
let wasFrameByFrame = false;
let findingPlayers = true;
let showDebug = false;

let gameMode = 20;
// 20:Startup
// 13:Data Menu
// 12:Keyboard Controls
// 11:Gameplay Menu
// 10:Sound Menu
// 9: -
// 8: -
// 7:Target Select
// 6:Stage Select (VS)
// 5:Target Playing
// 4:Target Builder
// 3:Playing (VS)
// 2:CSS
// 1:Main Menu
// 0:Title Screen

let pause = [[true, true], [true, true], [true, true], [true, true]];
let frameAdvance = [[true, true], [true, true], [true, true], [true, true]];

let usingLocalStorage = false;
if (typeof (Storage) !== "undefined") {
  // Code for localStorage/sessionStorage.
  usingLocalStorage = true;
  console.log("local storage works");
} else {
  // Sorry! No Web Storage support..
  console.log("local storage does not work");
}

export function getCookie(cname) {
  return "";
}

window.addEventListener("gamepadconnected", function (e) {
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length);
});
if (navigator.getGamepads) console.log(navigator.getGamepads());

const keys = {};

function findPlayers() {
  var gps = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  /*if (typeof gps != "undefined"){
    console.log(gps);
  }*/
  if (!keyboardOccupied) {
    if (gameMode < 2 || gameMode == 20) {
      if (keys[13] || keys[keyMap.s[0]] || keys[keyMap.s[1]]) {
        if (ports < 4) {
          changeGamemode(1);
          keyboardOccupied = true;
          addPlayer(ports, "keyboard");
        }
      }
    } else {
      if (keys[keyMap.a[0]] || keys[keyMap.a[1]]) {
        if (ports < 4) {
          keyboardOccupied = true;
          addPlayer(ports, "keyboard");
        }
      }
    }
  }
  for (var i = 0; i < gps.length; i++) {
    var gamepad = navigator.getGamepads ? navigator.getGamepads()[i] : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads()[i] : null);
    if (playerType[i] === 2) {
      var alreadyIn = false;
      for (var k = 0; k < ports; k++) {
        if (currentPlayers[k] === i) {
          alreadyIn = true;
        }
      }
      if (!alreadyIn) {
        if (ports < 4) {
          addPlayer(i, 99);
        }
      }
      continue;
    }

    var gamepad = navigator.getGamepads ? navigator.getGamepads()[i] : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads()[i] : null);
    if (typeof gamepad != "undefined" && gamepad != null) {
      var detected = false;
      var gpdName;
      var gpdInfo;
      if (usingCustomControls[i] && customGamepadInfo[i] !== null) {
        gpdName = "custom controls";
        gpdInfo = customGamepadInfo[i];
        detected = true;
      }
      else {
        const maybeNameAndInfo = getGamepadNameAndInfo(gamepad.id);
        if (maybeNameAndInfo === null) {
          console.log("Error in 'findPlayers': controller " + (i + 1) + " detected but not supported.");
          console.log("Try manual calibration of your controller.");
        } else {
          detected = true;
          [gpdName, gpdInfo] = maybeNameAndInfo;
        }
      }
      if (detected) {
        if (firstTimeDetected[i]) {
          console.log("Controller " + (i + 1) + " is: " + gpdName + ".");
          firstTimeDetected[i] = false;
        }
        if (gameMode < 2 || gameMode == 20) {
          if (buttonState(gamepad, gpdInfo, "s")) {
            var alreadyIn = false;
            for (var k = 0; k < ports; k++) {
              if (currentPlayers[k] == i) {
                alreadyIn = true;
              }
            }
            if (!alreadyIn) {
              if (ports < 4) {
                changeGamemode(1);
                addPlayer(i, gpdInfo);
              }
            }
          }
        } else {
          if (buttonState(gamepad, gpdInfo, "a")) {
            var alreadyIn = false;
            for (var k = 0; k < ports; k++) {
              if (currentPlayers[k] == i) {
                alreadyIn = true;
              }
            }
            if (!alreadyIn) {
              if (ports < 4) {
                addPlayer(i, gpdInfo);
              }
            }
          }
        }
      } else {
        console.log("No controller detected by browser");
      }
    }
  }
}

function addPlayer(i, controllerInfo) {
  if (controllerInfo === 99) {
    ports++;
    currentPlayers[ports - 1] = i;
    playerType[ports - 1] = 2;
    mType[ports - 1] = controllerInfo;
  } else {
    ports++;
    currentPlayers[ports - 1] = i;
    playerType[ports - 1] = 0;
    mType[ports - 1] = controllerInfo;
    if (showDebug) {
      updateGamepadSVGColour(i, "gamepadSVG" + i);
      document.getElementById("gamepadSVG" + i).style.display = "";
    }
  }
}

// 20:Startup
// 14:Controller Menu
// 13:Data Menu
// 12:Keyboard Controls
// 11:Gameplay Menu
// 10:Sound Menu
// 9: -
// 8: -
// 7:Target Select
// 6:Stage Select (VS)
// 5:Target Playing
// 4:Target Builder
// 3:Playing (VS)
// 2:CSS
// 1:Main Menu
// 0:Title Screen

function changeGamemode(newGamemode) {
  gameMode = newGamemode;
}

function interpretInputs(i, active, playertype, inputBuffer) {

  let tempBuffer = nullInputs();

  // keep updating Z and Start all the time, even when paused
  for (var k = 0; k < 7; k++) {
    tempBuffer[7 - k].z = inputBuffer[6 - k].z;
    tempBuffer[7 - k].s = inputBuffer[6 - k].s;
  }

  tempBuffer[0] = pollInputs(gameMode, frameByFrame, mType[i], i, currentPlayers[i], keys, playertype);

  let pastOffset = 0;
  if ((gameMode !== 3 && gameMode !== 5) || (playing && (pause[i][1] || !pause[i][0]))
    || wasFrameByFrame
    || (!playing && pause[i][0] && !pause[i][1])) {
    pastOffset = 1;
  }

  pause[i][1] = pause[i][0];
  wasFrameByFrame = false;
  frameAdvance[i][1] = frameAdvance[i][0];

  for (var k = 0; k < 7; k++) {
    tempBuffer[7 - k].lsX = inputBuffer[7 - k - pastOffset].lsX;
    tempBuffer[7 - k].lsY = inputBuffer[7 - k - pastOffset].lsY;
    tempBuffer[7 - k].rawX = inputBuffer[7 - k - pastOffset].rawX;
    tempBuffer[7 - k].rawY = inputBuffer[7 - k - pastOffset].rawY;
    tempBuffer[7 - k].csX = inputBuffer[7 - k - pastOffset].csX;
    tempBuffer[7 - k].csY = inputBuffer[7 - k - pastOffset].csY;
    tempBuffer[7 - k].rawcsX = inputBuffer[7 - k - pastOffset].rawcsX;
    tempBuffer[7 - k].rawcsY = inputBuffer[7 - k - pastOffset].rawcsY;
    tempBuffer[7 - k].lA = inputBuffer[7 - k - pastOffset].lA;
    tempBuffer[7 - k].rA = inputBuffer[7 - k - pastOffset].rA;
    tempBuffer[7 - k].a = inputBuffer[7 - k - pastOffset].a;
    tempBuffer[7 - k].b = inputBuffer[7 - k - pastOffset].b;
    tempBuffer[7 - k].x = inputBuffer[7 - k - pastOffset].x;
    tempBuffer[7 - k].y = inputBuffer[7 - k - pastOffset].y;
    tempBuffer[7 - k].r = inputBuffer[7 - k - pastOffset].r;
    tempBuffer[7 - k].l = inputBuffer[7 - k - pastOffset].l;
    tempBuffer[7 - k].dl = inputBuffer[7 - k - pastOffset].dl;
    tempBuffer[7 - k].dd = inputBuffer[7 - k - pastOffset].dd;
    tempBuffer[7 - k].dr = inputBuffer[7 - k - pastOffset].dr;
    tempBuffer[7 - k].du = inputBuffer[7 - k - pastOffset].du;
  }

  if (mType !== null) {
    if ((mType[i] === "keyboard" && (tempBuffer[0].z || tempBuffer[1].z))
      || (mType[i] !== "keyboard" && (tempBuffer[0].z && !tempBuffer[1].z))
    ) {
      frameAdvance[i][0] = true;
    }
    else {
      frameAdvance[i][0] = false;
    }
  }

  if (frameAdvance[i][0] && !frameAdvance[i][1] && !playing && gameMode !== 4) {
    frameByFrame = true;
  }

  if (mType[i] === "keyboard") { // keyboard controls

    if (tempBuffer[0].s || tempBuffer[1].s || (gameMode === 5 && (tempBuffer[0].du || tempBuffer[1].du))) {
      pause[i][0] = true;
    }
    else {
      pause[i][0] = false;
    }

    if (!playing && (gameMode == 3 || gameMode == 5)
      && (tempBuffer[0].a || tempBuffer[1].a) && (tempBuffer[0].l || tempBuffer[1].l)
      && (tempBuffer[0].r || tempBuffer[1].r) && (tempBuffer[0].s || tempBuffer[1].s)) {
    }

    interpretPause(pause[i][0], pause[i][1]);
  }
  else if (mType[i] !== null) { // gamepad controls

    if (!playing && (gameMode == 3 || gameMode == 5) &&
      (tempBuffer[0].a && tempBuffer[0].l && tempBuffer[0].r && tempBuffer[0].s)
      && (!(tempBuffer[1].a && tempBuffer[1].l && tempBuffer[1].r && tempBuffer[1].s))) {
    }

    if (tempBuffer[0].s || tempBuffer[0].du && gameMode == 5) {
      pause[i][0] = true;
    }
    else {
      pause[i][0] = false;
    }

    // Controller reset functionality
    if ((tempBuffer[0].z || tempBuffer[0].du) && tempBuffer[0].x && tempBuffer[0].y) {
      controllerResetCountdowns[i] -= 1;
      if (controllerResetCountdowns[i] === 0) {
        // triggers code in input.js
        console.log("Controller #" + (i + 1) + " was reset!");
      }
    }
    else {
      controllerResetCountdowns[i] = 125;
    }

    interpretPause(pause[i][0], pause[i][1]);
  }
  else { // AI
    tempBuffer[0].rawX = tempBuffer[0].lsX;
    tempBuffer[0].rawY = tempBuffer[0].lsY;
    tempBuffer[0].rawcsX = tempBuffer[0].csX;
    tempBuffer[0].rawcsY = tempBuffer[0].csY;
    tempBuffer[0].lsX = deaden(tempBuffer[0].rawX);
    tempBuffer[0].lsY = deaden(tempBuffer[0].rawY);
    tempBuffer[0].csX = deaden(tempBuffer[0].rawcsX);
    tempBuffer[0].csY = deaden(tempBuffer[0].rawcsY);
  }

  if (showDebug) {
    updateGamepadSVGState(i, "gamepadSVG" + i, tempBuffer[0]);
  }

  if (gameMode === 14) { // controller calibration screen
    updateGamepadSVGState(i, "gamepadSVGCalibration", tempBuffer[0]);
  }

  if (showDebug || gameMode === 14) {
    const which = (showDebug && gameMode === 14) ? "both" : showDebug ? "debug" : "calibration";
    if (tempBuffer[0].x && !tempBuffer[1].x && tempBuffer[0].du) {
      cycleGamepadColour(i, which, true);
    }
    if (tempBuffer[0].y && !tempBuffer[1].y && tempBuffer[0].du) {
      cycleGamepadColour(i, which, false);
    }
  }

  if (giveInputs[i] === true) {
    //turns out keyboards leave gaps in the input buffer
    deepObjectMerge(true, nullInput(), tempBuffer[0]);
    updateNetworkInputs(tempBuffer[0], i);
  }
  if (active) {
    if (tempBuffer[0].dl && !tempBuffer[1].dl) {
      player[i].showLedgeGrabBox ^= true;
    }
    if (tempBuffer[0].dd && !tempBuffer[1].dd) {
      player[i].showECB ^= true;
    }
    if (tempBuffer[0].dr && !tempBuffer[1].dr) {
      player[i].showHitbox ^= true;
    }
  }

  if (frameByFrame) {
    tempBuffer[0].z = false;
  }

  return tempBuffer;

}

function interpretPause(pause0, pause1) {}

function gameTick(oldInputBuffers) {
  var start = performance.now();
  var diff = 0;

  let input = [nullInputs(), nullInputs(), nullInputs(), nullInputs()];

  if (gameMode == 0 || gameMode == 20) {
    findPlayers();
  } else if (gameMode == 1) {
    //console.log(playerType);
    for (var i = 0; i < ports; i++) {
      input[i] = interpretInputs(i, true, playerType[i], oldInputBuffers[i]);
      menuMove(i, input);
    }
  } else if (findingPlayers) {
    findPlayers();
  } else {
    if (!gameEnd) {
      for (var i = 0; i < 4; i++) {
        if (playerType[i] == 0 || playerType[i] == 2) {
          if (currentPlayers[i] != -1) {
            input[i] = interpretInputs(i, false, playerType[i], oldInputBuffers[i]);
          }
        }
      }
    }
  }
  saveGameState(input, ports);

  setTimeout(gameTick, 16, input);

}

export function start() {
  console.log("starting...");
  let nullInputBuffers = [nullInputs(), nullInputs(), nullInputs(), nullInputs()];
  gameTick(nullInputBuffers);
}
window.start = start;
