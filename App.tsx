import React from 'react';
import { useTetris } from './hooks/useTetris';
import Scene from './components/Scene';
import { GameStatus, Tetromino } from './types';
import { Play, RotateCcw, Pause, Square, Zap } from 'lucide-react';

// 用于在 2D UI 中渲染下一个方块的小组件
const NextPiecePreview: React.FC<{ piece: Tetromino }> = ({ piece }) => {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)` }}>
      {piece.shape.map((row, r) =>
        row.map((val, c) => (
          <div
            key={`${r}-${c}`}
            className={`w-4 h-4 rounded-sm ${val ? '' : 'opacity-0'}`}
            style={{ backgroundColor: val ? piece.color : 'transparent' }}
          />
        ))
      )}
    </div>
  );
};

export default function App() {
  const {
    board,
    activePiece,
    nextPiece,
    score,
    level,
    combo,
    shakeTrigger,
    gameStatus,
    startGame,
    pauseGame,
    resumeGame,
  } = useTetris();

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      
      {/* 3D 场景层 */}
      <div className="absolute inset-0 z-0">
        <Scene board={board} activePiece={activePiece} shakeTrigger={shakeTrigger} />
      </div>

      {/* UI 层 */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        
        {/* 左侧 HUD：分数和下一个方块 */}
        <div className="absolute top-10 left-10 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-6 rounded-xl border border-slate-700 shadow-2xl text-white w-48 hidden md:block transition-all duration-300 hover:border-cyan-500/50">
          <h1 className="text-2xl font-black text-cyan-400 mb-4 tracking-tighter flex items-center gap-2">
            NEO-TRIS
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"/>
          </h1>
          
          <div className="mb-6">
            <div className="flex justify-between items-end mb-1">
                 <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">分数</p>
                 {combo > 0 && (
                    <span className="text-xs font-bold text-yellow-400 animate-bounce flex items-center">
                        <Zap size={12} className="mr-1"/> {combo} COMBO
                    </span>
                 )}
            </div>
            <p className="text-3xl font-mono text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {score.toString().padStart(6, '0')}
            </p>
          </div>

          <div className="mb-6 flex justify-between items-center">
             <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">等级</p>
                <p className="text-2xl font-mono text-cyan-300">{level}</p>
             </div>
             <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">速度</p>
                {/* 简单的速度条展示 */}
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1 h-3 rounded-full ${i < Math.ceil(level/2) ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                    ))}
                </div>
             </div>
          </div>

          <div className="mb-6">
             <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">下一个</p>
             <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-center min-h-[80px] border border-slate-700 shadow-inner">
                <NextPiecePreview piece={nextPiece} />
             </div>
          </div>

          <div className="text-[10px] text-slate-500 space-y-1">
             <p className="flex items-center gap-2"><span className="w-4 h-4 border border-slate-600 rounded flex items-center justify-center text-[8px]">←</span> 移动/旋转</p>
             <p className="flex items-center gap-2"><span className="w-12 h-4 border border-slate-600 rounded flex items-center justify-center text-[8px]">SPACE</span> 硬下落</p>
             <p className="flex items-center gap-2"><span className="w-4 h-4 border border-slate-600 rounded flex items-center justify-center text-[8px]">P</span> 暂停</p>
          </div>
        </div>

        {/* 移动端/小屏幕 头部 (简化版) */}
        <div className="md:hidden absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
            <div className="bg-slate-900/80 p-2 rounded text-white flex gap-4 border border-slate-700">
                <div>
                    <span className="text-[10px] text-slate-400 block">SCORE</span>
                    <span className="font-mono font-bold">{score}</span>
                </div>
                <div>
                    <span className="text-[10px] text-slate-400 block">LVL</span>
                    <span className="font-mono font-bold text-cyan-400">{level}</span>
                </div>
            </div>
             {gameStatus === GameStatus.PLAYING && (
                 <button onClick={pauseGame} className="bg-slate-800 p-2 rounded text-white border border-slate-700 active:scale-95 transition-transform">
                    <Pause size={20} />
                 </button>
             )}
        </div>

        {/* 开始 / 游戏结束 遮罩层 */}
        {gameStatus !== GameStatus.PLAYING && (
          <div className="bg-black/70 backdrop-blur-md absolute inset-0 flex items-center justify-center pointer-events-auto z-50">
            <div className="bg-slate-900 p-8 rounded-2xl border-2 border-cyan-500 shadow-[0_0_60px_rgba(6,182,212,0.4)] text-center max-w-sm w-full mx-4 transform transition-all animate-in fade-in zoom-in duration-300">
              
              {gameStatus === GameStatus.MENU && (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg ring-4 ring-cyan-500/20">
                     <Square size={40} color="white" fill="white" fillOpacity={0.2} />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tight">NEO TETRIS</h2>
                  <p className="text-cyan-400/80 mb-8 font-medium tracking-wide text-sm">3D ARCADE EXPERIENCE</p>
                  <button
                    onClick={startGame}
                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-lg rounded-xl transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-1"
                  >
                    <Play size={24} className="group-hover:scale-110 transition-transform" fill="currentColor" />
                    START GAME
                  </button>
                </>
              )}

              {gameStatus === GameStatus.PAUSED && (
                 <>
                   <h2 className="text-3xl font-bold text-white mb-6 tracking-widest">PAUSED</h2>
                   <button
                     onClick={resumeGame}
                     className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg mb-3 transition-colors shadow-lg"
                   >
                     RESUME
                   </button>
                   <button
                     onClick={startGame}
                     className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                   >
                     RESTART
                   </button>
                 </>
              )}

              {gameStatus === GameStatus.GAME_OVER && (
                <>
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-orange-500 mb-2">GAME OVER</h2>
                  
                  <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <p className="text-xs text-slate-400">SCORE</p>
                              <span className="text-white font-mono text-xl">{score}</span>
                          </div>
                          <div>
                              <p className="text-xs text-slate-400">LEVEL</p>
                              <span className="text-cyan-400 font-mono text-xl">{level}</span>
                          </div>
                      </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <RotateCcw size={24} />
                    TRY AGAIN
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}