import { useState, useEffect, useCallback, useRef } from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH, RANDOM_TETROMINO } from '../constants';
import { ActivePiece, BoardState, GameStatus, Position } from '../types';

// 创建空棋盘
const createEmptyBoard = (): BoardState =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

// 基础分数表 (1行, 2行, 3行, 4行)
const LINE_POINTS = [0, 100, 300, 500, 800];

export const useTetris = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.MENU);
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  
  // 游戏状态扩展
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);            // 当前等级
  const [linesClearedTotal, setLinesClearedTotal] = useState(0); // 总消除行数
  const [combo, setCombo] = useState(-1);           // 连击计数
  const [shakeTrigger, setShakeTrigger] = useState(0); // 震动触发器 (计数器)

  const [nextPiece, setNextPiece] = useState(RANDOM_TETROMINO());

  // 使用 ref 管理定时器以避免闭包过期问题
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // 计算当前下落速度 (毫秒) - 等级越高，速度越快
  // Level 1: 800ms, Level 10: ~350ms, Level 20: ~100ms
  const dropTime = Math.max(100, 800 - (level - 1) * 50);

  // 碰撞检测
  const checkCollision = (
    pos: Position,
    shape: number[][],
    currentBoard: BoardState
  ): boolean => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;

          // 1. 边界检查
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT
          ) {
            return true;
          }

          // 2. 棋盘占用检查
          if (newY >= 0 && currentBoard[newY][newX] !== null) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // 初始化游戏
  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLevel(1);
    setLinesClearedTotal(0);
    setCombo(-1);
    setNextPiece(RANDOM_TETROMINO());
    // 这里不需要传递 board，因为刚清空
    spawnNewPiece(createEmptyBoard()); 
    setGameStatus(GameStatus.PLAYING);
  }, []);

  // 生成新方块
  const spawnNewPiece = useCallback((currentBoard: BoardState) => {
    setNextPiece((prev) => {
        const newActive = {
            position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
            tetromino: prev,
        };
        
        // 检查生成时是否立即碰撞 (游戏结束)
        if (checkCollision(newActive.position, newActive.tetromino.shape, currentBoard)) {
             setGameStatus(GameStatus.GAME_OVER);
             setActivePiece(null);
        } else {
             setActivePiece(newActive);
        }
        return RANDOM_TETROMINO();
    });
  }, []);

  // 锁定方块并消除行
  const lockPiece = (isHardDrop: boolean = false) => {
    if (!activePiece) return;

    // 如果是硬下落，触发震动
    if (isHardDrop) {
        setShakeTrigger(prev => prev + 1);
    }

    const { position, tetromino } = activePiece;
    const newBoard = board.map((row) => [...row]);

    // 放置方块到棋盘
    tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = tetromino.color;
          }
        }
      });
    });

    // 检查并消除行
    let linesCleared = 0;
    const finalBoard = newBoard.reduce((acc, row) => {
      if (row.every((cell) => cell !== null)) {
        linesCleared++;
        acc.unshift(Array(BOARD_WIDTH).fill(null)); // 在顶部添加新空行
      } else {
        acc.push(row);
      }
      return acc;
    }, [] as BoardState);
    
    // 计分与升级逻辑
    if (linesCleared > 0) {
        // 更新连击
        const currentCombo = combo + 1;
        setCombo(currentCombo);

        // 计算分数: 基础分 * 等级 * (连击加成)
        const basePoints = LINE_POINTS[linesCleared] || 0;
        const comboBonus = currentCombo * 50;
        const pointsToAdd = (basePoints * level) + comboBonus;
        
        setScore((s) => s + pointsToAdd);

        // 更新等级 (每10行升一级)
        const newTotalLines = linesClearedTotal + linesCleared;
        setLinesClearedTotal(newTotalLines);
        
        const nextLevel = Math.floor(newTotalLines / 10) + 1;
        if (nextLevel > level) {
            setLevel(nextLevel);
        }
    } else {
        // 如果没有消除，重置连击
        setCombo(-1);
    }

    setBoard(finalBoard);
    spawnNewPiece(finalBoard);
  };

  // 移动逻辑
  const move = (dirX: number, dirY: number) => {
    if (!activePiece || gameStatus !== GameStatus.PLAYING) return;

    const newPos = { x: activePiece.position.x + dirX, y: activePiece.position.y + dirY };

    if (!checkCollision(newPos, activePiece.tetromino.shape, board)) {
      setActivePiece({ ...activePiece, position: newPos });
    } else if (dirY > 0) {
      // 如果向下移动碰撞，则锁定
      lockPiece(false);
    }
  };

  const drop = () => {
    move(0, 1);
  };

  // 硬下落 (直接到底)
  const hardDrop = () => {
    if (!activePiece || gameStatus !== GameStatus.PLAYING) return;
    
    // 计算最终下落位置
    let finalY = activePiece.position.y;
    while (!checkCollision({ x: activePiece.position.x, y: finalY + 1 }, activePiece.tetromino.shape, board)) {
      finalY++;
    }
    
    // 临时更新位置以确保渲染正确（虽然后面立即锁定）
    const finalActivePiece = {
        ...activePiece,
        position: { x: activePiece.position.x, y: finalY }
    };

    // 立即更新棋盘状态 (为了即时响应，这里手动处理而不是调用 lockPiece 避免闭包旧状态)
    // 注意：这里我们为了复用逻辑，稍微Hack一下，实际调用 lockPiece 需要最新的 activePiece 状态
    // 由于 React 状态更新是异步的，我们这里直接模拟 lockPiece 的核心逻辑
    
    const newBoard = board.map(r => [...r]);
    finalActivePiece.tetromino.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val !== 0) {
                if (finalY + y < BOARD_HEIGHT && activePiece.position.x + x < BOARD_WIDTH) {
                    newBoard[finalY + y][activePiece.position.x + x] = activePiece.tetromino.color;
                }
            }
        })
    });

    // 消除行逻辑
    let linesCleared = 0;
    const processedBoard = newBoard.reduce((acc, row) => {
        if (row.every(c => c !== null)) {
            linesCleared++;
            acc.unshift(Array(BOARD_WIDTH).fill(null));
        } else {
            acc.push(row);
        }
        return acc;
    }, [] as BoardState);

    // 触发震动
    setShakeTrigger(prev => prev + 1);

    // 计分逻辑 (复用上面的逻辑，但需要手动计算)
    if (linesCleared > 0) {
        setCombo(c => {
            const newCombo = c + 1;
            const basePoints = LINE_POINTS[linesCleared] || 0;
            const comboBonus = newCombo * 50;
            const pointsToAdd = (basePoints * level) + comboBonus;
            setScore(s => s + pointsToAdd);
            return newCombo;
        });
        
        setLinesClearedTotal(total => {
            const newTotal = total + linesCleared;
            const nextLevel = Math.floor(newTotal / 10) + 1;
            if (nextLevel > level) setLevel(nextLevel);
            return newTotal;
        });
    } else {
        setCombo(-1);
        // 硬下落给予少量额外分数奖励
        setScore(s => s + (finalY - activePiece.position.y) * 2);
    }
    
    setBoard(processedBoard);
    spawnNewPiece(processedBoard);
  };

  const rotate = () => {
    if (!activePiece || gameStatus !== GameStatus.PLAYING) return;

    const shape = activePiece.tetromino.shape;
    // 矩阵旋转
    const newShape = shape[0].map((_, index) =>
      shape.map((row) => row[index]).reverse()
    );

    // 踢墙 (Wall kick) - 如果旋转后位置非法，尝试微调位置
    const newPos = { ...activePiece.position };
    
    if (checkCollision(newPos, newShape, board)) {
        // 尝试左右移动来容纳旋转
        if (!checkCollision({ ...newPos, x: newPos.x - 1 }, newShape, board)) {
            newPos.x -= 1;
        } else if (!checkCollision({ ...newPos, x: newPos.x + 1 }, newShape, board)) {
            newPos.x += 1;
        } else if (!checkCollision({ ...newPos, x: newPos.x - 2 }, newShape, board)) { // 针对 I 型方块
             newPos.x -= 2;
        } else if (!checkCollision({ ...newPos, x: newPos.x + 2 }, newShape, board)) {
             newPos.x += 2;
        } else {
            return; // 无法旋转
        }
    }

    setActivePiece({
      ...activePiece,
      position: newPos,
      tetromino: { ...activePiece.tetromino, shape: newShape },
    });
  };

  // 游戏循环
  useEffect(() => {
    if (gameStatus !== GameStatus.PLAYING) {
      cancelAnimationFrame(requestRef.current!);
      return;
    }

    const loop = (time: number) => {
      if (time - lastTimeRef.current > dropTime) {
        drop();
        lastTimeRef.current = time;
      }
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameStatus, activePiece, board, dropTime]); // dropTime 变化时会重置计时器，这正是我们想要的

  // 键盘输入处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== GameStatus.PLAYING) return;

      switch (e.key) {
        case 'ArrowLeft':
          move(-1, 0);
          break;
        case 'ArrowRight':
          move(1, 0);
          break;
        case 'ArrowDown':
          move(0, 1);
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          e.preventDefault(); // 防止空格键滚动页面
          hardDrop();
          break;
        case 'p':
        case 'P':
          setGameStatus(GameStatus.PAUSED);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, activePiece, board, level]); // 加入 level 依赖

  return {
    board,
    activePiece,
    nextPiece,
    score,
    level,
    combo,
    shakeTrigger,
    gameStatus,
    startGame,
    pauseGame: () => setGameStatus(GameStatus.PAUSED),
    resumeGame: () => setGameStatus(GameStatus.PLAYING),
  };
};