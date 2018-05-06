import GameManager from "./gameManager";
import Constants from "../utils/constants";
import { Input } from "phaser-ce";

export default class TopBar {
  private game: Phaser.Game;
  private gameManager: GameManager;
  private scoreText: Phaser.Text;
  private directionText: Phaser.Text;
  private pauseText: Phaser.Text;
  private deathLine: Phaser.Line;
  private lineGraphics: Phaser.Graphics;

  constructor(game: Phaser.Game, gameManager: GameManager) {
    this.game = game;
    this.gameManager = gameManager;
  }

  public render() {
    this.scoreText = this.game.add.text(0, 0, this.getScoreString(), this.getTextStyle());
    this.scoreText.setTextBounds(0, 0, this.game.width, this.game.height);

    // this.directionText = this.game.add.text(0, 0, this.getDirectionString(), this.getTextStyle());

    this.pauseText = this.game.add.text(0, 70, "PAUSE", this.getTextStyle());
    this.pauseText.setTextBounds(0, 0, this.game.width, this.game.height);
    this.pauseText.inputEnabled = true;
    this.pauseText.events.onInputDown.add(this.pauseGame, this);

    // TODO: '60' is a REALLY BAD way to tell where the death line is.
    this.deathLine = new Phaser.Line(0, 60, this.game.world.width, 60);
    this.lineGraphics = this.game.add.graphics(this.deathLine.start.x, this.deathLine.start.y);
    this.lineGraphics.lineStyle(3, 0xffffff);
    this.lineGraphics.moveTo(this.deathLine.x, this.deathLine.y);
    this.lineGraphics.lineTo(this.deathLine.end.x, this.deathLine.end.y);
    this.lineGraphics.endFill();
  }

  public updateScore() {
    this.scoreText.setText(this.getScoreString());
  }

  public updateDirection() {
    this.directionText.setText(this.getDirectionString());
  }

  private pauseGame() {
    this.game.paused = !this.game.paused;
    this.gameManager.blockManager.blockGroup.ignoreChildInput = !this.gameManager.blockManager
      .blockGroup.ignoreChildInput;
    this.pauseText.setText(this.game.paused ? "RESUME" : "PAUSE");
  }

  private getDirectionString() {
    return `DIRECTION: ${
      this.gameManager.inputManager.activeSwipeDirection ? "VERTICAL" : "HORIZONTAL"
    }`;
  }

  private getScoreString() {
    return `SCORE: ${this.gameManager.blockManager.eliminatedBlocks.toString()}`;
  }

  private getTextStyle() {
    return {
      font: "36px Arial",
      fill: "#FFF",
      boundsAlignH: "right",
      boundsAlignV: "top"
    };
  }
}
