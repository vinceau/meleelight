
import moves from "characters/falco/moves";
import "characters/falco/attributes";
import "characters/falco/ecb";
import {actionStates} from "physics/actionStateShortcuts";
import {setupActionStates} from "../../physics/actionStateShortcuts";
import {CHARIDS} from "../../main/characters";
import baseActionStates from "../shared/moves";

const Falco = {
  moves,
  attributes: {},
  ecb: {},
};

export default Falco;

// Remove when actionStates are figured out.
setupActionStates(CHARIDS.FALCO_ID, {
  ...baseActionStates,
  ...Falco.moves,
});

actionStates[CHARIDS.FALCO_ID].ESCAPEB.setVelocities = [0,0,0,0,0,0,-0.46222,-1.31556,-2.06222,-5.76,-2.36391,-1.47609,-1.19896,-0.97833,-1.10208,-1.37792,-1.50167,-1.51354,-1.47984,-1.53891,-1.75248,-1.86955,-1.70572,-1.261,-0.73878,-0.42036,-0.24296,-0.20661,-0.31128,-0.58266,-0.37734];
actionStates[CHARIDS.FALCO_ID].ESCAPEF.setVelocities = [0,0,0,0,0,0,2.4,4.32,4.8,1.0299,0.89,1.08094,1.74377,1.86418,1.80236,1.70153,1.68123,1.658,1.63183,1.60272,1.44005,1.16476,0.9179,0.69951,0.50956,0.34806,0.21502,0.11042,0.03427,-0.01343,-0.03268];
actionStates[CHARIDS.FALCO_ID].DOWNSTANDB.setVelocities = [-0.10375,-0.1061,-0.110,-0.11575,-0.12306,-0.23723,-0.44395,-0.63087,-0.79798,-0.9453,-1.07281,-1.18053,-1.26844,-1.33655,-1.38486,-1.41336,-1.35442,-1.24543,-1.17278,-1.13645,-1.13645,-1.17278,-1.24543,-1.33619,-1.40092,-1.43573,-1.44064,-1.41564,-1.36074,-1.27593,-1.16121,-1.01659,-0.84207,-0.63763,-0.40329];
actionStates[CHARIDS.FALCO_ID].DOWNSTANDF.setVelocities = [0.1659,0.21687,0.53598,1.35686,1.56439,3.82358,3.48149,3.15542,2.84537,2.55133,2.27332,2.01131,1.76532,1.53536,1.3214,1.12347,0.94155,0.77564,0.62576,0.49189,0.37403,0.2722,0.18638,0.11658,0.06279,0.02502,0.00327,-0.00247,-0.00023,-0.00056,-0.00069,-0.00063,-0.00036,0.0001,0.00076];
actionStates[CHARIDS.FALCO_ID].TECHB.setVelocities = [0,-1.90448,-1.87286,-1.84,-1.81,-1.77,-1.73,-1.70,-1.66,-1.62,-1.58,-1.53,-1.49,-1.44,-1.40,-1.35,-1.30,-1.25,-1.20,-1.15,-1.09,-1.04,-0.98,-0.93,-0.87,-0.81,-0.75,-0.68,-0.62,-0.56,-0.49,0,0,0,0,0,0,-0.002,-0.002,-0.002];
actionStates[CHARIDS.FALCO_ID].TECHF.setVelocities = [0,0,0,0,0,0,0,2.56,2.49,2.43,2.36,2.29,2.22,2.14,2.07,1.99,1.90,1.82,1.73,1.64,1.54,1.45,1.35,1.24,1.14,1.03,0.92,0.81,0.70,0.58,0,0,0,0,0,0,0,0,0,0];
actionStates[CHARIDS.FALCO_ID].CLIFFCATCH.posOffset = [[-73.09594,-13.47469],[-72.8175,-13.5675],[-72.41531,-13.70156],[-71.94,-13.86],[-71.44219,-14.02594],[-70.9725,-14.1825],[-70.58157,-14.31281]];
actionStates[CHARIDS.FALCO_ID].CLIFFWAIT.posOffset = [-70.32,-14.4];
