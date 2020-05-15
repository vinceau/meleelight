/* eslint-disable */
import { choosingTag, cssControls, drawCSS } from 'menus/css';
import { playerObject } from 'main/player';
import { keyMap } from 'settings';
import { drawStartUp } from 'menus/startup';
import { menuMove, drawMainMenu } from "menus/menu";
import { drawStartScreen } from "menus/startscreen";
import { drawBackground, drawStage, setBackgroundType, createSnow } from "stages/stagerender";
import { sssControls, drawSSS } from "menus/stageselect";
import { masterVolume, drawAudioMenu, audioMenuControls, getAudioCookies } from "menus/audiomenu";
import { drawGameplayMenu, gameplayMenuControls, getGameplayCookies } from "menus/gameplaymenu";
import { keyboardMenuControls, drawKeyboardMenu, getKeyboardCookie } from "menus/keyboardmenu";
import { drawControllerMenu } from "menus/controllermenu";
import { credits, drawCredits } from "menus/credits";
import { renderForeground, renderPlayer, renderOverlay, resetLostStockQueue } from "main/render";

import { actionStates } from "physics/actionStateShortcuts";
import { executeHits, hitDetect, checkPhantoms, resetHitQueue, setPhantonQueue } from "physics/hitDetection";
import {
  targetPlayer, targetHitDetection, targetTimerTick, targetTesting, medalsEarned,
  targetRecords, targetsDestroyed, targetStagePlaying, getTargetCookies, giveMedals, medalTimes
} from "target/targetplay";
import { tssControls, drawTSS, getTargetStageCookies } from "../stages/targetselect";
import { targetBuilder, targetBuilderControls, renderTargetBuilder, showingCode } from "target/targetbuilder";
import { destroyArticles, executeArticles, articlesHitDetection, executeArticleHits, renderArticles, resetAArticles } from "physics/article";
import { runAI } from "main/ai";
import { physics } from "physics/physics";
import $ from 'jquery';
import { drawVfx } from "main/vfx/drawVfx";
import { resetVfxQueue } from "main/vfx/vfxQueue";
import { setVsStage, getActiveStage, activeStage } from "../stages/activeStage";
import { isShowSFX } from "main/vfx";
import { renderVfx } from "./vfx/renderVfx";
import { Box2D } from "./util/Box2D";
import { Vec2D } from "./util/Vec2D";
import { updateNetworkInputs, giveInputs } from "./multiplayer/streamclient";
import { saveGameState } from "./replay";
import { nullInputs, pollInputs, nullInput } from "../input/input";
import { deaden } from "../input/meleeInputs";
import { getGamepadNameAndInfo } from "../input/gamepad/findGamepadInfo";
import { customGamepadInfo } from "../input/gamepad/gamepads/custom";
import { buttonState } from "../input/gamepad/retrieveGamepadInputs";
import { updateGamepadSVGState, updateGamepadSVGColour, setGamepadSVGColour, cycleGamepadColour } from "../input/gamepad/drawGamepad";
import { deepObjectMerge } from "./util/deepCopyObject";
import { setTokenPosSnapToChar } from "../menus/css";
/*globals performance*/

const holiday = 0;
var snowCount = 150;

const player = [0, 0, 0, 0];
const renderTime = [10, 0, 100, 0];
const gamelogicTime = [5, 0, 100, 0];
const framerate = [0, 0, 0];
var characterSelections = [0, 0, 0, 0];

var shine = 0.5;

let creditsPlayer = 0;
let calibrationPlayer = 0;

let gameEnd = false;
export let controllerResetCountdowns = [0, 0, 0, 0];
function setControllerReset(i) {
  controllerResetCountdowns[i] = 0;
}

let keyboardOccupied = false;

let usingCustomControls = [false, false, false, false];

let firstTimeDetected = [true, true, true, true];

window.mType = [null, null, null, null];


const mType = [null, null, null, null];

const currentPlayers = [];

function setCurrentPlayer(index, val) {
  currentPlayers[index] = val;
}

const playerAmount = 0;

const playerType = [-1, -1, -1, -1];

const cpuDifficulty = [3, 3, 3, 3];

let ports = 0;
const activePorts = [];

let playing = false;

let frameByFrame = false;
let wasFrameByFrame = false;
let frameByFrameRender = false;

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
let versusMode = 0;

const palettes = [["rgb(250, 89, 89)", "rgb(255, 170, 170)", "rgba(255, 206, 111, ", "rgb(244, 68, 68)", "rgba(255, 225, 167, "],
["rgb(95, 216, 84)", "rgb(184, 253, 154)", "rgba(252, 95, 95, ", "rgb(255, 182, 96)", "rgba(254, 141, 141, "],
["rgb(5, 195, 255)", "rgb(121, 223, 255)", "rgba(218, 96, 254, ", "rgb(231, 134, 255)", "rgba(230, 144, 255, "],
["rgb(255, 187, 70)", "rgb(248, 255, 122)", "rgba(80, 182, 255, ", "rgb(255, 142, 70)", "rgba(139, 203, 249, "],
["rgb(177, 89, 255)", "rgb(203, 144, 255)", "rgba(144, 255, 110, ", "rgb(247, 126, 250)", "rgba(190, 255, 170, "],
["rgb(182, 131, 70)", "rgb(252, 194, 126)", "rgba(47, 186, 123, ", "rgb(255, 112, 66)", "rgba(111, 214, 168, "],
["rgb(232, 232, 208)", "rgb(255, 255, 255)", "rgba(244, 255, 112, ", "rgb(191, 119, 119)", "rgba(255, 255, 200, "]];


const hasTag = [false, false, false, false];
const tagText = ["", "", "", ""];
function setTagText(index, value) {
  tagText[index] = value;
  hasTag[index] = true;
}
const pPal = [0, 1, 2, 3];

const costumeTimeout = [];

const colours = ["rgba(4, 255, 82, 0.62)", "rgba(117, 20, 255, 0.63)", "rgba(255, 20, 20, 0.63)", "rgba(255, 232, 20, 0.63)"];

let pause = [[true, true], [true, true], [true, true], [true, true]];
let frameAdvance = [[true, true], [true, true], [true, true], [true, true]];

const startingPoint = [[-50, 50], [50, 50], [-25, 5], [25, 5]];
const startingFace = [1, -1, 1, -1];

const ground = [[-68.4, 0], [68.4, 0]];

const platforms = [[[-57.6, 27.2], [-20, 27.2]], [[20, 27.2], [57.6, 27.2]], [[-18.8, 54.4], [18.8, 54.4]]];

const wallsL = [[[-68.4, 0], [-68.4, -108.8]]];
const wallsR = [[[68.4, 0], [68.4, -108.8]]];

const edges = [[[-68.4, 0], [-63.4, 0]], [[68.4, 0], [63.4, 0]]];

//edgeOffset = [[-71.3,-23.7],[71.3,-23.7]];
const edgeOffset = [[-2.9, -23.7], [2.9, -23.7]];

const edgeOrientation = [1, -1];

const respawnPoints = [[-50, 50, 1], [50, 50, -1], [25, 35, 1], [-25, 35, -1]];

var stageSelect = 0;

function setStageSelect(val) {
  stageSelect = val;
}

const blastzone = new Box2D([-224, 200], [224, -108.8]);

let starting = true;
function setStarting(val) {
  starting = val;
}
let startTimer = 1.5;
function setStartTimer(val) {
  startTimer = val;
}
function getStartTimer() {
  return startTimer;
}
//matchTimer = 5999.99;
let matchTimer = 480;

function addMatchTimer(val) {
  matchTimer += val;
}
function setMatchTimer(val) {
  matchTimer = val;
}

function getMatchTimer() {
  return matchTimer;
}

let usingLocalStorage = false;
if (typeof (Storage) !== "undefined") {
  // Code for localStorage/sessionStorage.
  usingLocalStorage = true;
  console.log("local storage works");
} else {
  // Sorry! No Web Storage support..
  console.log("local storage does not work");
}

export function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var exp = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + exp;
  localStorage.setItem(cname, cvalue);
}

export function getCookie(cname) {
  if (usingLocalStorage) {
    return localStorage.getItem(cname);
  } else {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1);
      if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
  }
}

const keys = {};
let keyBind = 0;
let keyBinding = false;

function overrideKeyboardEvent(e) {
  if (!showingCode && choosingTag == -1 && e.keyCode != 122 && e.keyCode != 116) {
    switch (e.type) {
      case "keydown":
        if (!keys[e.keyCode]) {
          keys[e.keyCode] = true;
          keyBind = e.keyCode;
          keyBinding = true;
          // do key down stuff here
        }
        break;
      case "keyup":
        delete (keys[e.keyCode]);
        // do key up stuff here
        break;
    }
    disabledEventPropagation(e);
    e.preventDefault();
    return false;
  } else {
    if (choosingTag > -1) {
      if (e.keyCode == 13) {
        switch (e.type) {
          case "keydown":
            keys[13] = true;
            break;
          case "keyup":
            delete (keys[13]);
            break;
          default:
            break;
        }
      }
    }
    return true;
  }
};

function disabledEventPropagation(e) {
  if (e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    } else if (event) {
      event.cancelBubble = true;
    }
  }
};

document.onkeydown = overrideKeyboardEvent;
document.onkeyup = overrideKeyboardEvent;

window.addEventListener("gamepadconnected", function (e) {
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length);
});
if (navigator.getGamepads) console.log(navigator.getGamepads());

function matchTimerTick(input) {
  matchTimer -= 0.016667;

  if (matchTimer <= 0) {
  }
}

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
          $("#keyboardPrompt").hide();
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
                $("#keyboardPrompt").hide();
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

function togglePort(i) {
  playerType[i]++;
  if (playerType[i] == 3) {
    playerType[i] = -1;
    if (showDebug) {
      document.getElementById("gamepadSVG" + i).style.display = "none";
    }
  }
  if (playerType[i] == 0 && ports <= i) {
    playerType[i] = 1;
    setGamepadSVGColour(i, "black");
    if (showDebug) {
      updateGamepadSVGColour(i, "gamepadSVG" + i);
      document.getElementById("gamepadSVG" + i).style.display = "";
    }
  }
}

function positionPlayersInCSS() {
  for (var i = 0; i < 4; i++) {
    var x = (-80 + i * 50) * 2 / 3;
    var y = -30;
    player[i].phys.pos = new Vec2D(x, y);
    player[i].phys.hurtbox = new Box2D([-4 + x, 18 + y], [4 + x, y]);
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
        $("#resetIndicator" + i).fadeIn(100);
        $("#resetIndicator" + i).fadeOut(500);
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
    $("#lsAxisX" + i).empty().append(tempBuffer[0].lsX.toFixed(3));
    $("#lsAxisY" + i).empty().append(tempBuffer[0].lsY.toFixed(3));
    $("#csAxisX" + i).empty().append(tempBuffer[0].csX.toFixed(3));
    $("#csAxisY" + i).empty().append(tempBuffer[0].csY.toFixed(3));
    $("#lAnalog" + i).empty().append(tempBuffer[0].lA.toFixed(3));
    $("#rAnalog" + i).empty().append(tempBuffer[0].rA.toFixed(3));
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

function interpretPause(pause0, pause1) {
  if (pause0 && !pause1) {
    if (gameMode == 3 || gameMode == 5) {
      playing ^= true;
      if (!playing) {
        renderForeground();
      } else {
        changeVolume(MusicManager, masterVolume[1], 1);
      }
    }
  }
}


let bg1 = 0;
let bg2 = 0;
let fg1 = 0;
let fg2 = 0;
let ui = 0;
const c = 0;
const canvasMain = 0;
const layers = {
  BG1: 0,
  BG2: 0,
  FG1: 0,
  FG2: 0,
  UI: 0
};
const layerSwitches = {
  BG1: true,
  BG2: true,
  FG1: true,
  FG2: true,
  UI: true
};

function renderToMain() {
  var keys = Object.keys(layers);
  for (var i = 0; i < keys.length; i++) {
    if (layerSwitches[keys[i]]) {
      c.drawImage(layers[keys[i]], 0, 0)
    }
  }
}

function update(i, inputBuffers) {
  if (!starting) {
    if (currentPlayers[i] != -1) {
      if (playerType[i] == 0) {
        // do nothing, use the provided player i inputs
      }
      else if (playerType[i] === 1) {
        if (player[i].actionState != "SLEEP") {
          runAI(i); // no need to return input since polling returns ai input if they are active
        }
      }
    }
  }
  physics(i, inputBuffers);
}

let lastUpdate = performance.now();


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
  } else if (gameMode == 10) {
    for (var i = 0; i < ports; i++) {
      input[i] = interpretInputs(i, true, playerType[i], oldInputBuffers[i]);
      audioMenuControls(i, input);
    }
  } else if (gameMode == 11) {
    for (var i = 0; i < ports; i++) {
      input[i] = interpretInputs(i, true, playerType[i], oldInputBuffers[i]);
      gameplayMenuControls(i, input);
    }
  } else if (gameMode == 12) {
    for (var i = 0; i < ports; i++) {
      input[i] = interpretInputs(i, true, playerType[i], oldInputBuffers[i]);
      keyboardMenuControls(i, input);
    }
  } else if (gameMode == 13) {
    input[creditsPlayer] = interpretInputs(creditsPlayer, true, playerType[creditsPlayer], oldInputBuffers[creditsPlayer]);
    credits(creditsPlayer, input);
  } else if (gameMode == 14) {
    // controller calibration
    input[calibrationPlayer] = interpretInputs(calibrationPlayer, true, playerType[calibrationPlayer], oldInputBuffers[calibrationPlayer]);
  } else if (gameMode == 15) {
    for (var i = 0; i < ports; i++) {
      input[i] = interpretInputs(i, true, playerType[i], oldInputBuffers[i]);
      menuMove(i, input);
    }
  } else if (gameMode == 2) {
    for (var i = 0; i < 4; i++) {
      if (i < ports) {
        input[i] = interpretInputs(i, true, playerType[i], oldInputBuffers[i]);
        cssControls(i, input);
      }

      actionStates[characterSelections[i]][player[i].actionState].main(i, input);
    }
    for (var i = 0; i < 4; i++) {
      if (playerType[i] > -1) {
        hitDetect(i, input);
      }
    }
    executeHits(input);
    resetHitQueue();
    findPlayers();
  } else if (playing || frameByFrame) {
    //console.log("test0");
    /*delta = timestamp - lastFrameTimeMs; // get the delta time since last frame
    lastFrameTimeMs = timestamp;
    console.log(delta);*/
    var now = performance.now();
    var dt = now - lastUpdate;

    //console.log(now);
    //console.log(dt);
    lastUpdate = now;

    resetHitQueue();
    getActiveStage().movingPlatforms();
    destroyArticles();
    executeArticles();

    for (var i = 0; i < 4; i++) {
      if (playerType[i] > -1) {
        if (!starting) {
          input[i] = interpretInputs(i, true, playerType[i], oldInputBuffers[i]);
        }
        update(i, input);
      }
    }
    checkPhantoms();
    for (var i = 0; i < 4; i++) {
      if (playerType[i] > -1) {
        hitDetect(i, input);
      }
    }
    executeHits(input);
    articlesHitDetection();
    executeArticleHits(input);
    if (!starting && !versusMode) {
      matchTimerTick(input);
    } else {
      startTimer -= 0.01666667;
      if (startTimer < 0) {
        starting = false;
      }
    }
    if (frameByFrame) {
      frameByFrameRender = true;
      wasFrameByFrame = true;
    }
    frameByFrame = false;
    if (showDebug) {
      diff = performance.now() - start;
      gamelogicTime[0] += diff;
      gamelogicTime[0] /= 2;
      if (diff >= 10) {
        gamelogicTime[3]++;
      }
      if (diff < gamelogicTime[2]) {
        gamelogicTime[2] = diff;
      }
      if (diff > gamelogicTime[1]) {
        gamelogicTime[1] = diff;
      }
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

function clearScreen() {
  //bg1.fillStyle = "rgb(0, 0, 0)";
  //bg1.fillRect(0,0,layers.BG1.width,layers.BG1.height);
  bg2.clearRect(0, 0, layers.BG2.width, layers.BG2.height);
  //fg1.clearRect(0,0,layers.FG1.width,layers.FG1.height);
  fg2.clearRect(0, 0, layers.FG2.width, layers.FG2.height);
  ui.clearRect(0, 0, layers.UI.width, layers.UI.height);
}

let otherFrame = true;
let fps30 = false;
function renderTick() {
  window.requestAnimationFrame(renderTick);
  otherFrame ^= true;
  if ((fps30 && otherFrame) || !fps30) {
    //console.log("------");
    if (gameMode == 20) {
      drawStartUp();
    } else if (gameMode == 10) {
      drawAudioMenu();
    } else if (gameMode == 11) {
      drawGameplayMenu();
    } else if (gameMode == 12) {
      drawKeyboardMenu();
    } else if (gameMode == 13) {
      drawCredits();
    } else if (gameMode == 14) {
      drawControllerMenu();
    } else if (gameMode == 0) {
      drawStartScreen();
    } else if (gameMode == 1) {
      drawMainMenu();
    } else if (gameMode == 2) {
      drawCSS();
      //renderVfx();
    } else if (gameMode == 6) {
      drawSSS();
    } else if (gameMode == 7) {
      drawTSS();
    } else if (gameMode == 4) {
      renderTargetBuilder();
    } else if (gameMode == 5) {
      if (playing || frameByFrameRender) {
        var rStart = performance.now();
        clearScreen();
        if (isShowSFX()) {
          drawBackground();
        }
        drawStage();
        renderPlayer(targetBuilder);
        renderArticles();
        renderVfx();
        renderOverlay(false);

        if (showDebug) {
          var diff = performance.now() - rStart;
          renderTime[0] += diff;
          renderTime[0] /= 2;
          if (diff >= 10) {
            renderTime[3]++;
          }
          if (diff > renderTime[1]) {
            renderTime[1] = diff;
          }
          if (diff < renderTime[2]) {
            renderTime[2] = diff;
          }
        }
      }
      else if (!gameEnd) {
        clearScreen();
        if (!starting) {
          targetTimerTick();
        }
        if (isShowSFX()) {
          drawBackground();
        }
        drawStage();
        renderPlayer(targetBuilder);
        renderArticles();
        renderVfx();
        renderOverlay(false);
        renderForeground();
      }
    } else if (playing || frameByFrameRender) {
      /*delta = timestamp - lastFrameTimeMs; // get the delta time since last frame
      lastFrameTimeMs = timestamp;
      console.log(delta);*/
      //console.log("test2");
      var rStart = performance.now();
      clearScreen();
      if (isShowSFX()) {
        drawBackground();
      }
      drawStage();
      for (var i = 0; i < 4; i++) {
        if (playerType[i] > -1) {
          renderPlayer(i);
        }
      }
      renderArticles();
      renderVfx();
      renderOverlay(true);

      if (showDebug) {
        var diff = performance.now() - rStart;
        renderTime[0] += diff;
        renderTime[0] /= 2;
        if (diff >= 10) {
          renderTime[3]++;
        }
        if (diff > renderTime[1]) {
          renderTime[1] = diff;
        }
        if (diff < renderTime[2]) {
          renderTime[2] = diff;
        }

      }
    }
    if (frameByFrameRender) {
      renderForeground();
    }
    frameByFrameRender = false;
    //renderToMain();
    //console.log(performance.now());
  } else {
    if (playing) {
      renderVfx(true);
    }
  }
}

function buildPlayerObject(i) {
  player[i] = new playerObject(characterSelections[i], startingPoint[i], startingFace[i]);
  player[i].phys.ECB1 = [new Vec2D(startingPoint[i].x, startingPoint[i].y), new Vec2D(startingPoint[i].x, startingPoint[i].y), new Vec2D(startingPoint[i].x, startingPoint[i].y), new Vec2D(startingPoint[i].x, startingPoint[i].y)];
  player[i].phys.ECBp = [new Vec2D(startingPoint[i].x, startingPoint[i].y), new Vec2D(startingPoint[i].x, startingPoint[i].y), new Vec2D(startingPoint[i].x, startingPoint[i].y), new Vec2D(startingPoint[i].x, startingPoint[i].y)];
  player[i].difficulty = cpuDifficulty[i];
}



function initializePlayers(i, target) {
  buildPlayerObject(i);
  if (target) {
    drawVfx({
      name: "entrance",
      pos: new Vec2D(activeStage.startingPoint[0].x, activeStage.startingPoint[0].y)
    });
  } else {
    drawVfx({
      name: "entrance",
      pos: new Vec2D(startingPoint[i][0], startingPoint[i][1])
    });
  }
}

export function start() {
  console.log("starting...");
  for (var i = 0; i < 4; i++) {
    buildPlayerObject(i);
    player[i].phys.face = 1;
    player[i].actionState = "WAIT";
  }
  getKeyboardCookie();
  getTargetCookies();
  giveMedals();
  getTargetStageCookies();
  getAudioCookies();
  getGameplayCookies();
  $("#keyboardButton").click(function () {
    $("#keyboardControlsImg").toggle();
    $("#keyboardPrompt").hide();
  });
  $("#controllerButton").click(function () {
    $("#controllerSupportContainer").toggle();
  });
  let nullInputBuffers = [nullInputs(), nullInputs(), nullInputs(), nullInputs()];
  gameTick(nullInputBuffers);
}
window.start = start;
