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
  private firstBlock: Phaser.Sprite = null;
  private timer: Phaser.Timer = null;

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

        this.blockMap[x][y] = newBlock;
      }
    }

    this.backgroundTemplateSprite.inputEnabled = true;

    this.timer = this.game.time.create(false);
    this.timer.loop(4000, () => this.addRow());
    this.timer.start();

    this.game.camera.flash(0x000000, 1000);
  }

  private addRow() {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      for (let y = BOARD_HEIGHT; y > 0; y--) {
        this.blockMap[x][y] = this.blockMap[x][y - 1];
      }
    }

    console.log("### SHIFTED ROWS");
    this.logBlockMap();

    // Move all blocks up one step.
    this.blockGroup.forEach(block => (block.y = block.y - BLOCK_HEIGHT), this);

    for (let x = 0; x < BOARD_WIDTH; x++) {
      const newBlock = this.blockGroup.create(
        this.game.world.width / 2 - BLOCK_WIDTH * 3 + x * BLOCK_WIDTH,
        this.game.world.height - BLOCK_HEIGHT,
        _.sample(blockTypes).getName()
      );

      newBlock.inputEnabled = true;
      newBlock.events.onInputDown.add(this.onBlockClick, this);

      this.blockMap[x][0] = newBlock;
    }

    console.log("### ADDED NEW ROW");
    this.logBlockMap();

    this.clearBoardCombos();
  }

  private logBlockMap() {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      let rowString = "";

      for (let x = 0; x < BOARD_WIDTH; x++) {
        const block = this.blockMap[x][y];
        rowString = block ? rowString.concat(_.first(block.key)) : " ";
      }
      console.log(rowString);
    }
  }

  private determineBlockPosition(block: Phaser.Sprite) {
    const topRow = _.first(this.blockMap[0]);
    const xGridPos = (block.x - topRow.x) / BLOCK_WIDTH;
    const yGridPos = Math.abs((block.y - topRow.y) / BLOCK_HEIGHT);

    return { x: xGridPos, y: yGridPos };
  }

  private onBlockClick(block: Phaser.Sprite) {
    if (!this.firstBlock) {
      this.firstBlock = block;
      this.firstBlock.scale.set(0.8);
      return;
    }

    const secondBlock = block;

    const firstBlockGridPosition = this.determineBlockPosition(this.firstBlock);
    const secondBlockGridPosition = this.determineBlockPosition(secondBlock);

    const blockProximity = firstBlockGridPosition.x - secondBlockGridPosition.x;
    const withinOneBlock = blockProximity === -1 || blockProximity === 1;
    const onSameLine = firstBlockGridPosition.y === secondBlockGridPosition.y;

    if (withinOneBlock && onSameLine) {
      const swapBlockPosition = { x: this.firstBlock.x, y: this.firstBlock.y };

      // Swap blockmap locations
      this.blockMap[secondBlockGridPosition.x][secondBlockGridPosition.y] = this.firstBlock;
      this.blockMap[firstBlockGridPosition.x][firstBlockGridPosition.y] = secondBlock;

      // Swap their actual locations.
      this.firstBlock.x = secondBlock.x;
      this.firstBlock.y = secondBlock.y;
      secondBlock.x = swapBlockPosition.x;
      secondBlock.y = swapBlockPosition.y;

      this.clearBoardCombos();
    }

    this.firstBlock.scale.set(1.0);
    this.firstBlock = null;
  }

  private clearBoardCombos() {
    const combos = this.scanBoardForCombos();
    this.clearComboBlocks(combos);
    this.settleBlocks();
  }

  private scanBoardForCombos() {
    const comboArray = [];

    // TODO: Reduce repetition between two loops.

    // Check combos on x-axis
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const currentBlock = this.blockMap[x][y];
        if (!currentBlock) continue;

        const checkedKey = currentBlock.key;
        const currentCheck = [{ x, y }];

        let checkedX = x + 1;
        while (checkedX < BOARD_WIDTH) {
          if (!this.blockMap[checkedX][y]) break;

          if (this.blockMap[checkedX][y].key === checkedKey) {
            currentCheck.push({ x: checkedX, y });
            checkedX++;
          } else break;
        }

        if (currentCheck.length >= 3) {
          comboArray.push(currentCheck);
          x += currentCheck.length;
        }
      }
    }

    // Check combos on y-axis
    for (let x = 0; x < BOARD_WIDTH; x++) {
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        const currentBlock = this.blockMap[x][y];
        if (!currentBlock) continue;

        const checkedKey = currentBlock.key;
        const currentCheck = [{ x, y }];

        let checkedY = y + 1;
        while (checkedY < BOARD_HEIGHT) {
          if (!this.blockMap[x][checkedY]) break;

          if (this.blockMap[x][checkedY].key === checkedKey) {
            currentCheck.push({ x, y: checkedY });
            checkedY++;
          } else break;
        }

        if (currentCheck.length >= 3) {
          comboArray.push(currentCheck);
          y += currentCheck.length;
        }
      }
    }

    return comboArray;
  }

  private clearComboBlocks(combos) {
    _.each(combos, combo => {
      _.each(combo, location => {
        if (!this.blockMap[location.x][location.y]) return;

        this.blockMap[location.x][location.y].destroy();
        this.blockMap[location.x][location.y] = undefined;
      });
    });
  }

  private settleBlocks() {
    // Start at 1 so the bottom row doesn't settle off grid.
    for (let y = 1; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const block = this.blockMap[x][y];

        if (block && !this.blockMap[x][y - 1]) {
          let currentY = y - 1;

          while (currentY > 0 && !this.blockMap[x][currentY - 1]) {
            currentY -= 1;
          }

          this.blockMap[x][currentY] = block;
          this.blockMap[x][y] = undefined;
          block.y += BLOCK_HEIGHT * (y - currentY);
        }
      }
    }
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
