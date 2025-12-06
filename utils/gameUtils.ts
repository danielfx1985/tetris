import { BOARD_HEIGHT, BOARD_WIDTH, EMPTY_CELL, TETROMINOS } from '../constants';
import { Board, Tetromino, Position, TetrominoType } from '../types';

export const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({ ...EMPTY_CELL }))
  );

export const createRNG = (seed: number) => {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

export const getRandomTetromino = (rng: () => number = Math.random): Tetromino => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const rand = types[Math.floor(rng() * types.length)];
  return TETROMINOS[rand];
};

export const rotateMatrix = (matrix: number[][]): number[][] => {
  return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
};

export const checkCollision = (
  board: Board,
  piece: Tetromino,
  pos: Position
): boolean => {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      // 1. Check if the cell is part of the piece
      if (piece.shape[y][x] !== 0) {
        const boardY = y + pos.y;
        const boardX = x + pos.x;

        // 2. Check bounds
        if (
          boardX < 0 ||
          boardX >= BOARD_WIDTH ||
          boardY >= BOARD_HEIGHT
        ) {
          return true;
        }

        // 3. Check if cell is occupied (only if within vertical bounds)
        if (boardY >= 0 && board[boardY][boardX].locked) {
          return true;
        }
      }
    }
  }
  return false;
};

export const mergePieceToBoard = (board: Board, piece: Tetromino, pos: Position): Board => {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const boardY = y + pos.y;
        const boardX = x + pos.x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = {
            type: piece.type,
            color: piece.color,
            locked: true,
          };
        }
      }
    });
  });
  return newBoard;
};

// Canvas Helper for Gemini Vision
export const drawBoardToHiddenCanvas = (
  board: Board,
  activePiece: { data: Tetromino; position: Position } | null,
  canvas: HTMLCanvasElement
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const cellSize = 20;
  canvas.width = BOARD_WIDTH * cellSize;
  canvas.height = BOARD_HEIGHT * cellSize;

  // Background
  ctx.fillStyle = '#0f0f13';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Locked blocks
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell.locked) {
        ctx.fillStyle = cell.color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
      } else {
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    });
  });

  // Active Piece
  if (activePiece) {
    ctx.fillStyle = activePiece.data.color;
    activePiece.data.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const drawX = (activePiece.position.x + x) * cellSize;
          const drawY = (activePiece.position.y + y) * cellSize;
          ctx.fillRect(drawX, drawY, cellSize - 1, cellSize - 1);
        }
      });
    });
  }
};