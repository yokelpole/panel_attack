import * as _ from "lodash";
import GameManager from "./gameManager";
import Constants from "../utils/constants";

export default class MenuManager {
  private game: Phaser.Game = undefined;
  private gameManager: GameManager = undefined;
  private regularGameText: Phaser.Text = undefined;
  private switchModeText: Phaser.Text = undefined;

  constructor(game: Phaser.Game, gameManager: GameManager) {
    this.game = game;
    this.gameManager = gameManager;
  }

  public showTitleScreen(): void {
    this.regularGameText = this.game.add.text(0, 0, "REGULAR GAME", this.getTextStyle());
    this.regularGameText.setTextBounds(0, 0, this.game.width, this.game.height / 2);
    this.regularGameText.inputEnabled = true;
    this.regularGameText.events.onInputDown.add(() => this.gameManager.startNewGame());

    this.switchModeText = this.game.add.text(0, 0, "SWITCH GAME", this.getTextStyle());
    this.switchModeText.setTextBounds(0, this.game.height / 2, this.game.width, this.game.height / 2);
    this.switchModeText.inputEnabled = true;
    this.switchModeText.events.onInputDown.add(() => this.gameManager.startNewGame(true));
  }

  public hideTitleScreen(): void {
    this.regularGameText.destroy();
    this.switchModeText.destroy();
  }

  public showGameOver(): void {
    const score = this.gameManager.blockManager.eliminatedBlocks.toString();

    const gameOverText = this.game.add.text(
      0,
      0,
      `GAME OVER\n SCORE: ${score}`,
      this.getTextStyle()
    );
    gameOverText.setShadow(3, 3, "rgba(0,0,0,0.5)", 2);
    gameOverText.setTextBounds(0, 0, this.game.width, this.game.height);
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

  private getTextStyle() {
    return {
      font: "bold 48px Arial",
      fill: "#FFF",
      boundsAlignH: "center",
      boundsAlignV: "middle"
    };
  }
}
