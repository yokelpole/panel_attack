import BlockManager from "./blockManager";
import TweenManager from "./tweenManager";
import InputManager from "./inputManager";
import MenuManager from "./menuManager";
import Constants from "../utils/constants";
import TopBar from "./topBar";

export enum ActiveDirection {
  HORIZONTAL,
  VERTICAL
}

export default class GameManager {
  public blockManager: BlockManager = undefined;
  public tweenManager: TweenManager = undefined;
  public inputManager: InputManager = undefined;
  public menuManager: MenuManager = undefined;
  public topBar: TopBar = undefined;

  public switchMode: boolean = undefined;
  public activeDirection: ActiveDirection = ActiveDirection.HORIZONTAL;

  public activeDirectionChangedEvent: Phaser.Signal = undefined;
  public gameOverEvent: Phaser.Signal = undefined;

  private game: Phaser.Game = undefined;
  private activeDirectionTimer: Phaser.Timer = undefined;

  constructor(game: Phaser.Game) {
    this.game = game;

    this.blockManager = new BlockManager(this.game, this);
    this.tweenManager = new TweenManager(this.game, this);

    this.inputManager = new InputManager(this.game, this);
    this.menuManager = new MenuManager(this.game, this);
    this.topBar = new TopBar(this.game, this);

    this.menuManager.showTitleScreen();

    this.activeDirectionChangedEvent = new Phaser.Signal();
    this.activeDirectionChangedEvent.add(() => {
      this.topBar.updateDirection(this.activeDirection);
    });

    this.gameOverEvent = new Phaser.Signal();
    this.gameOverEvent.add(() => {
      this.topBar.showGameOver();
      this.menuManager.showGameOver();
    });
  }

  public startNewGame(isSwitchMode: boolean = false) {
    if (isSwitchMode) {
      this.switchMode = true;
      this.startActiveDirectionTimer();
    }

    this.blockManager.addStarterRows();
    this.tweenManager.startTweenAndTimer();
    this.menuManager.hideTitleScreen();
    this.topBar.render(isSwitchMode);
  }

  private startActiveDirectionTimer() {
    this.activeDirectionTimer = this.game.time.create(false);
    this.activeDirectionTimer.loop(Constants.ACTIVE_DIRECTION_TIME, () => {
      this.activeDirection =
        this.activeDirection === ActiveDirection.HORIZONTAL
          ? ActiveDirection.VERTICAL
          : ActiveDirection.HORIZONTAL;
      this.activeDirectionChangedEvent.dispatch();
    });
    this.activeDirectionTimer.start();
  }
}
