// ============================================================
// 文件：App.tsx
// 职责：顶层组件，负责组合所有层次：
//         - 3D Canvas（Three.js 场景）
//         - HUD（UI 覆盖层）
//         - MemoryWall（记忆墙弹窗）
//         - LoadingScreen（加载界面）
//         - useIframeComm（postMessage 通信）
// ============================================================

import { Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import { useCampusStore, Building } from './store/campusStore';
import { useIframeComm, sendToParent } from './hooks/useIframeComm';
import CampusScene from './components/CampusScene';
import MemoryWall from './components/MemoryWall';
import HUD from './components/HUD';
import LoadingScreen from './components/LoadingScreen';

// ------------------------------------------------------------
// 内部子组件：通信初始化
// 必须在 Zustand Provider 内部调用，所以单独拆一个组件
// ------------------------------------------------------------
function IframeCommInit() {
  // 这里调用通信 Hook，全局只需一次
  useIframeComm();
  return null; // 不渲染任何 UI
}

// ------------------------------------------------------------
// 主组件：App
// ------------------------------------------------------------
function App() {
  const {
    selectedBuilding,
    showMemoryWall,
    isZooming,
    setSelectedBuilding,
    setShowMemoryWall,
  } = useCampusStore();

  // 加载状态：显示 2.2 秒加载界面后进入场景
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // --- 用户点击建筑 ---
  // 触发镜头飞行动画，并通知外部网站
  const handleBuildingSelect = useCallback(
    (building: Building) => {
      setSelectedBuilding(building);
      setShowMemoryWall(false);

      // 通知外部网站：用户点击了某栋建筑
      sendToParent({
        type: 'BUILDING_CLICKED',
        buildingId: building.id,
        buildingName: building.name,
      });
    },
    [setSelectedBuilding, setShowMemoryWall]
  );

  // --- 用户点击"返回地图" ---
  const handleBack = useCallback(() => {
    setShowMemoryWall(false);
    setSelectedBuilding(null);

    // 通知外部网站：记忆墙已关闭
    sendToParent({ type: 'MEMORY_WALL_CLOSED' });
  }, [setSelectedBuilding, setShowMemoryWall]);

  // --- 用户关闭记忆墙（点击背景或 ✕ 按钮）---
  const handleCloseMemory = useCallback(() => {
    handleBack();
  }, [handleBack]);

  // --- 记忆墙打开时通知外部网站 ---
  // showMemoryWall 变为 true 时触发
  useEffect(() => {
    if (showMemoryWall && selectedBuilding) {
      sendToParent({
        type: 'MEMORY_WALL_OPENED',
        buildingId: selectedBuilding.id,
        buildingName: selectedBuilding.name,
      });
    }
  }, [showMemoryWall, selectedBuilding]);

  return (
    <div className="w-screen h-screen bg-slate-950 overflow-hidden relative">

      {/* ---- 通信初始化（不渲染 UI）---- */}
      <IframeCommInit />

      {/* ---- 加载界面（2.2 秒后淡出）---- */}
      <AnimatePresence>
        {loading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      {/* ---- 3D Canvas（Three.js 场景）---- */}
      {/* 只有加载完成后才渲染，减少首帧压力 */}
      {!loading && (
        <Canvas
          shadows
          camera={{ position: [0, 12, 16], fov: 52, near: 0.1, far: 300 }}
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
        >
          <Suspense fallback={null}>
            <CampusScene onBuildingSelect={handleBuildingSelect} />
          </Suspense>
        </Canvas>
      )}

      {/* ---- HUD 覆盖层（标题栏、图例、提示）---- */}
      {!loading && <HUD onBack={handleBack} />}

      {/* ---- 记忆墙弹窗 ---- */}
      {/* AnimatePresence 确保关闭时有淡出动画 */}
      <AnimatePresence>
        {showMemoryWall && selectedBuilding && (
          <MemoryWall
            key={selectedBuilding.id}
            building={selectedBuilding}
            onClose={handleCloseMemory}
          />
        )}
      </AnimatePresence>

      {/* ---- 镜头飞行中提示 ---- */}
      {/* 当镜头正在动画飞行时，显示"正在前往…"提示 */}
      <AnimatePresence>
        {isZooming && !showMemoryWall && selectedBuilding && (
          <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-slate-900/70 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3 text-white text-sm font-medium">
              📍 Menuju ke {selectedBuilding.name}…
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
