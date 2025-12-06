export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type Tetromino = {
  shape: number[][];
  color: string;
  type: TetrominoType;
};

export type BoardCell = {
  type: TetrominoType | null;
  color: string;
  locked: boolean;
};

export type Board = BoardCell[][];

export type Position = {
  x: number;
  y: number;
};

export type PlayerState = {
  board: Board;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  nextPiece: Tetromino;
  activePiece: {
    data: Tetromino;
    position: Position;
  } | null;
};

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum AppMode {
  LOGIN = 'LOGIN',
  MATCHING = 'MATCHING',
  GAME = 'GAME'
}

// Network Types
export type PlayerProfile = {
  id: string;
  name: string;
};

export type NetworkMessage = 
  | { type: 'JOIN'; player: PlayerProfile }
  | { type: 'ACK'; player: PlayerProfile; targetId: string }
  | { type: 'START_GAME'; seed: number }
  | { type: 'STATE_UPDATE'; state: PlayerState; playerId: string }
  | { type: 'PLAYER_DISCONNECT'; playerId: string };
