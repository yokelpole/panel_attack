import * as _ from "lodash";
import Constants from "../utils/constants";
import GameManager from "./gameManager";

enum direction {
  horizontal,
  vertical
}

export default class InputManager {
  public readonly activeSwipeDirection: direction;

  private swipeStartX: number = null;
  private selectedBlock: Phaser.Sprite = null;
  private gameManager: GameManager = null;
  private game: Phaser.Game = null;

  constructor(game: Phaser.Game, gameManager: GameManager) {
    this.game = game;
    this.gameManager = gameManager;
    this.activeSwipeDirection = direction.horizontal;
  }

  public startSwipeTracking(block: Phaser.Sprite, pointer: Phaser.Pointer): void {
    this.swipeStartX = pointer.x;
    this.selectedBlock = block;
  }

  public endSwipeTracking(block: Phaser.Sprite, pointer: Phaser.Pointer): void {
    if (Math.abs(pointer.x - this.swipeStartX) > 25) {
      const swipeDirection = pointer.x - this.swipeStartX > 0 ? 1 : -1;
      this.gameManager.blockManager.moveBlocks(this.selectedBlock, pointer, swipeDirection);
    }

    this.swipeStartX = null;
    this.selectedBlock = null;
  }
}
