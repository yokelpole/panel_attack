import GameManager from "./gameManager";
import Constants from "../utils/constants";

export default class MenuManager {
  private game: Phaser.Game = undefined;
  private gameManager: GameManager = undefined;

  constructor(game: Phaser.Game, gameManager: GameManager) {
    this.game = game;
    this.gameManager = gameManager;
  }

  public showGameOver(): void {
    this.game.paused = true;

    // TODO: Make text style consistent.
    const style = {
      font: "bold 48px Arial",
      fill: "#FFF",
      boundsAlignH: "center",
      boundsAlignV: "middle"
    };

    const text = this.game.add.text(0, 0, "GAME OVER", style);
    text.setShadow(3, 3, "rgba(0,0,0,0.5)", 2);
    text.setTextBounds(0, 0, this.game.width, this.game.height);

    text.inputEnabled = true;
    text.events.onInputDown.add(() => this.game.state.restart());
  }

  public settleBlock(block: Phaser.Sprite, yPosition: number): void {
    block.input.enabled = false;

    this.game.add
      .tween(block)
      .to({ y: yPosition }, Constants.BLOCK_MOVE_TIME, Phaser.Easing.Linear.None, true, 0)
      .onComplete.add(tween => {
        block.input.enabled = true;
        this.gameManager.blockManager.evaluateBoard();
      }, this);
  }
}
