import React, { useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Stars, Environment, CameraShake } from '@react-three/drei';
import { ActivePiece, BoardState } from '../types';
import { BOARD_HEIGHT, BOARD_WIDTH, COLORS } from '../constants';
import * as THREE from 'three';

// 3D 布局常量
const CELL_SIZE = 1;
const GAP = 0.05;
const BOARD_OFFSET_X = -(BOARD_WIDTH * CELL_SIZE) / 2 + CELL_SIZE / 2;
const BOARD_OFFSET_Y = (BOARD_HEIGHT * CELL_SIZE) / 2 - CELL_SIZE / 2;

// --- 辅助组件 ---

interface CellProps {
  x: number;
  y: number;
  color: string;
  opacity?: number;
  isGhost?: boolean;
}

const Cell: React.FC<CellProps> = ({ x, y, color, opacity = 1, isGhost = false }) => {
  const posX = BOARD_OFFSET_X + x * CELL_SIZE;
  const posY = BOARD_OFFSET_Y - y * CELL_SIZE;

  return (
    <RoundedBox
      args={[CELL_SIZE - GAP, CELL_SIZE - GAP, CELL_SIZE - GAP]}
      radius={0.1}
      smoothness={4}
      position={[posX, posY, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        emissive={color}
        emissiveIntensity={isGhost ? 0.2 : 0.5}
        roughness={0.1}
        metalness={0.5}
      />
    </RoundedBox>
  );
};

interface GridBackdropProps {
    width: number;
    height: number;
}

const GridBackdrop: React.FC<GridBackdropProps> = ({ width, height }) => {
    const w = width * CELL_SIZE;
    const h = height * CELL_SIZE;
    
    return (
        <group position={[0, 0, 0]}>
            <mesh position={[0, 0, -0.6]} receiveShadow>
                <planeGeometry args={[w + 2, h + 2]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
            </mesh>
            <lineSegments position={[0,0,0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(w, h, CELL_SIZE)]} />
                <lineBasicMaterial color="#334155" linewidth={2} />
            </lineSegments>
        </group>
    );
}

// --- 主场景组件 ---

interface GameSceneProps {
  board: BoardState;
  activePiece: ActivePiece | null;
}

const GameScene: React.FC<GameSceneProps> = ({ board, activePiece }) => {
  
  // 计算幽灵方块位置
  const ghostPosition = useMemo(() => {
    if (!activePiece) return null;
    
    const { tetromino, position } = activePiece;
    let ghostY = position.y;
    
    let collided = false;
    while (!collided) {
        ghostY++;
        for (let r = 0; r < tetromino.shape.length; r++) {
            for (let c = 0; c < tetromino.shape[r].length; c++) {
                if (tetromino.shape[r][c] !== 0) {
                    const nextY = ghostY + r;
                    const nextX = position.x + c;
                     if (
                        nextY >= BOARD_HEIGHT ||
                        (nextY >= 0 && board[nextY][nextX] !== null)
                      ) {
                        collided = true;
                      }
                }
            }
        }
        if (collided) {
            ghostY--; // 回退一步
            break;
        }
    }
    return { x: position.x, y: ghostY };
  }, [activePiece, board]);


  return (
    <>
      <GridBackdrop width={BOARD_WIDTH} height={BOARD_HEIGHT} />

      {/* 渲染静态棋盘 */}
      {board.map((row, y) =>
        row.map((color, x) =>
          color ? <Cell key={`${x}-${y}`} x={x} y={y} color={color} /> : null
        )
      )}

      {/* 渲染幽灵方块 */}
      {activePiece && ghostPosition && (
          <group>
              {activePiece.tetromino.shape.map((row, r) =>
                row.map((val, c) => {
                    if (val === 0) return null;
                    return (
                        <Cell 
                            key={`ghost-${r}-${c}`}
                            x={ghostPosition.x + c}
                            y={ghostPosition.y + r}
                            color={COLORS.Ghost}
                            opacity={0.2}
                            isGhost
                        />
                    )
                })
              )}
          </group>
      )}

      {/* 渲染活动方块 */}
      {activePiece && (
        <group>
          {activePiece.tetromino.shape.map((row, r) =>
            row.map((val, c) => {
              if (val === 0) return null;
              return (
                <Cell
                  key={`active-${r}-${c}`}
                  x={activePiece.position.x + c}
                  y={activePiece.position.y + r}
                  color={activePiece.tetromino.color}
                />
              );
            })
          )}
        </group>
      )}
    </>
  );
};

interface SceneProps {
    board: BoardState;
    activePiece: ActivePiece | null;
    shakeTrigger: number;
}

export default function Scene({ board, activePiece, shakeTrigger }: SceneProps) {
  const [shakeIntensity, setShakeIntensity] = useState(0);

  // 监听 shakeTrigger 变化，触发短暂震动
  useEffect(() => {
    if (shakeTrigger > 0) {
        setShakeIntensity(1); // 设置高强度
        const timer = setTimeout(() => setShakeIntensity(0), 200); // 200ms 后停止
        return () => clearTimeout(timer);
    }
  }, [shakeTrigger]);

  return (
    <Canvas shadows camera={{ position: [0, 0, 22], fov: 50 }}>
      <color attach="background" args={['#020617']} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, -10, 10]} intensity={0.5} color="blue" />
      
      <Environment preset="city" />

      <GameScene board={board} activePiece={activePiece} />
      
      {/* 相机震动控制器 */}
      <CameraShake 
        maxYaw={0.05 * shakeIntensity} 
        maxPitch={0.05 * shakeIntensity} 
        maxRoll={0.05 * shakeIntensity} 
        yawFrequency={0.5 * shakeIntensity} 
        pitchFrequency={0.5 * shakeIntensity} 
        rollFrequency={0.5 * shakeIntensity}
        intensity={shakeIntensity}
        decay={true}
        decayRate={0.65}
      />

      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.5}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        enableZoom={false}
      />
    </Canvas>
  );
}