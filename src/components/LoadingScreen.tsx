// ============================================================
// 文件：LoadingScreen.tsx
// 职责：首次进入时的 KMK 主题加载界面
//         - 显示 2.2 秒
//         - 进度条动画
//         - 校园相关 emoji 弹跳动画
// ============================================================

import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* KMK 图标（弹跳动画） */}
      <motion.div
        className="text-7xl mb-6"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        🏫
      </motion.div>

      {/* 标题 */}
      <motion.h1
        className="text-2xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Peta Kenangan KMK
      </motion.h1>

      {/* 副标题 */}
      <motion.p
        className="text-slate-400 text-sm mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        Kolej Matrikulasi Kedah
      </motion.p>

      {/* 说明文字 */}
      <motion.p
        className="text-slate-500 text-xs mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        Memuatkan kampus dan kenangan…
      </motion.p>

      {/* 进度条 */}
      <motion.div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(to right, #3b82f6, #6366f1)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* KMK 校园生活 emoji 弹跳排列 */}
      <motion.div
        className="flex gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {['🍛', '📚', '🎓', '🕌', '⚽', '🏸', '🏠', '🔬'].map((emoji, i) => (
          <motion.span
            key={i}
            className="text-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>

      {/* 底部版权 */}
      <motion.p
        className="absolute bottom-6 text-slate-600 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        Changlun, Kedah · KMK Heritage Map
      </motion.p>
    </motion.div>
  );
}
