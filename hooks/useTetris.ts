import { useState, useCallback, useRef, useEffect } from 'react';
import { Board, GameStatus, PlayerState, Position } from '../types';
import {
  createEmptyBoard,
  getRandomTetromino,
  checkCollision,
  mergePieceToBoard,
  rotateMatrix,
  createRNG,
} from '../utils/gameUtils';
import { BOARD_WIDTH, TICK_RATE_MS } from '../constants';

export const useTetris = (isBot: boolean = false) => {
  const rngRef = useRef<() => number>(() => Math.random());
  
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [state, setState] = useState<PlayerState>(() => ({
    board: createEmptyBoard(),
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    nextPiece: getRandomTetromino(rngRef.current),
    activePiece: null,
  }));

  const requestRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const resetGame = useCallback((seed?: number) => {
    if (seed !== undefined) {
      rngRef.current = createRNG(seed);
    } else {
      rngRef.current = () => Math.random();
    }

    setState({
      board: createEmptyBoard(),
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      nextPiece: getRandomTetromino(rngRef.current),
      activePiece: {
        data: getRandomTetromino(rngRef.current),
        position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      },
    });
    setStatus(GameStatus.PLAYING);
  }, []);

  const move = useCallback(
    (dir: { x: number; y: number }) => {
      if (status !== GameStatus.PLAYING || state.gameOver || !state.activePiece) return;

      const { x, y } = state.activePiece.position;
      const nextPos = { x: x + dir.x, y: y + dir.y };

      if (!checkCollision(state.board, state.activePiece.data, nextPos)) {
        setState((prev) => ({
          ...prev,
          activePiece: {
            ...prev.activePiece!,
            position: nextPos,
          },
        }));
        return true;
      }
      return false;
    },
    [status, state.gameOver, state.activePiece, state.board]
  );

  const rotate = useCallback(() => {
    if (status !== GameStatus.PLAYING || state.gameOver || !state.activePiece) return;

    const rotatedShape = rotateMatrix(state.activePiece.data.shape);
    const nextPiece = { ...state.activePiece.data, shape: rotatedShape };

    // Wall kick (basic)
    const pos = state.activePiece.position;
    const offsets = [0, 1, -1, 2, -2];
    
    for (const offset of offsets) {
       if (!checkCollision(state.board, nextPiece, { ...pos, x: pos.x + offset })) {
           setState(prev => ({
               ...prev,
               activePiece: {
                   ...prev.activePiece!,
                   data: nextPiece,
                   position: { ...pos, x: pos.x + offset }
               }
           }));
           return;
       }
    }
  }, [status, state.activePiece, state.board, state.gameOver]);

  const drop = useCallback(() => {
    if (!move({ x: 0, y: 1 })) {
      // Lock piece
      if (state.activePiece) {
        // 1. Merge
        const newBoard = mergePieceToBoard(state.board, state.activePiece.data, state.activePiece.position);
        
        // 2. Clear Lines
        let linesCleared = 0;
        const finalBoard = newBoard.filter(row => {
          const isFull = row.every(cell => cell.locked);
          if (isFull) linesCleared++;
          return !isFull;
        });
        
        while (finalBoard.length < 20) {
          finalBoard.unshift(Array(BOARD_WIDTH).fill(null).map(() => ({ type: null, color: '#1e293b', locked: false })));
        }

        // 3. Score
        const points = [0, 100, 300, 500, 800];
        const newScore = state.score + (points[linesCleared] * state.level);

        // 4. Next Piece
        const nextPieceData = state.nextPiece;
        const newNextPiece = getRandomTetromino(rngRef.current);
        
        // 5. Game Over Check
        const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
        const isGameOver = checkCollision(finalBoard, nextPieceData, startPos);

        setState(prev => ({
          ...prev,
          board: finalBoard,
          score: newScore,
          lines: prev.lines + linesCleared,
          level: Math.floor((prev.lines + linesCleared) / 10) + 1,
          activePiece: isGameOver ? null : { data: nextPieceData, position: startPos },
          nextPiece: newNextPiece,
          gameOver: isGameOver
        }));

        if (isGameOver) {
          setStatus(GameStatus.GAME_OVER);
        }
      }
    }
  }, [move, state.activePiece, state.board, state.nextPiece, state.score, state.level]);

  // Game Loop
  const tick = useCallback((time: number) => {
    if (status !== GameStatus.PLAYING) {
        requestRef.current = requestAnimationFrame(tick);
        return;
    }

    const speed = Math.max(100, TICK_RATE_MS - (state.level - 1) * 50);
    
    if (time - lastTickRef.current > speed) {
      drop();
      lastTickRef.current = time;
    }
    requestRef.current = requestAnimationFrame(tick);
  }, [status, state.level, drop]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [tick]);

  // Bot AI Simulation
  useEffect(() => {
    if (!isBot || status !== GameStatus.PLAYING || !state.activePiece) return;
    
    // Simple naive bot: 10% chance to rotate, 30% chance to move L/R per tick check
    // In a real scenario, this would evaluate the board. 
    // We simulate "thinking" by acting periodically.
    
    const botTimer = setInterval(() => {
       const r = Math.random();
       if (r > 0.8) rotate();
       else if (r > 0.5) move({ x: 1, y: 0});
       else if (r > 0.2) move({ x: -1, y: 0});
       // Bot falls naturally via main loop
    }, 400);

    return () => clearInterval(botTimer);
  }, [isBot, status, state.activePiece, rotate, move]);


  return { state, status, setStatus, move, rotate, drop, resetGame };
};