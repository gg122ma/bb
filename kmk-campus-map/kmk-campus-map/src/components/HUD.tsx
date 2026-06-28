// ============================================================
// 文件：HUD.tsx
// 职责：渲染 Canvas 上方的 HTML UI 覆盖层：
//         - 顶部栏（KMK 标题 + 总回忆数）
//         - "返回地图"按钮（选中建筑时显示）
//         - 底部操作提示（如何旋转/缩放）
//         - 右下角建筑图例
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { useCampusStore } from '../store/campusStore';

interface HUDProps {
  onBack: () => void; // 点击"返回"按钮的回调
}

export default function HUD({ onBack }: HUDProps) {
  const { selectedBuilding, buildings } = useCampusStore();

  // 统计所有建筑的回忆总数
  const totalMemories = buildings.reduce((acc, b) => acc + b.memories.length, 0);

  return (
    <>
      {/* ===== 顶部栏 ===== */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-4 pb-2 pointer-events-none">

        {/* --- KMK 标题徽章 --- */}
        <motion.div
          className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 shadow-xl"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        >
          {/* KMK Logo 区域 */}
          <span className="text-2xl">🏫</span>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">
              Peta Kenangan KMK
            </h1>
            <p className="text-slate-400 text-xs">
              {totalMemories} kenangan · {buildings.length} lokasi
            </p>
          </div>
        </motion.div>

        {/* --- 返回按钮（只有选中建筑时才显示）--- */}
        <AnimatePresence>
          {selectedBuilding && (
            <motion.button
              onClick={onBack}
              className="pointer-events-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white rounded-2xl px-4 py-2.5 text-sm font-medium transition-all shadow-xl"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              ← Kembali ke Peta
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ===== 底部操作提示（没有选中建筑时才显示）===== */}
      <AnimatePresence>
        {!selectedBuilding && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ delay: 1, type: 'spring', damping: 20 }}
          >
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 text-xs text-slate-300 flex items-center gap-2 shadow-xl">
              <span className="animate-bounce">👆</span>
              Klik bangunan untuk lihat kenangan · Seret untuk pusing · Skrol untuk zum
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 右下角建筑图例（没有选中建筑时显示）===== */}
      <AnimatePresence>
        {!selectedBuilding && (
          <motion.div
            className="fixed bottom-20 right-4 z-30 pointer-events-none"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ delay: 0.5, type: 'spring', damping: 20 }}
          >
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar">
              {/* 标题 */}
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                Lokasi
              </p>
              {/* 每栋建筑一行：色块 + 名称 + 回忆数 */}
              {buildings.map((b) => (
                <div key={b.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ background: b.color }}
                  />
                  <span className="text-xs text-slate-300 truncate max-w-[140px]">
                    {b.emoji} {b.name}
                  </span>
                  <span className="text-xs text-slate-500 ml-auto pl-2 flex-shrink-0">
                    💬{b.memories.length}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
