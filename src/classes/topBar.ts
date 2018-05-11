import GameManager, { ActiveDirection } from "./gameManager";
import Constants from "../utils/constants";
import { Input } from "phaser-ce";

const TOP_BAR_LINE_HEIGHT = 60;

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

  public render(isSwitchMode: boolean): void {
    this.scoreText = this.game.add.text(0, 0, this.getScoreString(), this.getTextStyle());
    this.scoreText.setTextBounds(0, 0, this.game.width, this.game.height);

    this.directionText = this.game.add.text(0, 0, this.getDirectionString(), this.getTextStyle());
    if (!isSwitchMode) this.directionText.visible = false;

    this.pauseText = this.game.add.text(0, 70, "PAUSE", this.getTextStyle());
    this.pauseText.setTextBounds(0, 0, this.game.width, this.game.height);
    this.pauseText.inputEnabled = true;
    this.pauseText.events.onInputDown.add(this.pauseGame, this);

    this.deathLine = new Phaser.Line(
      0,
      TOP_BAR_LINE_HEIGHT,
      this.game.world.width,
      TOP_BAR_LINE_HEIGHT
    );
    this.lineGraphics = this.game.add.graphics(this.deathLine.start.x, this.deathLine.start.y);
    this.lineGraphics.lineStyle(3, 0xffffff);
    this.lineGraphics.moveTo(this.deathLine.x, this.deathLine.y);
    this.lineGraphics.lineTo(this.deathLine.end.x, this.deathLine.end.y);
    this.lineGraphics.endFill();
  }

  public updateScore(): void {
    this.scoreText.setText(this.getScoreString());
  }

  public updateDirection(direction): void {
    this.directionText.setText(this.getDirectionString());
  }

  public showGameOver(): void {
    this.pauseText.visible = false;
    this.scoreText.visible = false;
    this.directionText.visible = false;

    const newGameText = this.game.add.text(0, 0, "START NEW GAME", {
      font: "bold 48px Arial",
      fill: "#F00",
      boundsAlignH: "center",
      boundsAlignV: "middle"
    });

    newGameText.setTextBounds(0, 0, this.game.width, TOP_BAR_LINE_HEIGHT * 2);
    newGameText.inputEnabled = true;
    newGameText.events.onInputDown.add(() => this.game.state.restart());
  }

  private pauseGame(): void {
    this.game.paused = !this.game.paused;
    this.gameManager.blockManager.blockGroup.ignoreChildInput = !this.gameManager.blockManager
      .blockGroup.ignoreChildInput;
    this.pauseText.setText(this.game.paused ? "RESUME" : "PAUSE");
  }

  private getDirectionString(): string {
    return `DIRECTION: ${
      this.gameManager.activeDirection === ActiveDirection.HORIZONTAL ? "HORIZONTAL" : "VERTICAL"
    }`;
  }

  private getScoreString(): string {
    return `SCORE: ${this.gameManager.blockManager.eliminatedBlocks.toString()}`;
  }

  private getTextStyle(): object {
    return {
      font: "36px Arial",
      fill: "#FFF",
      boundsAlignH: "right",
      boundsAlignV: "top"
    };
  }
}
