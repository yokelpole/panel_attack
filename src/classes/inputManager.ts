import * as _ from "lodash";
import GameManager from "./gameManager";

interface ClickPosition {
  x: number;
  y: number;
}

export default class InputManager {
  private swipeStart: ClickPosition = null;
  private selectedBlock: Phaser.Sprite = null;
  private gameManager: GameManager = null;
  private game: Phaser.Game = null;

  constructor(game: Phaser.Game, gameManager: GameManager) {
    this.game = game;
    this.gameManager = gameManager;
  }

  public startSwipeTracking(block: Phaser.Sprite, pointer: Phaser.Pointer): void {
    this.swipeStart = { x: pointer.x, y: pointer.y };
    this.selectedBlock = block;
  }

  public endSwipeTracking(block: Phaser.Sprite, pointer: Phaser.Pointer): void {
    if (Math.abs(pointer.x - this.swipeStart.x) > 25) {
      // TODO: Fix this greasiness.
      const swipeDirection = pointer.x - this.swipeStart.x > 0 ? 1 : -1;
      this.gameManager.blockManager.moveBlocks(this.selectedBlock, pointer, swipeDirection);
    }

    this.swipeStart = null;
    this.selectedBlock = null;
  }
}
