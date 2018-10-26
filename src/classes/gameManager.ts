import BlockManager from "./blockManager";
import TweenManager from "./tweenManager";
import InputManager from "./inputManager";
import MenuManager from "./menuManager";
import TopBar from "./topBar";

export default class GameManager {
  public blockManager: BlockManager = undefined;
  public tweenManager: TweenManager = undefined;
  public inputManager: InputManager = undefined;
  public menuManager: MenuManager = undefined;
  public topBar: TopBar = undefined;

  public gameOverEvent: Phaser.Signal = undefined;

  private game: Phaser.Game = undefined;

  constructor(game: Phaser.Game) {
    this.game = game;

    this.blockManager = new BlockManager(this.game, this);
    this.tweenManager = new TweenManager(this.game, this);

    this.inputManager = new InputManager(this.game, this);
    this.menuManager = new MenuManager(this.game, this);
    this.topBar = new TopBar(this.game, this);

    this.menuManager.showTitleScreen();

    this.gameOverEvent = new Phaser.Signal();
    this.gameOverEvent.add(() => {
      this.topBar.showGameOver();
      this.menuManager.showGameOver();
    });
  }

  public startNewGame() {
    this.blockManager.cleanupAllBlocks();
    this.blockManager.addStarterRows();
    this.tweenManager.startTweenAndTimer();
    this.menuManager.hideTitleScreen();
    this.topBar.render();
  }
}
