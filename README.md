# Neon 3D Tetris (霓虹 3D 俄罗斯方块)

这是一个使用 React、TypeScript 和 React Three Fiber 构建的现代网页版 3D 俄罗斯方块游戏。它结合了经典的玩法与现代的 3D 视觉效果。

## 🎮 游戏特色

*   **沉浸式 3D 体验**: 使用 Three.js 和 React Three Fiber 渲染的高质量 3D 场景。
*   **动态光影**: 霓虹风格的视觉设计，带有辉光和环境光遮蔽效果。
*   **进阶游戏机制**:
    *   **等级系统 (Level System)**: 每消除 10 行升级一次，随着等级提升，方块下落速度加快，挑战反应极限。
    *   **连击系统 (Combo System)**: 连续多次消除行数会触发 Combo 奖励，分数成倍增加。
    *   **打击感反馈 (Juice)**: 使用空格键硬下落时触发屏幕震动效果 (Camera Shake)，增加游戏打击感。
*   **辅助功能**: 幽灵方块（Ghost Piece）显示落点预测，帮助精确放置。
*   **响应式 UI**: 适配桌面端和移动端布局。

## 🕹️ 操作说明

| 按键 | 动作 |
| --- | --- |
| **← / →** | 左右移动方块 |
| **↓** | 加速下落 (软下落) |
| **↑** | 旋转方块 |
| **空格 (Space)** | 硬下落 (直接到底并锁定) |
| **P** | 暂停/继续游戏 |

## 🛠️ 技术栈

*   **前端框架**: React 19
*   **语言**: TypeScript
*   **3D 引擎**: @react-three/fiber, @react-three/drei, Three.js
*   **样式**: Tailwind CSS
*   **图标**: Lucide React

## 📝 核心文件说明

*   `hooks/useTetris.ts`: 游戏核心逻辑引擎。处理状态管理、碰撞检测、消行算法、等级计算及游戏循环。
*   `components/Scene.tsx`: 3D 渲染层。负责将游戏状态转换为 Three.js 场景元素，包含方块渲染、光照和摄像机震动效果。
*   `App.tsx`: 应用入口与 UI 层。处理 HUD（抬头显示）、游戏菜单和用户交互界面。
*   `constants.ts`: 定义方块形状 (SRS系统)、颜色配置和游戏常量。
