import * as _ from "lodash";
import GameManager from "./gameManager";

export default class MenuManager {
  private game: Phaser.Game = undefined;
  private gameManager: GameManager = undefined;
  private newGameText: Phaser.Text = undefined;
  private blurbText: Phaser.Text = undefined;
  private gameNameText: Phaser.Text = undefined;
  private newGameTextBackground: Phaser.Rectangle = undefined;

  constructor(game: Phaser.Game, gameManager: GameManager) {
    this.game = game;
    this.gameManager = gameManager;
  }

  public showTitleScreen(): void {
    this.gameNameText = this.game.add.text(0, 0, "PANEL\nATTACK", this.getTextStyle("120px"));
    this.gameNameText.setTextBounds(0, 0, this.game.width, this.game.height / 2);
    this.gameNameText.setShadow(10, 10, "rgba(0,0,0,0.5)", 2);

    this.blurbText = this.game.add.text(
      0,
      0,
      "by Kyle Poole",
      this.getTextStyle("64px")
    );
    this.blurbText.setTextBounds(0, 0, this.game.width, this.game.height / 1.3);
    this.blurbText.setShadow(5, 5, "rgba(0,0,0,0.5", 2);

    this.newGameText = this.game.add.text(0, 0, "START GAME", this.getTextStyle());
    this.newGameText.setTextBounds(0, 0, this.game.width, this.game.height * 1.5);
    this.newGameText.setShadow(8, 8, "rgba(0,0,0,0.5", 2);
    this.newGameText.inputEnabled = true;
    this.newGameText.events.onInputDown.add(() => {
      this.gameManager.blockManager.cleanupAllBlocks();
      this.gameManager.startNewGame();
    });

    this.gameManager.blockManager.addStarterRowsForStartScreen();
  }

  public hideTitleScreen(): void {
    this.newGameText.destroy();
    this.gameNameText.destroy();
    this.blurbText.destroy();
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

  private getTextStyle(fontSize: string = "80px") {
    return {
      font: `bold ${fontSize} Arial`,
      fill: "#FFF",
      boundsAlignH: "center",
      boundsAlignV: "middle"
    };
  }
}
