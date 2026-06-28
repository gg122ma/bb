// ============================================================
// 文件：MemoryWall.tsx
// 职责：建筑被点击后弹出的记忆墙面板：
//         - 顶部：建筑信息、统计
//         - 中部：回忆列表（可按年份筛选）
//         - 底部：提交新回忆的表单
//         - 提交成功后通知外部网站（sendToParent）
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, useCampusStore } from '../store/campusStore';
import { sendToParent } from '../hooks/useIframeComm';

// --- 可选 emoji 列表 ---
const EMOJIS = [
  '💛', '😂', '🥹', '❤️', '✨', '🎓', '🏆', '📖',
  '☕', '🌙', '🤝', '💌', '🎮', '🎤', '⚡', '🌟',
  '🍛', '🏸', '🥇', '🌅', '😴', '📝', '🐸', '💡',
];

// --- 可选年份（2016 年至今）---
const YEARS = Array.from({ length: 11 }, (_, i) => String(2015 + i));

interface MemoryWallProps {
  building: Building;
  onClose: () => void;
}

export default function MemoryWall({ building, onClose }: MemoryWallProps) {
  // 从 store 取最新数据（避免只看 props 里的旧数据）
  const { addMemory, buildings } = useCampusStore();
  const currentBuilding = buildings.find((b) => b.id === building.id) || building;

  // --- 表单状态 ---
  const [showForm, setShowForm]     = useState(false);
  const [author, setAuthor]         = useState('');
  const [year, setYear]             = useState('2025');
  const [text, setText]             = useState('');
  const [emoji, setEmoji]           = useState('💛');
  const [submitted, setSubmitted]   = useState(false);

  // --- 年份筛选 ---
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const wallRef = useRef<HTMLDivElement>(null);

  // --- 筛选后的回忆列表 ---
  const filteredMemories = activeFilter
    ? currentBuilding.memories.filter((m) => m.year === activeFilter)
    : currentBuilding.memories;

  // --- 此建筑出现过的年份（去重排序）---
  const uniqueYears = [...new Set(currentBuilding.memories.map((m) => m.year))].sort();

  // --- 提交新回忆 ---
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;

    // 写入 store
    addMemory(building.id, {
      author: author.trim(),
      year,
      text: text.trim(),
      emoji,
    });

    // 通知外部网站：有新回忆被提交
    sendToParent({
      type: 'MEMORY_ADDED',
      buildingId: building.id,
      author: author.trim(),
    });

    // 显示成功动画，2 秒后重置表单
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setAuthor('');
      setText('');
      setEmoji('💛');
    }, 2000);
  }

  // --- 按 Escape 关闭 ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ===== 半透明背景遮罩 ===== */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* ===== 主面板 ===== */}
      <motion.div
        className="relative z-10 w-full max-w-2xl max-h-[92vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10"
        initial={{ y: 100, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 100, scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 250 }}
      >

        {/* ===== 顶部建筑信息区 ===== */}
        <div
          className="relative px-6 pt-6 pb-4 flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${building.color}33, ${building.roofColor}22)`,
          }}
        >
          {/* 顶部彩条（建筑主色） */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-full"
            style={{ background: building.color }}
          />

          {/* 建筑图标 + 名称 + 副标题 */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* 图标背景圆角方块 */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg flex-shrink-0"
                style={{
                  background: `${building.color}44`,
                  border: `2px solid ${building.color}88`,
                }}
              >
                {building.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {building.name}
                </h2>
                <p className="text-sm text-slate-300 mt-0.5">{building.subtitle}</p>
              </div>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all text-xl flex-shrink-0 mt-1"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          {/* 建筑描述（斜体） */}
          <p className="mt-3 text-sm text-slate-300 leading-relaxed italic">
            "{building.description}"
          </p>

          {/* 统计标签：回忆数 + 年份跨度 */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-white font-medium">
              💬 {currentBuilding.memories.length} kenangan
            </div>
            {uniqueYears.length > 0 && (
              <div className="px-3 py-1.5 rounded-full bg-white/10 text-xs text-white font-medium">
                📅 {uniqueYears[0]} – {uniqueYears[uniqueYears.length - 1]}
              </div>
            )}
          </div>
        </div>

        {/* ===== 年份筛选器（超过 1 个年份才显示）===== */}
        {uniqueYears.length > 1 && (
          <div className="px-6 py-3 flex gap-2 flex-wrap border-b border-white/5 flex-shrink-0">
            {/* 全部 */}
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                !activeFilter
                  ? 'bg-white text-slate-900'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Semua
            </button>
            {/* 各年份 */}
            {uniqueYears.map((y) => (
              <button
                key={y}
                onClick={() => setActiveFilter(activeFilter === y ? null : y)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeFilter === y
                    ? 'text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
                style={activeFilter === y ? { background: building.color } : {}}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {/* ===== 回忆列表（可滚动）===== */}
        <div
          ref={wallRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {filteredMemories.length === 0 ? (
              // 空状态
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-slate-400"
              >
                <div className="text-5xl mb-3">🌟</div>
                <p className="font-medium text-white">Tiada kenangan lagi</p>
                <p className="text-sm mt-1">Jadilah yang pertama tinggalkan kenangan di sini!</p>
              </motion.div>
            ) : (
              // 回忆卡片列表
              filteredMemories.map((memory, idx) => (
                <motion.div
                  key={memory.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04, type: 'spring', damping: 20 }}
                  className="group relative bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 rounded-2xl p-4 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Emoji 图标背景 */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
                      style={{ background: `${building.color}33` }}
                    >
                      {memory.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* 回忆正文 */}
                      <p className="text-slate-100 text-sm leading-relaxed">
                        {memory.text}
                      </p>
                      {/* 署名 + 年份 */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${building.color}33`,
                            color: building.color,
                          }}
                        >
                          {memory.author}
                        </span>
                        <span className="text-xs text-slate-500">
                          Lepasan {memory.year}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ===== 底部：提交回忆区 ===== */}
        <div className="flex-shrink-0 border-t border-white/10 px-6 py-4">
          <AnimatePresence mode="wait">

            {/* 状态 A：按钮（未打开表单）*/}
            {!showForm ? (
              <motion.button
                key="btn"
                onClick={() => setShowForm(true)}
                className="w-full py-3 rounded-2xl font-semibold text-white text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${building.color}, ${building.roofColor})`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ boxShadow: `0 0 20px ${building.color}88` }}
              >
                ✍️ Tinggalkan Kenangan Anda
              </motion.button>

            ) : submitted ? (
              // 状态 B：提交成功动画
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-white font-semibold">Kenangan berjaya ditambah!</p>
                <p className="text-slate-400 text-sm mt-1">
                  Pelajar masa depan akan jumpa cerita anda di sini.
                </p>
              </motion.div>

            ) : (
              // 状态 C：提交表单
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-3"
              >
                {/* 第一行：姓名 + 年份 */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Nama anda"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    maxLength={30}
                    className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/15 transition-all"
                    required
                  />
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y} className="bg-slate-800">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 第二行：回忆内容 */}
                <textarea
                  placeholder="Kongsikan kenangan anda di sini… apa yang menjadikan tempat ini istimewa?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={300}
                  rows={3}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/15 transition-all resize-none"
                  required
                />

                {/* 第三行：Emoji 选择 */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Pilih emoji:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEmoji(em)}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                          emoji === em
                            ? 'scale-110'
                            : 'bg-white/5 hover:bg-white/15'
                        }`}
                        style={
                          emoji === em
                            ? {
                                background: `${building.color}44`,
                                outline: `2px solid ${building.color}`,
                              }
                            : {}
                        }
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 第四行：取消 + 提交 */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 text-sm font-medium transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${building.color}, ${building.roofColor})`,
                    }}
                  >
                    Hantar Kenangan 💛
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
