import GameManager from "./gameManager";
import Constants from "../utils/constants";

export default class TweenManager {
  private gameManager: GameManager = null;
  private game: Phaser.Game = null;
  private haltTimer: Phaser.Timer = null;
  private addRowTimer: Phaser.Timer = null;
  private upwardsTween: Phaser.Tween = null;

  constructor(game: Phaser.Game, gameManager: GameManager) {
    this.game = game;
    this.gameManager = gameManager;
  }

  public startTweenAndTimer() {
    this.addRowTimer = this.game.time.create(false);
    this.addRowTimer.loop(Constants.ROW_MOVE_TIME, () => this.addRow());
    this.addRowTimer.start();

    this.upwardsTween = this.tweenUpwardsOneRow();
  }

  public delayTweens(): void {
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
    if (this.gameManager.blockManager.blocksTooHigh()) {
      this.gameManager.gameOverEvent.dispatch();
      return;
    }

    this.upwardsTween = this.tweenUpwardsOneRow();
    this.gameManager.blockManager.addNewRow();
    this.gameManager.blockManager.evaluateBoard();
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

  public moveSingleBlock(block: Phaser.Sprite, swipeDirection: 1 | -1) {
    const blockPosition = this.gameManager.blockManager.determineBlockPosition(block);

    block.input.enabled = false;

    this.game.add
      .tween(block)
      .to(
        { x: this.gameManager.blockManager.getBlockXRowPosition(blockPosition.x + swipeDirection) },
        Constants.BLOCK_MOVE_TIME,
        Phaser.Easing.Linear.None,
        true,
        0
      )
      .onComplete.add(() => {
        block.input.enabled = true;
        this.gameManager.blockManager.evaluateBoard();
      }, this.gameManager.blockManager);
  }

  public swapBlocks(firstBlock: Phaser.Sprite, secondBlock: Phaser.Sprite) {
    const firstBlockPosition = this.gameManager.blockManager.determineBlockPosition(firstBlock);
    const secondBlockPosition = this.gameManager.blockManager.determineBlockPosition(secondBlock);

    firstBlock.input.enabled = false;
    secondBlock.input.enabled = false;

    this.game.add
      .tween(firstBlock)
      .to(
        { x: this.gameManager.blockManager.getBlockXRowPosition(secondBlockPosition.x) },
        Constants.BLOCK_MOVE_TIME,
        Phaser.Easing.Linear.None,
        true
      );

    this.game.add
      .tween(secondBlock)
      .to(
        { x: this.gameManager.blockManager.getBlockXRowPosition(firstBlockPosition.x) },
        Constants.BLOCK_MOVE_TIME,
        Phaser.Easing.Linear.None,
        true
      )
      .onComplete.add(() => {
        firstBlock.input.enabled = true;
        secondBlock.input.enabled = true;
        this.gameManager.blockManager.evaluateBoard();
      }, this.gameManager.blockManager);
  }

  public removeBlock(block: Phaser.Sprite) {
    this.game.add
      .tween(block)
      .to({ alpha: 0 }, Constants.BLOCK_MOVE_TIME, Phaser.Easing.Linear.None, true)
      .onComplete.add(() => block.destroy());
  }

  private tweenUpwardsOneRow(): Phaser.Tween {
    return this.game.add
      .tween(this.gameManager.blockManager.blockGroup)
      .to(
        { y: this.gameManager.blockManager.blockGroup.y - Constants.BLOCK_HEIGHT },
        Constants.ROW_MOVE_TIME,
        Phaser.Easing.Linear.None,
        true,
        0
      );
  }
}
