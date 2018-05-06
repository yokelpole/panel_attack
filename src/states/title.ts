import * as Assets from "../assets";
import * as _ from "lodash";
import GameManager from "../classes/gameManager";

export default class Title extends Phaser.State {
  private gameManager: GameManager = null;

  public create(): void {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.gameManager = new GameManager(this.game);

    this.game.camera.flash(0x000000, 1000);
  }
}
