/*import * as Assets from "../assets";
import * as _ from "lodash";

export default class Block {
  public create(x: number, y: number): Phaser.Sprite {
    const yPos =
      y > 0
        ? this.game.world.height - BLOCK_HEIGHT - y * BLOCK_HEIGHT
        : this.game.world.height - BLOCK_HEIGHT - this.blockGroup.y - y * BLOCK_HEIGHT;

    const newBlock: Phaser.Sprite = this.blockGroup.create(
      this.game.world.width / 2 - BLOCK_WIDTH * 3 + x * BLOCK_WIDTH,
      yPos,
      this.getSafeBlockType(x, y)
    );

    newBlock.inputEnabled = true;
    newBlock.events.onInputDown.add(this.startSwipeTracking, this);
    newBlock.events.onInputUp.add(this.endSwipeTracking, this);

    if (y < 0) newBlock.alpha = 0.5;

    return newBlock;
  }

  private startSwipeTracking(block: Phaser.Sprite, pointer: Phaser.Pointer) {
    this.swipeStartX = pointer.x;
    this.firstBlock = block;
    this.firstBlock.scale.set(0.8);
  }

  private endSwipeTracking(block: Phaser.Sprite, pointer: Phaser.Pointer) {
    if (this.swipeStartX) {
      const distanceX = Math.abs(pointer.x - this.swipeStartX);

      if (distanceX > 25) {
        const blockPosition = this.determineBlockPosition(this.firstBlock);
        const swipeDirection = pointer.x - this.swipeStartX > 0 ? 1 : -1;
        const switchX = blockPosition.x + swipeDirection;
        const secondBlock = this.blockMap[switchX][blockPosition.y];

        if (switchX < 0 || switchX >= BOARD_WIDTH) return;

        this.blockMap[switchX][blockPosition.y] = this.firstBlock;

        if (secondBlock) this.swapBlocks(blockPosition, this.firstBlock, secondBlock);
        else this.moveSingleBlock(blockPosition, this.firstBlock, pointer);
      }
    }

    this.firstBlock.scale.set(1.0);
    this.swipeStartX = null;
    this.firstBlock = null;
  }


}
*/