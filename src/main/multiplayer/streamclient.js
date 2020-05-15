/*eslint-disable*/
import {nullInputs} from "../../input/input";
import {encodeInput, decodeInput} from "./encode";
import deepstream from 'deepstream.io-client-js';
import {
  setPlayerType,
  ports,
  addPlayer,
  currentPlayers,
  mType,
  setMtype,
  setCurrentPlayer, player
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
import {gameSettings, updateGameSettings} from "../../settings";
import {updateGameTickDelay} from "../replay";


let ds = null;
let peerId = null;
let connectionReady = false;
let GAME_ID;
let playerID;
let HOST_GAME_ID = null;
let inServerMode = false;
let meHost = false;
let joinedGame = false;
let lastRecievedPacket = 0;
const usServer = 'wss://deepml.herokuapp.com:443';
const eurServer = 'wss://deepmleur.herokuapp.com:443';
let pickedServer = 'america';
let packetNumber = 0;

if (localStorage.getItem('pickedServer') === 'america' || localStorage.getItem('pickedServer') === null) {
  localStorage.setItem('pickedServer', 'america');
} else if (localStorage.getItem('pickedServer') === 'europe') {
  localStorage.setItem('pickedServer', 'europe');
} else {
  localStorage.setItem('pickedServer', 'lan');
}
function logIntoServer() {
  meHost = true;
  if (localStorage.getItem('pickedServer') === 'america') {
    ds = deepstream(usServer).login(null, _onLoggedIn);
  } else if (localStorage.getItem('pickedServer') === 'europe') {
    ds = deepstream(eurServer).login(null, _onLoggedIn);
  } else {
    if(localStorage.getItem('lastLANIP') === null || localStorage.getItem('lastLANIP') === "" ){
      localStorage.setItem('lastLANIP', "localhost");
    }
    ds = deepstream(localStorage.getItem('lastLANIP')+":6020").login(null, _onLoggedIn);
  }

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
function _onLoggedIn() {
  connectionReady = true;
  startRoom();
}

const connectedPeers = {};
const peerConnections = {};
const playerStatusRecords = {};

const playerInputBuffer = [nullInputs(), nullInputs(), nullInputs(), nullInputs()];


export const giveInputs = {};

function setNetInputFlag(name, val) {
  giveInputs[name] = val;
}

function sendInputsOverNet(inputBuffer, playerSlot) {

  let payload = {
    "playerID": playerID,
    "playerSlot": playerSlot,
     "inputBuffer": encodeInput(inputBuffer),
    //"inputBuffer": inputBuffer,
    "position": player[playerSlot].phys.pos

  };
  ds.event.emit(HOST_GAME_ID + 'player/', {"bstring": JSON.stringify(payload)});

}

function updateNetworkInputs(inputBuffer, playerSlot) {

  playerInputBuffer[playerSlot][0] = inputBuffer;

  sendInputsOverNet(inputBuffer, playerSlot);

}

function saveNetworkInputs(playerSlot, inputData) {

   playerInputBuffer[playerSlot][0] = decodeInput(inputData);
  //playerInputBuffer[playerSlot][0] = inputData;
}

function retrieveNetworkInputs(playerSlot) {
  return playerInputBuffer[playerSlot][0];
}


//connect to global chat
function connectToMPServer() {

  logIntoServer();


}

function getHostRoom() {
  return connectedPeers;
}

function syncClient(data) {
  const exactportnumber = data.ports;
  const charselected = data.characterSelections;
  let portSnapshot = ports;
  if (joinedGame === false) {
    joinedGame = true;
    let tempCurrentPlayers = deepObjectMerge(true, {}, currentPlayers);
    let playersToBeReassigned = tempCurrentPlayers.length;
    let mTypeSnapshot = deepObjectMerge(true, {}, mType);
    let charSelectedSnapshot = deepObjectMerge(true, {}, characterSelections);
    //add host players
    for (let v = ports; v <= exactportnumber - 1; v++) {

      addPlayer(v, 99);
    }
    for (let i = 0; i < exactportnumber; i++) {
      setPlayerType(i, 2);
      setMtype(i, 99);
      setCurrentPlayer(i, i);
      setNetInputFlag(i, false);
      setCS(i, charselected[i]);
    }
    //reassign player 1
    //TODO figure out how to join wiht multiple in original party
    addPlayer(tempCurrentPlayers[0], mTypeSnapshot[0]);
    setNetInputFlag(exactportnumber, true);
    setCS(exactportnumber, charSelectedSnapshot[0]);
  } else {

    for (let j = ports; ports < exactportnumber + 1; j++) {
      addPlayer(j, 99);
    }
  }

}

function syncHost(data) {

  //add joining players
  //TODO Currently assuming only one player joins
  setCS(data.ports, data.characterSelections[data.ports]);
  setNetInputFlag(0, true);
  addPlayer(ports, 99);
  setNetInputFlag(ports, false);

}


function connect(record, name) {
  // Handle a join connection.

  ds.record.getRecord(name + 'totalPlayers').whenReady(totalPlayerRecord => {



    const hostStateRecord = totalPlayerRecord.get();
    if (hostStateRecord.totalPlayers > 3) {
      alert("Host room is full.");
 

    } else {

      record.whenReady(data => {

        let result = data.get();

        if (Object.keys(result).length === 0 && result.constructor === Object) {
          alert("error room appears to be empty");
        } else if (result.gameMode === 3) {
          alert("The match is currently in progress. please wait until it has completed");
        } else if (currentPlayers.length > 1) {
          alert("Too many players your current session. Only one player may join per browser until I figure out a solution");
        } else if (result.gameMode === 6) {
          alert("The host is already in stage select. Please wait until the match has completed or have the host return to character select");
        } else {
          let playerstatus = Object.keys(result)[0];
          playerStatusRecords[name] = record;

          syncClient(result[playerstatus]);
          meHost = false;
          updateGameSettings(result[playerstatus].gameSettings);

          ds.event.emit(name + 'playerStatus/', {
            "playerID": playerID,
            "ports": ports - 1,
            "currentPlayers": currentPlayers,
            "characterSelections": characterSelections
          });
          // let playerPayload = deepObjectMerge(true,{}, player[ports],exclusions);

          let payload = {
            "playerID": playerID,
            "playerSlot": ports - 1,
            "inputBuffer": encodeInput(playerInputBuffer[0]),
            // "inputBuffer": playerInputBuffer[0],
            "position": player[ports].phys.pos
          };
          ds.event.emit(name + 'player/', {"bstring": JSON.stringify(payload)});
          // ds.event.emit(name + 'charSelection/', {"playerSlot": ports -1, "charSelected": characterSelections[0]});

          ds.event.subscribe(name + 'playerStatus/', match => {
            if (match.playerID === playerID) {
              return;
            }

            syncClient(match);


          });

          ds.event.subscribe(name + 'player/', answer => {

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
                   player[data.playerSlot].phys.pos =   data.position;
                }
              }
            }
          });
          ds.event.subscribe(name + 'charSelection/', data => {
            if (data) {
              setChosenChar(data.playerSlot, data.charSelected);
            }
          });
          ds.event.subscribe(name + 'gameMode/', data => {
            if (data) {
              if (data.gameMode === 2 || data.gameMode === 3 || data.gameMode === 6) {
                changeGamemode(data.gameMode);
              }

            }
          });

          ds.event.subscribe(name + 'startGame/', data => {
            if (data) {
              setStageSelect(data.stageSelected);
              startGame();
            }
          });
          ds.event.subscribe(name + 'setTag/', data => {
            if (data) {
              setTagText(data.playerSlot, data.tagText);
            }
          });
          peerConnections[name] = record;

        }
      });
    }
  });
}


function connectToUser(userName) {
  const requestedPeer = userName;
  if (!connectedPeers[requestedPeer]) {
    HOST_GAME_ID = requestedPeer;
    let playerRecord = ds.record.getRecord(requestedPeer + '-game').whenReady(statusRecord => {
      connect(statusRecord, requestedPeer);

    });


    peerConnections[requestedPeer] = playerRecord;

  }
  connectedPeers[requestedPeer] = 1;

}


function syncCharacter(index, charSelection) {
  if (HOST_GAME_ID !== null) {
    ds.event.emit(HOST_GAME_ID + 'charSelection/', {"playerSlot": index, "charSelected": charSelection});
  }
  if (meHost) {
    ds.record.getRecord(GAME_ID + '-game').whenReady(statusRecord => {
      //  console.log("set up game status "+ GAME_ID);
      statusRecord.set(GAME_ID + 'playerStatus/', {
        "playerID": playerID,
        "ports": ports,
        "currentPlayers": currentPlayers,
        "gameSettings": gameSettings,
        "characterSelections": characterSelections
      });
    });
  }
}

function syncGameMode(gameMode) {
  if (HOST_GAME_ID !== null) {
    ds.event.emit(HOST_GAME_ID + 'gameMode/', {"gameMode": gameMode});
  }
}


function syncStartGame(stageSelected) {
  if (HOST_GAME_ID !== null) {
    ds.event.emit(HOST_GAME_ID + 'startGame/', {"stageSelected": stageSelected});
    ds.record.getRecord(HOST_GAME_ID + '-game').set('gameMode', gameMode);
  }
}

function syncTagText(playerSlot, tagText) {
  if (HOST_GAME_ID !== null) {
    ds.event.emit(HOST_GAME_ID + 'setTag/', {"playerSlot": playerSlot, "tagText": tagText});
  }
}
function syncMatchTimer(timer) {
  if (HOST_GAME_ID !== null) {
    ds.event.emit(HOST_GAME_ID + 'matchTimer/', {"matchTimer": timer});
  }
}