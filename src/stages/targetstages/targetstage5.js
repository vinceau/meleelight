import {Vec2D} from "main/util/Vec2D";
import {Box2D} from "../../main/util/Box2D";
export default {
  startingPoint: [new Vec2D(0.0, 0.0)],
  box: [new Box2D([-41.2, -50.3], [57.3, -37.8]), new Box2D([136.2, -50.5], [149.5, 50.7]), new Box2D([57.0, -69.1], [70.1, 51.1]), new Box2D([-41.0, -100.5], [-13.8, -78.3]), new Box2D([137.4, -125.0], [200.0, -75.5]), new Box2D([-150.7, -101.6], [-93.3, -78.2]), new Box2D([-200.6, 33.6], [-104.8, 52.9]), new Box2D([-200.0, -101.3], [-151.2, 33.3])],
  ground: [[new Vec2D(-41.2, -37.8), new Vec2D(57.3, -37.8)], [new Vec2D(136.2, 50.7), new Vec2D(149.5, 50.7)], [new Vec2D(57.0, 51.1), new Vec2D(70.1, 51.1)], [new Vec2D(-41.0, -78.3), new Vec2D(-13.8, -78.3)], [new Vec2D(137.4, -75.5), new Vec2D(200.0, -75.5)], [new Vec2D(-150.7, -78.2), new Vec2D(-93.3, -78.2)], [new Vec2D(-200.6, 52.9), new Vec2D(-104.8, 52.9)], [new Vec2D(-200.0, 33.3), new Vec2D(-151.2, 33.3)]],
  ceiling: [[new Vec2D(-41.2, -50.3), new Vec2D(57.3, -50.3)], [new Vec2D(136.2, -50.5), new Vec2D(149.5, -50.5)], [new Vec2D(57.0, -69.1), new Vec2D(70.1, -69.1)], [new Vec2D(-41.0, -100.5), new Vec2D(-13.8, -100.5)], [new Vec2D(137.4, -125.0), new Vec2D(200.0, -125.0)], [new Vec2D(-150.7, -101.6), new Vec2D(-93.3, -101.6)], [new Vec2D(-200.6, 33.6), new Vec2D(-104.8, 33.6)], [new Vec2D(-200.0, -101.3), new Vec2D(-151.2, -101.3)]],
  wallL: [[new Vec2D(-41.2, -37.8), new Vec2D(-41.2, -50.3)], [new Vec2D(136.2, 50.7), new Vec2D(136.2, -50.5)], [new Vec2D(57.0, 51.1), new Vec2D(57.0, -69.1)], [new Vec2D(-41.0, -78.3), new Vec2D(-41.0, -100.5)], [new Vec2D(137.4, -75.5), new Vec2D(137.4, -125.0)], [new Vec2D(-150.7, -78.2), new Vec2D(-150.7, -101.6)], [new Vec2D(-200.6, 52.9), new Vec2D(-200.6, 33.6)], [new Vec2D(-200.0, 33.3), new Vec2D(-200.0, -101.3)]],
  wallR: [[new Vec2D(57.3, -37.8), new Vec2D(57.3, -50.3)], [new Vec2D(149.5, 50.7), new Vec2D(149.5, -50.5)], [new Vec2D(70.1, 51.1), new Vec2D(70.1, -69.1)], [new Vec2D(-13.8, -78.3), new Vec2D(-13.8, -100.5)], [new Vec2D(200.0, -75.5), new Vec2D(200.0, -125.0)], [new Vec2D(-93.3, -78.2), new Vec2D(-93.3, -101.6)], [new Vec2D(-104.8, 52.9), new Vec2D(-104.8, 33.6)], [new Vec2D(-151.2, 33.3), new Vec2D(-151.2, -101.3)]],
  platform: [[new Vec2D(-17.9, -13.6), new Vec2D(16.6, -13.6)], [new Vec2D(36.8, 18.5), new Vec2D(57.1, 18.5)], [new Vec2D(78.1, -97.6), new Vec2D(95.5, -97.6)], [new Vec2D(28.4, -97.6), new Vec2D(43.0, -97.6)], [new Vec2D(38.1, -69.3), new Vec2D(57.4, -69.3)], [new Vec2D(186.1, -50.6), new Vec2D(200.0, -50.6)], [new Vec2D(148.9, -6.9), new Vec2D(164.3, -6.9)], [new Vec2D(186.4, 39.0), new Vec2D(200.1, 39.0)], [new Vec2D(120.5, 50.6), new Vec2D(136.7, 50.6)], [new Vec2D(-65.7, 78.6), new Vec2D(-41.2, 78.6)], [new Vec2D(-3.9, 78.6), new Vec2D(22.6, 78.6)]],
  ledge: [["ground", 0, 0], ["ground", 1, 1], ["ground", 5, 1], ["ground", 6, 1], ["ground", 3, 0], ["ground", 3, 1], ["ground", 4, 0], ["ground", 2, 0]],
  target: [new Vec2D(47.1, 36.1), new Vec2D(47.5, -59.0), new Vec2D(191.0, 49.6), new Vec2D(190.9, -63.2), new Vec2D(90.9, -6.9), new Vec2D(116.9, -16.4), new Vec2D(-125.8, -59.5), new Vec2D(-151.9, 65.5), new Vec2D(-121.9, 76.0), new Vec2D(-22.9, 92.1)],
  scale: 3,
  blastzone: new Box2D([-250, -250], [250, 250]),
  offset: [600, 375]
};