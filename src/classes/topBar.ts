import BlockManager from "./blockManager";

export default class TopBar {
  private game: Phaser.Game;
  private blockManager: BlockManager;
  private scoreText: Phaser.Text;

  constructor(game: Phaser.Game, blockManager: BlockManager) {
    this.game = game;
    this.blockManager = blockManager;

    this.blockManager.setTopBar(this);
  }

  public render() {
    this.scoreText = this.game.add.text(
      0,
      0,
      this.blockManager.eliminatedBlocks.toString(),
      this.getTextStyle()
    );

    this.scoreText.setTextBounds(0, 0, this.game.width, this.game.height);
  }

  public update() {
    this.scoreText.setText(this.blockManager.eliminatedBlocks.toString());
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
