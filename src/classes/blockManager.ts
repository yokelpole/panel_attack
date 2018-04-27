import * as Assets from "../assets";
import * as _ from "lodash";
import Constants from "../utils/constants";
import InputManager from "./inputManager";
import TweenManager from "./tweenManager";
import TopBar from "./topBar";

enum axis {
  x,
  y
}

export default class BlockManager {
  public blockGroup: Phaser.Group = null;
  public firstBlock: Phaser.Sprite = null;
  public eliminatedBlocks: number = null;

  private game: Phaser.Game = undefined;
  private blockMap: Phaser.Sprite[][] = null;
  private inputManager: InputManager = null;
  private tweenManager: TweenManager = null;
  private topBar: TopBar = null;

  public static blockTypes = [
    Assets.Images.ImagesBlue,
    Assets.Images.ImagesGreen,
    Assets.Images.ImagesPurple,
    Assets.Images.ImagesRed,
    Assets.Images.ImagesOrange,
    Assets.Images.ImagesYellow
  ];

  constructor(game: Phaser.Game) {
    this.game = game;
    this.blockGroup = this.game.add.group();

    this.blockMap = [];
    for (let x = 0; x < Constants.BOARD_HEIGHT; x++) this.blockMap[x] = [];

    this.eliminatedBlocks = 0;
  }

  public setInputManager(inputManager: InputManager) {
    this.inputManager = inputManager;
  }

  public setTweenManager(tweenManager: TweenManager) {
    this.tweenManager = tweenManager;
  }

  public setTopBar(topBar: TopBar) {
    this.topBar = topBar;
  }

  public addStarterRows(): void {
    for (let x = 0; x < Constants.BOARD_WIDTH; x++) {
      // y starts at -1 as to fill the incoming but inactive row.
      for (let y = -1; y < 3; y++) this.blockMap[x][y] = this.createNewBlock(x, y);
    }
  }

  public addNewRow(): void {
    for (let x = 0; x < Constants.BOARD_WIDTH; x++) {
      for (let y = Constants.BOARD_HEIGHT; y >= 0; y--) {
        this.blockMap[x][y] = this.blockMap[x][y - 1];
        if (y === 0) {
          this.blockMap[x][y].alpha = 1.0;
          this.blockMap[x][y].inputEnabled = true;
        }
      }
    }

    for (let x = 0; x < Constants.BOARD_WIDTH; x++) {
      this.blockMap[x][-1] = this.createNewBlock(x, -1);
    }
  }

  public determineBlockPosition(block: Phaser.Sprite) {
    const topRow = _.first(_.reject(_.map(this.blockMap, column => column[0]), _.isUndefined));
    const xGridPos = Math.round(block.x / Constants.BLOCK_WIDTH);
    const yGridPos = Math.round(Math.abs((block.y - topRow.y) / Constants.BLOCK_HEIGHT));

    return { x: xGridPos, y: yGridPos };
  }

  public moveBlocks(selectedBlock: Phaser.Sprite, pointer: Phaser.Pointer, swipeDirection: 1 | -1) {
    if (_.get(selectedBlock, ["input", "enabled"]) === false) return;

    const blockPosition = this.determineBlockPosition(selectedBlock);

    const switchX = blockPosition.x + swipeDirection;
    if (switchX < 0 || switchX >= Constants.BOARD_WIDTH) return;

    const secondBlock = this.blockMap[switchX][blockPosition.y];
    if (_.get(secondBlock, ["input", "enabled"]) === false) return;

    this.blockMap[switchX][blockPosition.y] = selectedBlock;

    if (secondBlock) this.swapBlocks(blockPosition, selectedBlock, secondBlock);
    else this.moveSingleBlock(blockPosition, selectedBlock, swipeDirection);
  }

  public blocksTooHigh(): boolean {
    for (let x = 0; x < Constants.BOARD_WIDTH; x++) {
      if (this.blockMap[x][Constants.BOARD_HEIGHT]) return true;
    }

    return false;
  }

  public logBlockMap(debugString) {
    console.log(`### ${debugString}`);

    for (let y = -1; y < Constants.BOARD_HEIGHT; y++) {
      let rowString = "";

      for (let x = 0; x < Constants.BOARD_WIDTH; x++) {
        const block = this.blockMap[x][y];
        rowString = rowString.concat(_.first(_.get(block, "key")) || " ");
      }
      console.log(rowString);
    }
  }

  public evaluateBoard(): void {
    let settlingBlocks = false;

    // Start at 1 so the bottom row doesn't settle off grid.
    for (let y = 1; y <= Constants.BOARD_HEIGHT; y++) {
      for (let x = 0; x < Constants.BOARD_WIDTH; x++) {
        const block = this.blockMap[x][y];

        if (!block || this.blockMap[x][y - 1]) continue;

        settlingBlocks = true;
        let currentY = y - 1;

        while (currentY > 0 && !this.blockMap[x][currentY - 1]) {
          currentY -= 1;
        }

        this.blockMap[x][currentY] = block;
        this.blockMap[x][y] = undefined;

        const newY =
          this.blockMap[x][-1].y - Constants.BLOCK_HEIGHT - Constants.BLOCK_HEIGHT * currentY;

        this.tweenManager.settleBlock(block, newY);
      }
    }

    if (!settlingBlocks) this.clearCombos();
  }

  private clearCombos(): void {
    const combos = this.scanForCombos();

    if (!_.isEmpty(combos)) {
      this.tweenManager.pauseTweens();
      this.clearFoundCombos(combos);
      this.evaluateBoard();
    }
  }

  private swapBlocks(
    blockPosition: { x; y },
    firstBlock: Phaser.Sprite,
    secondBlock: Phaser.Sprite
  ) {
    // First block has already been moved since it gets moved in every move, not just swaps.
    this.blockMap[blockPosition.x][blockPosition.y] = secondBlock;
    this.tweenManager.swapBlocks(firstBlock, secondBlock);
  }

  private moveSingleBlock(blockPosition: { x; y }, block: Phaser.Sprite, swipeDirection: 1 | -1) {
    this.blockMap[blockPosition.x][blockPosition.y] = undefined;
    this.tweenManager.moveSingleBlock(block, swipeDirection);
  }

  private scanForCombos() {
    const comboArray = [];
    // Check combos on x-axis
    for (let y = 0; y < Constants.BOARD_HEIGHT; y++) {
      for (let x = 0; x < Constants.BOARD_WIDTH; x++) {
        const comboCooridnates = this.checkBlockForCombos(x, y, axis.x);
        if (comboCooridnates) {
          x += comboCooridnates.length;
          comboArray.push(comboCooridnates);
        }
      }
    }

    // Check combos on y-axis
    for (let x = 0; x < Constants.BOARD_WIDTH; x++) {
      for (let y = 0; y < Constants.BOARD_HEIGHT; y++) {
        const comboCoordinates = this.checkBlockForCombos(x, y, axis.y);
        if (comboCoordinates) {
          y += comboCoordinates.length;
          comboArray.push(comboCoordinates);
        }
      }
    }

    return _.uniqWith(_.flatten(comboArray), _.isEqual);
  }

  private clearFoundCombos(locations): void {
    _.each(locations, location => {
      this.blockMap[location.x][location.y].destroy();
      this.blockMap[location.x][location.y] = undefined;

      this.eliminatedBlocks++;
    });

    this.topBar.update();
  }

  private checkBlockForCombos(x: number, y: number, axisChecked: axis): Array<Object> {
    const currentBlock = this.blockMap[x][y];
    if (!currentBlock) return;

    const combo = [];
    const comboCoordinates = [{ x, y }];

    let checkedLocation = axisChecked === axis.x ? x + 1 : y + 1;
    const withinBounds =
      axisChecked === axis.x
        ? checkedLocation => checkedLocation <= Constants.BOARD_WIDTH
        : checkedLocation => checkedLocation <= Constants.BOARD_HEIGHT;
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
      if (!nextBlock.input.enabled) break;

      if (nextBlock.key === currentBlock.key) {
        comboCoordinates.push(getCoordinates(checkedLocation));
        checkedLocation++;
      } else break;
    }

    if (comboCoordinates.length >= 3) return comboCoordinates;
    else return undefined;
  }

  public getBlockXRowPosition(x): number {
    return this.blockMap[x][-1].x;
  }

  private createNewBlock(x: number, y: number): Phaser.Sprite {
    const yPos =
      y > 0
        ? this.game.world.height - Constants.BLOCK_HEIGHT - y * Constants.BLOCK_HEIGHT
        : this.game.world.height -
          Constants.BLOCK_HEIGHT -
          this.blockGroup.y -
          y * Constants.BLOCK_HEIGHT;

    const newBlock: Phaser.Sprite = this.blockGroup.create(
      this.game.world.width / 2 - Constants.BLOCK_WIDTH * 3 + x * Constants.BLOCK_WIDTH,
      yPos,
      this.getSafeBlockType(x, y)
    );

    if (y >= 0) newBlock.inputEnabled = true;
    else {
      newBlock.inputEnabled = false;
      newBlock.alpha = 0.5;
    }

    newBlock.events.onInputDown.add(this.inputManager.startSwipeTracking, this.inputManager);
    newBlock.events.onInputUp.add(this.inputManager.endSwipeTracking, this.inputManager);

    return newBlock;
  }

  private getSafeBlockType(x: number, y: number): string {
    let blockType = _.sample(BlockManager.blockTypes).getName();
    let valid = false;

    while (!valid) {
      let yCount = 0;
      let xCount = 0;

      for (let testY = y - 2; testY <= y + 2; testY++) {
        // -1 here due to the extra row at the bottom.
        if (testY === y || testY < -1 || testY > Constants.BOARD_HEIGHT) continue;
        if (_.get(this.blockMap[x][testY], "key") === blockType) yCount++;
      }

      for (let testX = x - 2; testX <= x + 2; testX++) {
        if (testX === x || testX < 0 || testX > Constants.BOARD_WIDTH) continue;
        if (_.get(this.blockMap[testX][y], "key") === blockType) xCount++;
      }

      if (xCount < 2 && yCount < 2) valid = true;
      else blockType = _.sample(BlockManager.blockTypes).getName();
    }

    return blockType;
  }
}
