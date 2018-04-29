import BlockManager from "./blockManager";
import Constants from "../utils/constants";

export default class TopBar {
  private game: Phaser.Game;
  private blockManager: BlockManager;
  private scoreText: Phaser.Text;
  private deathLine: Phaser.Line;
  private lineGraphics: Phaser.Graphics;

  constructor(game: Phaser.Game, blockManager: BlockManager) {
    this.game = game;
    this.blockManager = blockManager;

    this.blockManager.setTopBar(this);
  }

  public render() {
    this.scoreText = this.game.add.text(
      0,
      0,
      this.getScoreString(),
      this.getTextStyle()
    );

    this.scoreText.setTextBounds(0, 0, this.game.width, this.game.height);

    // TODO: '60' is a REALLY BAD way to tell where the death line is.
    this.deathLine = new Phaser.Line(
      0,
      60,
      this.game.world.width,
      60
    );
    this.lineGraphics = this.game.add.graphics(this.deathLine.start.x, this.deathLine.start.y);
    this.lineGraphics.lineStyle(3, 0xffffff);
    this.lineGraphics.moveTo(this.deathLine.x, this.deathLine.y);
    this.lineGraphics.lineTo(this.deathLine.end.x, this.deathLine.end.y);
    this.lineGraphics.endFill();
  }

  public update() {
    this.scoreText.setText(this.getScoreString());
  }

  private getScoreString() {
   return `SCORE: ${this.blockManager.eliminatedBlocks.toString()}`;
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
