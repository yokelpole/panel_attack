import * as Assets from "../assets";
import * as _ from "lodash";

const BLOCK_WIDTH = 130;
const BLOCK_HEIGHT = 48;
const BOARD_WIDTH = 6;
const BOARD_HEIGHT = 8;
const ROW_MOVE_TIME = 100;
const BLOCK_MOVE_TIME = 100;

enum axis {
  x,
  y
}

const blockTypes = [
  Assets.Images.ImagesBlue,
  Assets.Images.ImagesGreen,
  Assets.Images.ImagesPurple,
  Assets.Images.ImagesRed,
  Assets.Images.ImagesOrange,
  Assets.Images.ImagesYellow
];

export default class Title extends Phaser.State {
  private backgroundTemplateSprite: Phaser.Sprite = null;
  private blockGroup: Phaser.Group = null;
  private blockMap: Phaser.Sprite[][] = null;
  private firstBlock: Phaser.Sprite = null;
  private addRowTimer: Phaser.Timer = null;
  private upwardsTween: Phaser.Tween = null;
  private haltTimer: Phaser.Timer = null;
  private activeSettleTweenCount: number = null;
  private swipeStartX: number = null;

  public create(): void {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.blockGroup = this.game.add.group();
    this.activeSettleTweenCount = 0;

    this.blockMap = [];
    for (let x = 0; x < BOARD_HEIGHT; x++) this.blockMap[x] = [];

    for (let x = 0; x < BOARD_WIDTH; x++) {
      // y starts at -1 as to fill the incoming but inactive row.
      for (let y = -1; y < 3; y++) this.blockMap[x][y] = this.createNewBlock(x, y);
    }

    this.addRowTimer = this.game.time.create(false);
    this.addRowTimer.loop(ROW_MOVE_TIME, () => this.addRow());
    this.addRowTimer.start();

    this.upwardsTween = this.tweenUpwardsOneRow();

    this.game.camera.flash(0x000000, 1000);
  }

  private tweenUpwardsOneRow(): Phaser.Tween {
    return this.game.add
      .tween(this.blockGroup)
      .to({ y: this.blockGroup.y - BLOCK_HEIGHT }, ROW_MOVE_TIME, "Linear", true, 0);
  }

  private createNewBlock(x: number, y: number): Phaser.Sprite {
    const yPos =
      y > 0
        ? this.game.world.height - BLOCK_HEIGHT - y * BLOCK_HEIGHT
        : this.game.world.height - BLOCK_HEIGHT - this.blockGroup.y - y * BLOCK_HEIGHT;

    const newBlock: Phaser.Sprite = this.blockGroup.create(
      this.game.world.width / 2 - BLOCK_WIDTH * 3 + x * BLOCK_WIDTH,
      yPos,
      this.getSafeBlockType(x, y)
    );

    if (y >= 0) newBlock.inputEnabled = true;
    else {
      newBlock.inputEnabled = false;
      newBlock.alpha = 0.5;
    }

    newBlock.events.onInputDown.add(this.startSwipeTracking, this);
    newBlock.events.onInputUp.add(this.endSwipeTracking, this);

    return newBlock;
  }

  private startSwipeTracking(block: Phaser.Sprite, pointer: Phaser.Pointer) {
    this.swipeStartX = pointer.x;
    this.firstBlock = block;
  }

  private endSwipeTracking(block: Phaser.Sprite, pointer: Phaser.Pointer) {
    if (this.swipeStartX) {
      const distanceX = Math.abs(pointer.x - this.swipeStartX);

      if (distanceX > 25) {
        const blockPosition = this.determineBlockPosition(this.firstBlock);
        const swipeDirection = pointer.x - this.swipeStartX > 0 ? 1 : -1;

        const switchX = blockPosition.x + swipeDirection;
        if (switchX < 0 || switchX >= BOARD_WIDTH) return;

        const secondBlock = this.blockMap[switchX][blockPosition.y];
        this.blockMap[switchX][blockPosition.y] = this.firstBlock;

        if (secondBlock) this.swapBlocks(blockPosition, this.firstBlock, secondBlock);
        else this.moveSingleBlock(blockPosition, this.firstBlock, swipeDirection);
      }
    }

    this.swipeStartX = null;
    this.firstBlock = null;
  }

  private swapBlocks(
    blockPosition: { x; y },
    firstBlock: Phaser.Sprite,
    secondBlock: Phaser.Sprite
  ) {
    const swapBlockPosition = { x: firstBlock.x, y: firstBlock.y };

    // First block has already been moved since it gets moved in every move, not just swaps.
    this.blockMap[blockPosition.x][blockPosition.y] = secondBlock;

    // Tween their locations.
    this.game.add.tween(firstBlock).to({ x: secondBlock.x }, BLOCK_MOVE_TIME, "Linear", true);
    this.game.add
      .tween(secondBlock)
      .to({ x: swapBlockPosition.x }, BLOCK_MOVE_TIME, "Linear", true);

    setTimeout(() => this.clearBoardCombos(), BLOCK_MOVE_TIME);
  }

  private moveSingleBlock(blockPosition: { x; y }, block: Phaser.Sprite, swipeDirection: number) {
    this.blockMap[blockPosition.x][blockPosition.y] = undefined;

    const xPos =
      swipeDirection === -1 ? this.firstBlock.x - BLOCK_WIDTH : this.firstBlock.x + BLOCK_WIDTH;

    this.game.add
      .tween(this.firstBlock)
      .to({ x: xPos }, BLOCK_MOVE_TIME, "Linear", true, 0)
      .onComplete.add(this.clearBoardCombos, this);
  }

  private addRow(): void {
    // End game if blocks are too high.
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (this.blockMap[x][BOARD_HEIGHT]) {
        this.addRowTimer.stop();

        const style = {
          font: "bold 48px Arial",
          fill: "#fff",
          boundsAlignH: "center",
          boundsAlignV: "middle"
        };

        const text = this.game.add.text(0, 0, "GAME OVER", style);
        text.setShadow(3, 3, "rgba(0,0,0,0.5)", 2);
        text.setTextBounds(0, 0, this.game.width, this.game.height);

        text.inputEnabled = true;
        text.events.onInputDown.add(() => this.game.state.restart());
        return;
      }
    }

    for (let x = 0; x < BOARD_WIDTH; x++) {
      for (let y = BOARD_HEIGHT; y >= 0; y--) {
        this.blockMap[x][y] = this.blockMap[x][y - 1];
        if (y === 0) {
          this.blockMap[x][y].alpha = 1.0;
          this.blockMap[x][y].inputEnabled = true;
        }
      }
    }

    for (let x = 0; x < BOARD_WIDTH; x++) this.blockMap[x][-1] = this.createNewBlock(x, -1);

    this.upwardsTween = this.tweenUpwardsOneRow();
    this.clearBoardCombos();
  }

  private logBlockMap(debugString) {
    console.log(`### ${debugString}`);

    for (let y = -1; y < BOARD_HEIGHT; y++) {
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

  private clearBoardCombos(): void {
    const combos = this.scanBoardForCombos();

    if (!_.isEmpty(combos)) {
      this.upwardsTween.pause();
      this.addRowTimer.pause();

      this.clearComboBlocks(combos);

      // Prevent older timers from resuming the action.
      if (this.haltTimer) {
        this.haltTimer.stop();
        this.haltTimer = undefined;
      }

      this.haltTimer = this.game.time.create();
      this.haltTimer.add(BLOCK_MOVE_TIME * 2, () => {
        this.upwardsTween.resume();
        this.addRowTimer.resume();
      });
      this.haltTimer.start();
    }
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

  private scanBoardForCombos(): Array<[number, number]> {
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

  private clearComboBlocks(locations): void {
    _.each(locations, location => {
      this.blockMap[location.x][location.y].destroy();
      this.blockMap[location.x][location.y] = undefined;
    });
  }

  private settleBlocks(): void {
    // Start at 1 so the bottom row doesn't settle off grid.
    for (let y = 1; y <= BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const block = this.blockMap[x][y];

        if (block && !this.blockMap[x][y - 1]) {
          let currentY = y - 1;

          while (currentY > 0 && !this.blockMap[x][currentY - 1]) {
            currentY -= 1;
          }

          this.blockMap[x][currentY] = block;
          this.blockMap[x][y] = undefined;

          this.game.add
            .tween(block)
            .to({ y: block.y + BLOCK_HEIGHT * (y - currentY) }, BLOCK_MOVE_TIME, "Linear", true)
            .onComplete.add(tween => {
              this.activeSettleTweenCount -= 1;
              if (!this.activeSettleTweenCount) {
                // Can only check board combos once everything is settled or else
                // tweening location of objects gets thrown off.
                this.clearBoardCombos();

                // TODO: Maybe a function to settle slighly errant blocks?
              }
            }, this);
          this.activeSettleTweenCount += 1;
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

      for (let testY = y - 2; testY <= y + 2; testY++) {
        // -1 here due to the extra row at the bottom.
        if (testY === y || testY < -1 || testY > BOARD_HEIGHT) continue;
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
