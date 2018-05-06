import * as Assets from "../assets";
import * as _ from "lodash";
import GameManager from "../classes/gameManager";
import TopBar from "../classes/topBar";
import Constants from "../utils/constants";

export default class Title extends Phaser.State {
  private gameManager: GameManager = null;

  public create(): void {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    new GameManager(this.game);

    this.game.camera.flash(0x000000, 1000);
  }
}
