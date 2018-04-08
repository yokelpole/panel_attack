import * as Assets from "../assets";
import * as _ from "lodash";

const BLOCK_WIDTH = 48;
const BLOCK_HEIGHT = 48;
const BOARD_WIDTH = 6;
const BOARD_HEIGHT = 12;
const ROW_MOVE_TIME = 4000;

enum axis {
  x,
  y
}

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
    this.backgroundTemplateSprite.events.onInputDown.add(this.onBackgroundClick, this);

    this.blockGroup = this.game.add.group();
    this.blockMap = [];

    for (let x = 0; x < BOARD_HEIGHT; x++) {
      this.blockMap[x] = [];
    }

    for (let x = 0; x < BOARD_WIDTH; x++) {
      for (let y = 0; y < 6; y++) {
        const yPos = this.game.world.height - BLOCK_HEIGHT - y * BLOCK_HEIGHT;

        const newBlock = this.blockGroup.create(
          this.game.world.width / 2 - BLOCK_WIDTH * 3 + x * BLOCK_WIDTH,
          yPos,
          this.getSafeBlockType(x, y)
        );

        newBlock.inputEnabled = true;
        newBlock.events.onInputDown.add(this.onBlockClick, this);

        this.blockMap[x][y] = newBlock;
      }
    }

    this.backgroundTemplateSprite.inputEnabled = true;

    this.timer = this.game.time.create(false);
    this.timer.loop(ROW_MOVE_TIME, () => this.addRow());
    this.timer.start();

    this.tweenUpwardsOneRow();

    this.game.camera.flash(0x000000, 1000);
  }

  private tweenUpwardsOneRow() {
    this.game.add
      .tween(this.blockGroup)
      .to({ y: this.blockGroup.y - BLOCK_HEIGHT }, ROW_MOVE_TIME, "Linear", true, 0);
  }

  private addRow() {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      for (let y = BOARD_HEIGHT; y > 0; y--) {
        this.blockMap[x][y] = this.blockMap[x][y - 1];
      }
    }

    for (let x = 0; x < BOARD_WIDTH; x++) {
      const yPos = this.game.world.height - BLOCK_HEIGHT - this.blockGroup.y;

      const newBlock = this.blockGroup.create(
        this.game.world.width / 2 - BLOCK_WIDTH * 3 + x * BLOCK_WIDTH,
        yPos,
        this.getSafeBlockType(x, 0)
      );

      newBlock.inputEnabled = true;
      newBlock.events.onInputDown.add(this.onBlockClick, this);

      this.blockMap[x][0] = newBlock;
    }

    this.clearBoardCombos();
    this.tweenUpwardsOneRow();
    this.logBlockMap("Added new row");
  }

  private logBlockMap(debugString) {
    console.log(`### ${debugString}`);

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      let rowString = "";

      for (let x = 0; x < BOARD_WIDTH; x++) {
        const block = this.blockMap[x][y];
        rowString = rowString.concat(_.first(_.get(block, "key")) || " ");
      }
      console.log(rowString);
    }
  }

  private determineBlockPosition(block: Phaser.Sprite) {
    const topRow = _.first(this.blockMap[0]);
    const xGridPos = Math.round((block.x - topRow.x) / BLOCK_WIDTH);
    const yGridPos = Math.round(Math.abs((block.y - topRow.y) / BLOCK_HEIGHT));

    return { x: xGridPos, y: yGridPos };
  }

  private onBackgroundClick(bgSprite: Phaser.Sprite, pointer: Phaser.Pointer) {
    if (!this.firstBlock) return;

    const blockGridPosition = this.determineBlockPosition(this.firstBlock);
    const offsetX =
      pointer.x < this.firstBlock.x ? blockGridPosition.x - 1 : blockGridPosition.x + 1;

    if (offsetX < 0 || offsetX > BOARD_WIDTH) return;

    if (this.blockMap[offsetX][blockGridPosition.y] !== undefined) {
      this.firstBlock = null;
      return;
    }

    this.blockMap[offsetX][blockGridPosition.y] = this.firstBlock;
    this.blockMap[blockGridPosition.x][blockGridPosition.y] = undefined;

    const xPos =
      pointer.x < this.firstBlock.x
        ? this.firstBlock.x - BLOCK_WIDTH
        : this.firstBlock.x + BLOCK_WIDTH;

    const blockTween = this.game.add.tween(this.firstBlock);
    blockTween.to({ x: xPos }, 200, "Linear", true, 0).onComplete.add(this.clearBoardCombos, this);

    this.firstBlock.scale.set(1.0);
    this.firstBlock = null;
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

      // Tween their locations.
      this.game.add.tween(this.firstBlock).to({ x: secondBlock.x }, 200, "Linear", true, 0);
      this.game.add.tween(secondBlock).to({ x: swapBlockPosition.x }, 200, "Linear", true, 0);

      this.clearBoardCombos();
    }

    this.firstBlock.scale.set(1.0);
    this.firstBlock = null;
  }

  private clearBoardCombos() {
    this.clearComboBlocks(this.scanBoardForCombos());
    this.settleBlocks();
  }

  private checkBlockForCombos(x: number, y: number, axisChecked: axis): Array<Object> {
    const currentBlock = this.blockMap[x][y];
    if (!currentBlock) return;

    const combo = [];
    const comboCoordinates = [{ x, y }];

    let checkedLocation = axisChecked === axis.x ? x + 1 : y + 1;
    const withinBounds =
      axisChecked === axis.x
        ? checkedLocation => checkedLocation <= BOARD_WIDTH
        : checkedLocation => checkedLocation <= BOARD_HEIGHT;
    const getBlock =
      axisChecked === axis.x
        ? checkedLocation => this.blockMap[checkedLocation][y]
        : checkedLocation => this.blockMap[x][checkedLocation];
    const getCoordinates =
      axisChecked === axis.x
        ? checkedLocation => {
            return { x: checkedLocation, y };
          }
        : checkedLocation => {
            return { x, y: checkedLocation };
          };

    while (withinBounds(checkedLocation)) {
      const nextBlock = getBlock(checkedLocation);
      if (!nextBlock) break;

      if (nextBlock.key === currentBlock.key) {
        comboCoordinates.push(getCoordinates(checkedLocation));
        checkedLocation++;
      } else break;
    }

    if (comboCoordinates.length >= 3) return comboCoordinates;
    else return undefined;
  }

  private scanBoardForCombos() {
    const comboArray = [];

    // Check combos on x-axis
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const comboCooridnates = this.checkBlockForCombos(x, y, axis.x);
        if (comboCooridnates) comboArray.push(comboCooridnates);
      }
    }

    // Check combos on y-axis
    for (let x = 0; x < BOARD_WIDTH; x++) {
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        const comboCoordinates = this.checkBlockForCombos(x, y, axis.y);
        if (comboCoordinates) comboArray.push(comboCoordinates);
      }
    }

    return _.uniqWith(_.flatten(comboArray), _.isEqual);
  }

  private clearComboBlocks(locations) {
    _.each(locations, location => {
      this.blockMap[location.x][location.y].destroy();
      this.blockMap[location.x][location.y] = undefined;
    });
  }

  private settleBlocks() {
    let blocksSettled = false;

    // Start at 1 so the bottom row doesn't settle off grid.
    for (let y = 1; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const block = this.blockMap[x][y];

        if (block && !this.blockMap[x][y - 1]) {
          blocksSettled = true;
          let currentY = y - 1;

          while (currentY > 0 && !this.blockMap[x][currentY - 1]) {
            currentY -= 1;
          }

          this.blockMap[x][currentY] = block;
          this.blockMap[x][y] = undefined;

          this.game.add
            .tween(block)
            .to({ y: block.y + BLOCK_HEIGHT * (y - currentY) }, 200, "Linear", true)
            .onComplete.add(this.clearBoardCombos, this);
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
