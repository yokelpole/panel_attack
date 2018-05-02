import * as Assets from "../assets";
import * as _ from "lodash";
import BlockManager from "../classes/blockManager";
import InputManager from "../classes/inputManager";
import TweenManager from "../classes/tweenManager";
import TopBar from "../classes/topBar";
import Constants from "../utils/constants";


export default class Title extends Phaser.State {
  private blockManager: BlockManager = null;
  private inputManager: InputManager = null;
  private tweenManager: TweenManager = null;
  private topBar: TopBar = null;

  public create(): void {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.blockManager = new BlockManager(this.game);
    this.tweenManager = new TweenManager(this.game, this.blockManager);
    this.inputManager = new InputManager(this.game, this.blockManager);
    this.topBar = new TopBar(this.game, this.blockManager, this.inputManager);

    this.blockManager.addStarterRows();
    this.tweenManager.startTweenAndTimer();
    this.topBar.render();

    this.game.camera.flash(0x000000, 1000);
  }
}
