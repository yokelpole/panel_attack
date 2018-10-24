import * as _ from "lodash";
import GameManager from "./gameManager";

export default class MenuManager {
  private game: Phaser.Game = undefined;
  private gameManager: GameManager = undefined;
  private regularGameText: Phaser.Text = undefined;

  constructor(game: Phaser.Game, gameManager: GameManager) {
    this.game = game;
    this.gameManager = gameManager;
  }

  public showTitleScreen(): void {
    this.regularGameText = this.game.add.text(0, 0, "REGULAR GAME", this.getTextStyle());
    this.regularGameText.setTextBounds(0, 0, this.game.width, this.game.height / 2);
    this.regularGameText.inputEnabled = true;
    this.regularGameText.events.onInputDown.add(() => this.gameManager.startNewGame());
  }

  public hideTitleScreen(): void {
    this.regularGameText.destroy();
  }

  public showGameOver(): void {
    const score = this.gameManager.blockManager.eliminatedBlocks.toString();

    const gameOverText = this.game.add.text(
      0,
      60,
      `GAME OVER\nSCORE: ${score}`,
      this.getTextStyle()
    );

    gameOverText.setShadow(10, 10, "rgba(0,0,0,0.5)", 2);
    gameOverText.setTextBounds(0, 0, this.game.width, this.game.height);
  }

  private getTextStyle() {
    return {
      font: "bold 80px Arial",
      fill: "#FFF",
      boundsAlignH: "center",
      boundsAlignV: "middle"
    };
  }
}
