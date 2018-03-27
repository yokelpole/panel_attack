import * as Assets from "../assets";
import * as _ from "lodash";

const BLOCK_WIDTH = 48;
const BLOCK_HEIGHT = 48;
const BOARD_WIDTH = 6;
const BOARD_HEIGHT = 12;

const blockTypes = [
  Assets.Images.ImagesBlue,
  Assets.Images.ImagesGreen,
  Assets.Images.ImagesPurple,
  Assets.Images.ImagesRed,
  Assets.Images.ImagesTeal,
  Assets.Images.ImagesYellow
];

export default class Title extends Phaser.State {
  private backgroundTemplateSprite: Phaser.Sprite = null;
  private blockGroup: Phaser.Group = null;
  private blockMap: Phaser.Sprite[][] = null;
  private clickedBlock: any = null;

  public create(): void {
    this.backgroundTemplateSprite = this.game.add.sprite(
      this.game.world.centerX,
      this.game.world.centerY,
      Assets.Images.ImagesBackgroundTemplate.getName()
    );
    this.backgroundTemplateSprite.anchor.setTo(0.5);

    this.blockGroup = this.game.add.group();
    this.blockMap = [];

    for (let x = 0; x < 12; x++) {
      this.blockMap[x] = [];
    }

    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 6; y++) {
        const newBlock = this.blockGroup.create(
          this.game.world.width / 2 - BLOCK_WIDTH * 3 + x * BLOCK_WIDTH,
          this.game.world.height - BLOCK_HEIGHT - y * BLOCK_HEIGHT,
          this.getSafeBlockType(x, y)
        );

        newBlock.inputEnabled = true;
        newBlock.events.onInputDown.add(this.onBlockClick, this);
        newBlock.blockLocation = { x, y };

        this.blockMap[x][y] = newBlock;
      }
    }

    this.backgroundTemplateSprite.inputEnabled = true;

    this.game.camera.flash(0x000000, 1000);
  }

  private onBlockClick(block) {
    if (this.clickedBlock) {
      const blockProximity =
        block.blockLocation.x - this.clickedBlock.blockLocation.x;
      const withinOneBlock = blockProximity === -1 || blockProximity === 1;
      const onSameLine =
        block.blockLocation.y === this.clickedBlock.blockLocation.y;
      if (withinOneBlock && onSameLine) {
        // Swap their actual locations.
        const swapBlockGridPosition = { x: block.blockLocation.x, y: block.blockLocation.y };
        const swapBlockPosition = { x: block.x, y: block.y };

        this.blockMap[this.clickedBlock.blockLocation.x][this.clickedBlock.blockLocation.y] = block;
        this.blockMap[swapBlockGridPosition.x][swapBlockGridPosition.y] = this.clickedBlock;

        block.x = this.clickedBlock.x;
        block.y = this.clickedBlock.y;
        this.clickedBlock.x = swapBlockPosition.x;
        this.clickedBlock.y = swapBlockPosition.y;

        this.clickedBlock.scale.set(1.0);
        return;
      }

      this.clickedBlock.scale.set(1.0);
    }

    this.clickedBlock = block;

    this.clickedBlock.scale.set(0.8);
  }

  private getSafeBlockType(x: number, y: number): string {
    let blockType = _.sample(blockTypes).getName();
    let valid = false;

    while (!valid) {
      let yCount = 0;
      let xCount = 0;

      for (let testY = y - 2; testY <= x + 2; testY++) {
        if (testY === y || testY < 0 || testY > BOARD_HEIGHT) continue;
        if (_.get(this.blockMap[x][testY], "key") === blockType) yCount++;
      }

      for (let testX = x - 2; testX <= x + 2; testX++) {
        if (testX === x || testX < 0 || testX > BOARD_WIDTH) continue;
        if (_.get(this.blockMap[testX][y], "key") === blockType) xCount++;
      }

      if (xCount < 2 && yCount < 2) valid = true;
      else blockType = _.sample(blockTypes).getName();
    }

    return blockType;
  }
}
