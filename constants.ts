import { Tetromino, TetrominoType } from './types';

export const BOARD_WIDTH = 10;  // 棋盘宽度
export const BOARD_HEIGHT = 20; // 棋盘高度

export const COLORS = {
  I: '#06b6d4', // 青色-500
  J: '#3b82f6', // 蓝色-500
  L: '#f97316', // 橙色-500
  O: '#eab308', // 黄色-500
  S: '#22c55e', // 绿色-500
  T: '#a855f7', // 紫色-500
  Z: '#ef4444', // 红色-500
  Ghost: '#ffffff', // 幽灵方块颜色
  Grid: '#1e293b',  // 网格颜色
};

export const TETROMINOS: Record<TetrominoType, Tetromino> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: COLORS.I,
    type: 'I',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: COLORS.J,
    type: 'J',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: COLORS.L,
    type: 'L',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: COLORS.O,
    type: 'O',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: COLORS.S,
    type: 'S',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: COLORS.T,
    type: 'T',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: COLORS.Z,
    type: 'Z',
  },
};

// 随机获取一个方块
export const RANDOM_TETROMINO = (): Tetromino => {
  const keys = Object.keys(TETROMINOS) as TetrominoType[];
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOS[randKey];
};