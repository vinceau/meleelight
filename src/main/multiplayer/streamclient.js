/*eslint-disable*/
import {nullInputs} from "../../input/input";
import {decodeInput} from "./encode";
import deepstream from 'deepstream.io-client-js';
import {
  ports,
  addPlayer,
  currentPlayers,
  player
  , setCS
  , changeGamemode
  , setStageSelect
  , startGame
  , setTagText
  , gameMode
  , stageSelect
  , matchTimer
  , characterSelections
} from "../main";
import {deepObjectMerge} from "../util/deepCopyObject";
import {setChosenChar, setChoosingTag} from "../../menus/css";
import {gameSettings} from "../../settings";
import {updateGameTickDelay} from "../replay";

let ds = null;
let GAME_ID;
let playerID;
let HOST_GAME_ID = null;
let lastRecievedPacket = 0;

if (localStorage.getItem('pickedServer') === 'america' || localStorage.getItem('pickedServer') === null) {
  localStorage.setItem('pickedServer', 'america');
} else if (localStorage.getItem('pickedServer') === 'europe') {
  localStorage.setItem('pickedServer', 'europe');
} else {
  localStorage.setItem('pickedServer', 'lan');
}

function getPlayerStatusRecord(playerID) {
  return playerStatusRecords[playerID];
}

const exclusions = ["charAttributes",
  "charHitboxes",
  "prevFrameHitboxes"];

function startRoom() {
  GAME_ID = ds.getUid().replace("-", "");
  playerID = ds.getUid().replace("-", "");
  inServerMode = true;
  ds.on('connectionStateChanged', function (connectionState) {
    var cssClass;

    if (connectionState === 'ERROR' || connectionState === 'CLOSED') {
      cssClass = 'red';
    }
    else if (connectionState === 'OPEN') {
      cssClass = 'green';
    }
    else {
      cssClass = 'yellow';
    }
//apply this to the front end at some point
    console.log("connection status : " + cssClass);
  });

  ds.record.getRecord(GAME_ID + '-game').whenReady(statusRecord => {
    //  console.log("set up game status "+ GAME_ID);
    statusRecord.set(GAME_ID + 'playerStatus/', {
      "playerID": playerID,
      "ports": ports,
      "currentPlayers": currentPlayers,
      "gameSettings": gameSettings,
      "characterSelections": characterSelections,
    });
    playerStatusRecords[playerID] = statusRecord.get();

    let playerPayload = deepObjectMerge(true, {}, player[getPlayerStatusRecord(playerID).ports - 1],exclusions);

    statusRecord.set(GAME_ID + 'player/',
        {
          name: playerID,
          playerSlot: ports - 1,
          inputBuffer: String.fromCharCode(0,0,32639,32639),
          playerInfo: playerPayload
 
        });
    //TODO iterate over ports to establish inital group

    ds.event.subscribe(GAME_ID + 'playerStatus/', match => {
      if (match.playerID === playerID) {
        return;
      }

      playerStatusRecords[playerID] = statusRecord;
      syncHost(match);
      let totalPlayersRecord = ds.record.getRecord(GAME_ID + 'totalPlayers');
      totalPlayersRecord.set('totalPlayers', ports);
      totalPlayersRecord.set('gameMode', gameMode);
      totalPlayersRecord.set('currentPlayers', currentPlayers);
      totalPlayersRecord.set('stageSelect', stageSelect);
      totalPlayersRecord.set('characterSelections', characterSelections);
      ds.event.emit(GAME_ID + 'totalPlayers', {
        'totalPlayers': ports,
        "gameMode": gameMode,
        "stageSelect": stageSelect,
        "characterSelections": characterSelections,
        "currentPlayers": currentPlayers
      });
      statusRecord.set(GAME_ID + 'playerStatus/', {
        "playerID": playerID,
        "ports": ports,
        "currentPlayers": currentPlayers,
        "characterSelections": characterSelections,
        "gameSettings": gameSettings
      });
      HOST_GAME_ID = GAME_ID;

    });

    ds.event.subscribe(GAME_ID + 'player/', answer => {

      const data = JSON.parse(answer.bstring);
      if (data) {
        if (data.playerID !== playerID) {

          if (data.inputBuffer && (data.playerSlot !== undefined)) {
            const now = performance.now();
            let frameDelay = now - lastRecievedPacket;
            if (frameDelay > 33) {
              frameDelay = 33;
            }
            lastRecievedPacket = now;
            updateGameTickDelay(frameDelay);
            saveNetworkInputs(data.playerSlot, data.inputBuffer);
             player[data.playerSlot].phys.pos =  data.position;

          }
        }
      }
    });

    ds.event.subscribe(GAME_ID + 'charSelection/', data => {
      if (data) {
        setChosenChar(data.playerSlot, data.charSelected);
      }
    });
    ds.event.subscribe(GAME_ID + 'gameMode/', data => {
      if (data) {
        changeGamemode(data.gameMode);
      }
    });
    ds.event.subscribe(GAME_ID + 'startGame/', data => {
      if (data) {
        setStageSelect(data.stageSelected);
        ds.record.getRecord(GAME_ID + 'totalPlayers').set('stageSelect', data.stageSelected);
        document.getSelection().removeAllRanges();
        setChoosingTag(-1);
        startGame();
      }
    });
    ds.event.subscribe(GAME_ID + 'setTag/', data => {
      if (data) {
        setTagText(data.playerSlot, data.tagText);
      }
    });

    ds.event.subscribe(GAME_ID + 'getMatchTimer/', data => {

      syncMatchTimer(matchTimer);

    });

  });
}

const playerStatusRecords = {};
const playerInputBuffer = [nullInputs(), nullInputs(), nullInputs(), nullInputs()];

export const giveInputs = {};

function setNetInputFlag(name, val) {
  giveInputs[name] = val;
}

function saveNetworkInputs(playerSlot, inputData) {

   playerInputBuffer[playerSlot][0] = decodeInput(inputData);
  //playerInputBuffer[playerSlot][0] = inputData;
}

function syncHost(data) {
  setCS(data.ports, data.characterSelections[data.ports]);
  setNetInputFlag(0, true);
  addPlayer(ports, 99);
  setNetInputFlag(ports, false);
}

function syncMatchTimer(timer) {
  if (HOST_GAME_ID !== null) {
    ds.event.emit(HOST_GAME_ID + 'matchTimer/', {"matchTimer": timer});
  }
}