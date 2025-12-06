import { Tetromino, TetrominoType } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const TICK_RATE_MS = 800;
export const FAST_DROP_RATE_MS = 50;

export const TETROMINOS: Record<TetrominoType, Tetromino> = {
  I: {
    type: 'I',
    shape: [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    color: '#06b6d4', // cyan-500
  },
  O: {
    type: 'O',
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#eab308', // yellow-500
  },
  T: {
    type: 'T',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a855f7', // purple-500
  },
  S: {
    type: 'S',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#22c55e', // green-500
  },
  Z: {
    type: 'Z',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#ef4444', // red-500
  },
  J: {
    type: 'J',
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    color: '#3b82f6', // blue-500
  },
  L: {
    type: 'L',
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    color: '#f97316', // orange-500
  },
};

export const EMPTY_CELL = { type: null, color: '#1e293b', locked: false }; // slate-800