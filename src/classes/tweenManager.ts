import BlockManager from "./blockManager";
import Constants from "../utils/constants";

export default class TweenManager {
  private blockManager: BlockManager = null;
  private game: Phaser.Game = null;
  private haltTimer: Phaser.Timer = null;
  private addRowTimer: Phaser.Timer = null;
  private upwardsTween: Phaser.Tween = null;
  private settleTweenCount: number = null;

  constructor(game: Phaser.Game, blockManager: BlockManager) {
    this.game = game;
    this.blockManager = blockManager;
    this.blockManager.setTweenManager(this);

    this.settleTweenCount = 0;
  }

  public startTweenAndTimer() {
    this.addRowTimer = this.game.time.create(false);
    this.addRowTimer.loop(Constants.ROW_MOVE_TIME, () => this.addRow());
    this.addRowTimer.start();

    this.upwardsTween = this.tweenUpwardsOneRow();
  }

  public pauseTweens(): void {
    this.upwardsTween.pause();
    this.addRowTimer.pause();

    // Prevent older timers from resuming the action.
    if (this.haltTimer) {
      this.haltTimer.stop();
      this.haltTimer = undefined;
    }

    this.haltTimer = this.game.time.create();
    this.haltTimer.add(Constants.BLOCK_MOVE_TIME * 2, () => {
      this.upwardsTween.resume();
      this.addRowTimer.resume();
    });
    this.haltTimer.start();
  }

  public addRow(): void {
    // End game if blocks are too high.
    if (this.blockManager.blocksTooHigh()) {
      this.gameOver();
      return;
    }

    this.upwardsTween = this.tweenUpwardsOneRow();
    this.blockManager.addNewRow();
    this.blockManager.evaluateBoard();
  }

  // TODO: This doesn't belong in tweenManager at all.
  // Maybe a gameManager?
  private gameOver(): void {
    this.addRowTimer.stop();

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
      .to({ y: yPosition }, Constants.BLOCK_MOVE_TIME, "Linear", true, 0)
      .onComplete.add(tween => {
        block.input.enabled = true;
        this.blockManager.evaluateBoard();
      }, this);

    this.settleTweenCount += 1;
  }

  public moveSingleBlock(block: Phaser.Sprite, swipeDirection: 1 | -1) {
    const blockPosition = this.blockManager.determineBlockPosition(block);

    block.input.enabled = false;

    this.game.add
      .tween(block)
      .to(
        { x: this.blockManager.getBlockXRowPosition(blockPosition.x + swipeDirection) },
        Constants.BLOCK_MOVE_TIME,
        "Linear",
        true,
        0
      )
      .onComplete.add(() => {
        block.input.enabled = true;
        this.blockManager.evaluateBoard();
      }, this.blockManager);
  }

  public swapBlocks(firstBlock: Phaser.Sprite, secondBlock: Phaser.Sprite) {
    const firstBlockPosition = this.blockManager.determineBlockPosition(firstBlock);
    const secondBlockPosition = this.blockManager.determineBlockPosition(secondBlock);

    firstBlock.input.enabled = false;
    secondBlock.input.enabled = false;

    this.game.add
      .tween(firstBlock)
      .to(
        { x: this.blockManager.getBlockXRowPosition(secondBlockPosition.x) },
        Constants.BLOCK_MOVE_TIME,
        "Linear",
        true
      );

    this.game.add
      .tween(secondBlock)
      .to(
        { x: this.blockManager.getBlockXRowPosition(firstBlockPosition.x) },
        Constants.BLOCK_MOVE_TIME,
        "Linear",
        true
      )
      .onComplete.add(() => {
        firstBlock.input.enabled = true;
        secondBlock.input.enabled = true;
        this.blockManager.evaluateBoard();
      }, this.blockManager);
  }

  private tweenUpwardsOneRow(): Phaser.Tween {
    return this.game.add
      .tween(this.blockManager.blockGroup)
      .to(
        { y: this.blockManager.blockGroup.y - Constants.BLOCK_HEIGHT },
        Constants.ROW_MOVE_TIME,
        "Linear",
        true,
        0
      );
  }
}
