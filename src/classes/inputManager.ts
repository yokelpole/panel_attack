import * as _ from "lodash";
import Constants from "../utils/constants";
import BlockManager from "./blockManager";

export default class InputManager {
  private swipeStartX: number = null;
  private selectedBlock: Phaser.Sprite = null;
  private blockManager: BlockManager = null;
  private game: Phaser.Game = null;

  constructor(game: Phaser.Game, blockManager: BlockManager) {
    this.game = game;
    this.blockManager = blockManager;
    this.blockManager.setInputManager(this);
  }

  public startSwipeTracking(block: Phaser.Sprite, pointer: Phaser.Pointer): void {
    this.swipeStartX = pointer.x;
    this.selectedBlock = block;
  }

  public endSwipeTracking(block: Phaser.Sprite, pointer: Phaser.Pointer): void {
    if (Math.abs(pointer.x - this.swipeStartX) > 25) {
      const swipeDirection = pointer.x - this.swipeStartX > 0 ? 1 : -1;
      this.blockManager.moveBlocks(this.selectedBlock, pointer, swipeDirection);
    }

    this.swipeStartX = null;
    this.selectedBlock = null;
  }
}
