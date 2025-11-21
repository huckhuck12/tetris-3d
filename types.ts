export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Tetromino {
  shape: number[][]; // 形状矩阵
  color: string;     // 颜色
  type: TetrominoType; // 类型
}

export interface Position {
  x: number;
  y: number;
}

export interface ActivePiece {
  position: Position;
  tetromino: Tetromino;
}

// Board 是一个二维数组，null 表示空，字符串表示锁定方块的颜色
export type BoardState = (string | null)[][];

export enum GameStatus {
  MENU = 'MENU',       // 菜单
  PLAYING = 'PLAYING', // 游戏中
  PAUSED = 'PAUSED',   // 暂停
  GAME_OVER = 'GAME_OVER', // 游戏结束
}