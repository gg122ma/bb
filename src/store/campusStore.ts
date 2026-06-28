// ============================================================
// 文件：campusStore.ts
// 职责：KMK 校园所有数据（24 栋建筑）+ 全局 UI 状态管理
// 使用：所有组件通过 useCampusStore() 读取/修改状态
// 技术：Zustand（轻量状态管理库）
// ============================================================

import { create } from 'zustand';

// ------------------------------------------------------------
// 数据类型定义
// ------------------------------------------------------------

/** 单条回忆 */
export interface Memory {
  id: string;        // 唯一 ID（随机生成）
  author: string;    // 留言者名字
  year: string;      // 就读年份（如 "2023"）
  text: string;      // 回忆内容
  emoji: string;     // 选择的表情
  timestamp: number; // 创建时间戳
}

/** 单栋建筑 */
export interface Building {
  id: string;                          // 唯一英文 ID（如 'asrama-a1'）
  name: string;                        // 显示名称（马来文）
  subtitle: string;                    // 副标题（一句话描述）
  position: [number, number, number];  // Three.js 世界坐标 [x, y, z]
  size: [number, number, number];      // 建筑尺寸 [宽, 高, 深]（Three.js 单位）
  color: string;                       // 建筑主色（hex 格式）
  roofColor: string;                   // 屋顶颜色（hex 格式）
  emoji: string;                       // 建筑图标（显示在 3D 场景上方）
  description: string;                 // 建筑简介（显示在记忆墙顶部）
  memories: Memory[];                  // 该建筑的回忆列表
}

/** 全局 Store 结构 */
interface CampusStore {
  // --- 数据 ---
  buildings: Building[];               // 所有 24 栋建筑

  // --- UI 状态 ---
  selectedBuilding: Building | null;   // 当前选中的建筑（null = 没有选中）
  isZooming: boolean;                  // 镜头正在动画中（防止重复点击）
  showMemoryWall: boolean;             // 是否显示记忆墙面板

  // --- 操作方法 ---
  setSelectedBuilding: (building: Building | null) => void;
  setIsZooming: (v: boolean) => void;
  setShowMemoryWall: (v: boolean) => void;
  addMemory: (buildingId: string, memory: Omit<Memory, 'id' | 'timestamp'>) => void;
}

// ------------------------------------------------------------
// 初始建筑数据（24 栋 KMK 真实建筑）
// 坐标系说明：
//   x 轴 = 东西方向（正 = 东）
//   z 轴 = 南北方向（正 = 南，即靠近屏幕）
//   y 轴 = 高度（建筑从 y=0 向上生长）
// ------------------------------------------------------------

const initialBuildings: Building[] = [

  // ==========================================================
  // 分组 A：宿舍区（Asrama）
  // 位置：场景南部（z 值较大）
  // 色系：橙色系（温暖、家的感觉）
  // ==========================================================

  {
    id: 'asrama-a1',
    name: 'Asrama A1 — Seri Palas',
    subtitle: '男生宿舍 · 一区',
    position: [-6.5, 0, 5.5],
    size: [2.2, 2.4, 2.0],
    color: '#f97316',    // 橙色
    roofColor: '#ea580c',
    emoji: '🏠',
    description: 'Blok lelaki pertama di KMK. Rumah kedua untuk ramai pelajar.',
    memories: [
      {
        id: 'a1-1',
        author: 'Hafiz M.',
        year: '2022',
        text: 'Bilik A1T2-15, kawan sebilik aku dah jadi doktor sekarang. Masa berlalu laju gila.',
        emoji: '🌟',
        timestamp: 1,
      },
      {
        id: 'a1-2',
        author: 'Daniel K.',
        year: '2023',
        text: 'Lepak koridor sampai pukul 2 pagi buat revision. Lepas tu tidur terus masa exam 😂',
        emoji: '😂',
        timestamp: 2,
      },
    ],
  },

  {
    id: 'asrama-a2',
    name: 'Asrama A2 — Seri Palas',
    subtitle: '男生宿舍 · 二区',
    position: [-4.0, 0, 5.5],
    size: [2.2, 2.4, 2.0],
    color: '#fb923c',    // 浅橙
    roofColor: '#f97316',
    emoji: '🏠',
    description: 'Blok A2, Seri Palas — tempat kenangan malam-malam panjang.',
    memories: [
      {
        id: 'a2-1',
        author: 'Aiman S.',
        year: '2021',
        text: 'Malam sebelum peperiksaan, satu blok buat study group. Bunyi menaip keyboard sampai subuh.',
        emoji: '💻',
        timestamp: 3,
      },
    ],
  },

  {
    id: 'asrama-b1',
    name: 'Asrama B1 — Seri Temin',
    subtitle: '女生宿舍 · 一区',
    position: [3.5, 0, 5.5],
    size: [2.2, 2.4, 2.0],
    color: '#f59e0b',    // 琥珀色
    roofColor: '#d97706',
    emoji: '🏠',
    description: 'Blok perempuan B1, Seri Temin — penuh dengan cerita dan gelak tawa.',
    memories: [
      {
        id: 'b1-1',
        author: 'Nurul A.',
        year: '2022',
        text: 'Ramai yang takut kucing naik atas, tapi kami dah biasa. Kucing tu macam maskot blok dah! 🐱',
        emoji: '😹',
        timestamp: 4,
      },
      {
        id: 'b1-2',
        author: 'Xinyi L.',
        year: '2023',
        text: 'Dobby penuh selalu, tapi bila dapat machine kosong rasa macam menang loteri 😭',
        emoji: '🥹',
        timestamp: 5,
      },
    ],
  },

  {
    id: 'asrama-b2',
    name: 'Asrama B2 — Seri Temin',
    subtitle: '女生宿舍 · 二区',
    position: [6.0, 0, 5.5],
    size: [2.2, 2.4, 2.0],
    color: '#fbbf24',    // 金黄
    roofColor: '#f59e0b',
    emoji: '🏠',
    description: 'Blok perempuan B2 — tempat berkongsi cerita dan sokongan antara satu sama lain.',
    memories: [
      {
        id: 'b2-1',
        author: 'Priya R.',
        year: '2022',
        text: 'Kawan sebilik aku yang tolong aku bila aku nangis malam-malam. Sampai sekarang still kawan rapat.',
        emoji: '💛',
        timestamp: 6,
      },
    ],
  },

  {
    id: 'asrama-c2',
    name: 'Asrama C2 — Seri Laka',
    subtitle: '女生宿舍 · C区',
    position: [0.5, 0, 7.0],
    size: [2.4, 2.2, 2.0],
    color: '#d97706',    // 深琥珀
    roofColor: '#b45309',
    emoji: '🏠',
    description: 'Blok C2, Seri Laka — tempat wanita-wanita hebat membesar.',
    memories: [
      {
        id: 'c2-1',
        author: 'Siti H.',
        year: '2023',
        text: 'Cafe C dekat je dengan blok kita. Nasi ayam panas pagi-pagi — itulah motivasi bangun awal! 🍗',
        emoji: '🍗',
        timestamp: 7,
      },
    ],
  },

  {
    id: 'asrama-p5',
    name: 'Asrama P5',
    subtitle: '女生宿舍 · P5',
    position: [3.0, 0, 7.0],
    size: [2.0, 2.0, 2.0],
    color: '#b45309',    // 棕橙
    roofColor: '#92400e',
    emoji: '🏠',
    description: 'Blok P5 — komuniti kecil yang rapat dan saling menyokong.',
    memories: [
      {
        id: 'p5-1',
        author: 'Mei Ling T.',
        year: '2024',
        text: 'Blok paling kecil tapi semangat paling besar. Kami selalu menang decorating contest! ✨',
        emoji: '✨',
        timestamp: 8,
      },
    ],
  },

  // ==========================================================
  // 分组 B：食堂区（Kafeteria）
  // 位置：分散在宿舍旁 + 行政区旁
  // 色系：红色系（食物、活力）
  // ==========================================================

  {
    id: 'cafe-admin',
    name: 'Cafe Admin',
    subtitle: '行政区食堂 · 周一至五营业',
    position: [1.2, 0, 0.5],
    size: [2.6, 1.0, 2.2],
    color: '#ef4444',    // 红色
    roofColor: '#dc2626',
    emoji: '🍛',
    description: 'Cafe sebelah serambi pentadbiran. Buka 8am–4pm, tutup hujung minggu. Ketuk-ketuk dan ayam gunting mesti cuba!',
    memories: [
      {
        id: 'cafe-admin-1',
        author: 'Razif A.',
        year: '2022',
        text: 'Ketuk-ketuk Cafe Admin — sesiapa yang tak pernah cuba, rugi besar. Rasa dia tak boleh lupa sampai bila-bila.',
        emoji: '🍜',
        timestamp: 9,
      },
      {
        id: 'cafe-admin-2',
        author: 'Sarah J.',
        year: '2023',
        text: 'Breakfast sambil tengok matahari terbit depan serambi. Momen yang aku rindu sangat sekarang.',
        emoji: '🌅',
        timestamp: 10,
      },
    ],
  },

  {
    id: 'cafe-a',
    name: 'Cafe A',
    subtitle: '男生宿舍旁食堂',
    position: [-5.5, 0, 4.0],
    size: [1.8, 0.9, 1.8],
    color: '#f87171',    // 浅红
    roofColor: '#ef4444',
    emoji: '🍜',
    description: 'Cafe di kawasan Blok A. Buka 7am–10pm setiap hari. Perempuan boleh ke sini tapi balik sebelum 7pm.',
    memories: [
      {
        id: 'cafe-a-1',
        author: 'Arif Z.',
        year: '2022',
        text: 'Sarapan pagi sebelum kelas jam 8 — air teh tarik panas, tu je cukup bagi aku semangat.',
        emoji: '☕',
        timestamp: 11,
      },
    ],
  },

  {
    id: 'cafe-b',
    name: 'Cafe B',
    subtitle: '女生宿舍旁食堂 · Sizzling & Waffle 出名',
    position: [5.0, 0, 4.0],
    size: [1.8, 0.9, 1.8],
    color: '#fca5a5',    // 粉红
    roofColor: '#f87171',
    emoji: '🧇',
    description: 'Cafe di kawasan Blok B. Sizzling dan waffle sangat popular di sini! Lelaki balik sebelum 7pm.',
    memories: [
      {
        id: 'cafe-b-1',
        author: 'Aina R.',
        year: '2023',
        text: 'Sizzling Cafe B setiap malam Jumaat jadi tradisi. Kitorang order sama sampai hafal number meja 😂',
        emoji: '🥩',
        timestamp: 12,
      },
      {
        id: 'cafe-b-2',
        author: 'Jess L.',
        year: '2024',
        text: 'Waffle dengan strawberry sauce — RM4 je tapi rasa macam fine dining. Best gila.',
        emoji: '🧇',
        timestamp: 13,
      },
    ],
  },

  {
    id: 'cafe-c',
    name: 'Cafe C',
    subtitle: '女生宿舍旁食堂 · 热食 & 鸡饭出名',
    position: [1.8, 0, 6.5],
    size: [1.8, 0.9, 1.8],
    color: '#fecaca',    // 更浅的粉红
    roofColor: '#fca5a5',
    emoji: '🍗',
    description: 'Cafe di kawasan Blok C. Masakan panas dan nasi ayam sangat popular. Buka 7am–10pm.',
    memories: [
      {
        id: 'cafe-c-1',
        author: 'Wan N.',
        year: '2023',
        text: 'Nasi ayam Cafe C — murah, sedap, dan selalu ada. Makan sini almost setiap hari sem pertama.',
        emoji: '🍗',
        timestamp: 14,
      },
    ],
  },

  // ==========================================================
  // 分组 C：学术区（Akademik）
  // 位置：场景北部（z 值较小/负）
  // 色系：蓝紫色系（知识、专注）
  // ==========================================================

  {
    id: 'dewan-kuliah-1',
    name: 'Dewan Kuliah Besar 1',
    subtitle: '大讲堂一 · 容纳数百人',
    position: [-3.5, 0, -2.5],
    size: [3.2, 1.8, 2.8],
    color: '#6366f1',    // 靛蓝
    roofColor: '#4f46e5',
    emoji: '🎓',
    description: 'Dewan kuliah besar pertama KMK. Tempat ribuan pelajar menghadiri kuliah perdana.',
    memories: [
      {
        id: 'dk1-1',
        author: 'Farah I.',
        year: '2021',
        text: 'Kuliah pertama dalam hidup aku — duduk depan, tangan gementar nak tulis nota. Zaman tu rasa excited gila.',
        emoji: '📝',
        timestamp: 15,
      },
      {
        id: 'dk1-2',
        author: 'Hazwan B.',
        year: '2022',
        text: 'Row paling belakang memang tempat tidur. Tapi bila kena soal secara tiba-tiba, terus terjaga! 😭',
        emoji: '😴',
        timestamp: 16,
      },
    ],
  },

  {
    id: 'dewan-kuliah-2',
    name: 'Dewan Kuliah Besar 2',
    subtitle: '大讲堂二 · 讲课与演讲的舞台',
    position: [3.5, 0, -2.5],
    size: [3.2, 1.8, 2.8],
    color: '#818cf8',    // 浅靛蓝
    roofColor: '#6366f1',
    emoji: '🎓',
    description: 'Dewan kuliah besar kedua. Tempat ceramah motivasi, persembahan, dan peperiksaan besar.',
    memories: [
      {
        id: 'dk2-1',
        author: 'Izzatul H.',
        year: '2023',
        text: 'Presentation pertama kali depan 200 orang. Kaki menggeletar tapi bila habis, rasa macam conquer dunia!',
        emoji: '🎤',
        timestamp: 17,
      },
    ],
  },

  {
    id: 'dewan-kuliah-kecil',
    name: 'Dewan Kuliah Kecil 1–4',
    subtitle: '小讲堂区 · 1–4号讲堂',
    position: [0, 0, -4.5],
    size: [4.0, 1.5, 2.6],
    color: '#a5b4fc',    // 淡蓝紫
    roofColor: '#818cf8',
    emoji: '📐',
    description: 'Empat dewan kuliah kecil bersebelahan. Kelas tutorial, discussion, dan kuliah kumpulan kecil.',
    memories: [
      {
        id: 'dkk-1',
        author: 'Yi Xin C.',
        year: '2022',
        text: 'DK3 — tempat kitorang buat group discussion sampai pensyarah kena halau sebab dah pukul 6 petang 😂',
        emoji: '😂',
        timestamp: 18,
      },
      {
        id: 'dkk-2',
        author: 'Aqilah M.',
        year: '2023',
        text: 'AC DK2 yang sejuk gila sampai pakai sweater dalam kelas. Tapi tidur pun best jugak 😴',
        emoji: '🥶',
        timestamp: 19,
      },
    ],
  },

  {
    id: 'blok-tutorial-a',
    name: 'Blok Tutorial A',
    subtitle: '辅导楼 A · 化学/生物/物理实验室',
    position: [-5.5, 0, -1.5],
    size: [2.8, 1.8, 2.6],
    color: '#10b981',    // 翠绿
    roofColor: '#059669',
    emoji: '📝',
    description: 'Blok tutorial utama. Mengandungi makmal Kimia (aras 1), Biologi (aras 2), dan Fizik (aras 3).',
    memories: [
      {
        id: 'bta-1',
        author: 'Luqmanul H.',
        year: '2022',
        text: 'Makmal Kimia aras 1 — bau asid yang tak pernah nak hilang. Tapi best jugak bila experiment berjaya!',
        emoji: '⚗️',
        timestamp: 20,
      },
      {
        id: 'bta-2',
        author: 'Kwan Yi L.',
        year: '2023',
        text: 'Dissection katak dalam Makmal Bio — separuh kelas pengsan, separuh lagi gelak. Momen bersejarah 😂',
        emoji: '🐸',
        timestamp: 21,
      },
    ],
  },

  {
    id: 'blok-tutorial-b',
    name: 'Blok Tutorial B — Langkasuka',
    subtitle: '辅导楼 B · Langkasuka',
    position: [-5.5, 0, -4.0],
    size: [2.8, 1.8, 2.6],
    color: '#34d399',    // 亮绿
    roofColor: '#10b981',
    emoji: '📝',
    description: 'Blok tutorial Langkasuka. Tempat kuliah, tutorial, dan perbincangan kumpulan.',
    memories: [
      {
        id: 'btb-1',
        author: 'Najwa F.',
        year: '2023',
        text: 'Tutorial Matematik dalam Blok Langkasuka — pensyarah kita yang paling sabar dalam dunia. Terima kasih Cikgu!',
        emoji: '📊',
        timestamp: 22,
      },
    ],
  },

  {
    id: 'makmal-sains',
    name: 'Makmal Sains',
    subtitle: '科学实验室 · 化学/生物/物理',
    position: [5.8, 0, -2.0],
    size: [2.6, 1.8, 3.0],
    color: '#14b8a6',    // 青绿
    roofColor: '#0d9488',
    emoji: '🔬',
    description: 'Kompleks makmal sains KMK. Tempat eksperimen, discovery, dan kadang-kadang tumpah bahan kimia.',
    memories: [
      {
        id: 'ms-1',
        author: 'Rohaida A.',
        year: '2022',
        text: 'Eksperimen fizik pendulum — kitorang ulang 10 kali sebab data tak consistent. Akhirnya baru faham apa itu human error 😅',
        emoji: '🔭',
        timestamp: 23,
      },
    ],
  },

  {
    id: 'makmal-komputer',
    name: 'Makmal Komputer',
    subtitle: '电脑室 · IT 与编程课',
    position: [5.8, 0, -4.5],
    size: [2.4, 1.5, 2.4],
    color: '#2dd4bf',    // 青色
    roofColor: '#14b8a6',
    emoji: '💻',
    description: 'Makmal komputer KMK. Tempat belajar IT, coding, dan kadang-kadang YouTube secara senyap-senyap.',
    memories: [
      {
        id: 'mk-1',
        author: 'Syafiq A.',
        year: '2023',
        text: 'First time belajar Excel dalam makmal ni. Sekarang dah boleh buat pivot table dengan mata tertutup 😎',
        emoji: '💡',
        timestamp: 24,
      },
      {
        id: 'mk-2',
        author: 'Hui Ling W.',
        year: '2022',
        text: 'Masa free lab, semua orang main game. Cikgu datang tiba-tiba, terus semua alt+F4 serentak 😂',
        emoji: '😂',
        timestamp: 25,
      },
    ],
  },

  {
    id: 'perpustakaan',
    name: 'Perpustakaan',
    subtitle: '图书馆 · KMK 知识的殿堂',
    position: [0, 0, -6.5],
    size: [3.4, 2.4, 2.8],
    color: '#8b5cf6',    // 紫色
    roofColor: '#7c3aed',
    emoji: '📚',
    description: 'Perpustakaan KMK — tempat paling tenang di kampus. Buku, jurnal, dan impian para pelajar.',
    memories: [
      {
        id: 'perp-1',
        author: 'Amira Z.',
        year: '2021',
        text: 'Kerusi sudut tingkat 2, tepi tingkap — tu "kerusi aku" sepanjang sem. Siapa ambil, ada hal 😤',
        emoji: '📖',
        timestamp: 26,
      },
      {
        id: 'perp-2',
        author: 'Jian Wei C.',
        year: '2023',
        text: 'Study marathon 10 jam sebelum final. Keluar perpustakaan dah gelap, masuk tadi masih siang. Rasa macam dalam filem.',
        emoji: '⚡',
        timestamp: 27,
      },
      {
        id: 'perp-3',
        author: 'Hanis N.',
        year: '2022',
        text: 'Jumpa nota study group orang lain yang tertinggal. Tulisan cantik gila. Tak tahu siapa tapi terima kasih!',
        emoji: '💌',
        timestamp: 28,
      },
    ],
  },

  // ==========================================================
  // 分组 D：设施区（Kemudahan)
  // 位置：分散在整个校园
  // 色系：各自独立颜色（代表不同功能）
  // ==========================================================

  {
    id: 'masjid',
    name: 'Masjid Khulafa Ar-Rasyidin',
    subtitle: '清真寺 · 精神与心灵的归宿',
    position: [4.5, 0, 1.0],
    size: [3.0, 2.2, 3.0],
    color: '#059669',    // 深绿（伊斯兰色）
    roofColor: '#047857',
    emoji: '🕌',
    description: 'Masjid kampus KMK. Tempat solat, ketenangan, dan refleksi diri sepanjang zaman matrikulasi.',
    memories: [
      {
        id: 'masjid-1',
        author: 'Syazwan A.',
        year: '2022',
        text: 'Solat Subuh berjemaah sebelum exam. Lepas tu niat dalam hati — bukan aku sorang yang struggle, kita semua bersama.',
        emoji: '🌙',
        timestamp: 29,
      },
      {
        id: 'masjid-2',
        author: 'Afiq R.',
        year: '2023',
        text: 'Duduk sorang dalam masjid lepas isyak bila stress. Ada ketenangan yang tak boleh dapat di tempat lain.',
        emoji: '✨',
        timestamp: 30,
      },
    ],
  },

  {
    id: 'pentadbiran',
    name: 'Bangunan Pentadbiran',
    subtitle: '行政楼 · 校务中心',
    position: [-1.2, 0, 1.0],
    size: [2.2, 3.0, 2.0],
    color: '#7c3aed',    // 深紫
    roofColor: '#6d28d9',
    emoji: '🏛️',
    description: 'Pusat pentadbiran KMK. Urusan akademik, kewangan, dan semua perkara rasmi diselesaikan di sini.',
    memories: [
      {
        id: 'ptb-1',
        author: 'Nabilah H.',
        year: '2021',
        text: 'Beratur panjang nak tukar subjek. Jumpa kawan baik dalam queue tu. Sekarang still kawan rapat. Worth it 😂',
        emoji: '🤣',
        timestamp: 31,
      },
      {
        id: 'ptb-2',
        author: 'Syamim F.',
        year: '2023',
        text: 'Ambil surat tawaran universiti kat kaunter ni. Tangan menggeletar. Ibubapa tunggu kat kereta. Momen tu tak terlupa.',
        emoji: '📜',
        timestamp: 32,
      },
    ],
  },

  {
    id: 'kompleks-sukan',
    name: 'Kompleks Sukan',
    subtitle: '体育馆 · 羽球/壁球/篮球',
    position: [-5.5, 0, 2.0],
    size: [3.2, 1.2, 3.8],
    color: '#ec4899',    // 粉红
    roofColor: '#db2777',
    emoji: '🏸',
    description: 'Kompleks sukan KMK. Gelanggang badminton, squash, bola keranjang, dan tenis. Tempat pelajar melepas tekanan.',
    memories: [
      {
        id: 'ks-1',
        author: 'Elyssa T.',
        year: '2022',
        text: 'Badminton setiap Selasa petang dengan geng — tu rutin wajib kami. Stress exam boleh hilang dalam sejam!',
        emoji: '🏸',
        timestamp: 33,
      },
      {
        id: 'ks-2',
        author: 'Luqman I.',
        year: '2023',
        text: 'Final sukan antara blok — kalah 1 poin je. Tapi semangat kitorang paling kuat. Bangga gila dengan team!',
        emoji: '🏆',
        timestamp: 34,
      },
    ],
  },

  {
    id: 'padang',
    name: 'Padang Bola Sepak',
    subtitle: '足球场 · 冠军诞生的地方',
    position: [-7.5, 0, 0],
    size: [4.5, 0.15, 6.0],  // 扁平（这是运动场，不是高楼）
    color: '#16a34a',    // 草绿
    roofColor: '#15803d',
    emoji: '⚽',
    description: 'Padang bola sepak KMK. Tempat perlawanan antara blok, latihan petang, dan berlari lepaskan tension.',
    memories: [
      {
        id: 'padang-1',
        author: 'Faris H.',
        year: '2022',
        text: 'Final futsal antara kolej — menang on penalty shootout. Semua orang berlari masuk padang. Momen paling epic dalam hidup aku.',
        emoji: '🥇',
        timestamp: 35,
      },
      {
        id: 'padang-2',
        author: 'Azrul M.',
        year: '2023',
        text: 'Jogging pagi sebelum kelas — habis pusing padang, tengok matahari terbit. Cara terbaik start hari.',
        emoji: '🌅',
        timestamp: 36,
      },
    ],
  },

  {
    id: 'klinik',
    name: 'Klinik Kesihatan',
    subtitle: '医务室 · 健康守护站',
    position: [2.2, 0, -0.5],
    size: [1.8, 1.4, 1.8],
    color: '#0ea5e9',    // 天蓝
    roofColor: '#0284c7',
    emoji: '🏥',
    description: 'Klinik kesihatan kampus. Urusan ke hospital perlu daftar di pejabat asrama blok B1 dahulu.',
    memories: [
      {
        id: 'klinik-1',
        author: 'Aisyah R.',
        year: '2022',
        text: 'Sakit demam masa exam week. Doktor klinik ni yang tolong bagi MC dan tenangkan aku. Sangat bersyukur.',
        emoji: '🏥',
        timestamp: 37,
      },
    ],
  },

  {
    id: 'guard-house',
    name: 'Guard House',
    subtitle: '保安亭 · 校园出入口',
    position: [0, 0, 8.5],
    size: [1.6, 1.2, 1.6],
    color: '#64748b',    // 灰蓝（保安制服色）
    roofColor: '#475569',
    emoji: '🛡️',
    description: 'Pintu masuk utama KMK. Punch kad matriks masuk keluar, ambil food delivery, dan semua urusan outing bermula di sini.',
    memories: [
      {
        id: 'gh-1',
        author: 'Hamizan N.',
        year: '2023',
        text: 'Setiap Jumaat tunggu Grab kat guard house. Excited gila nak outing, sampai berdiri dari pukul 7.45am 😂',
        emoji: '😂',
        timestamp: 38,
      },
      {
        id: 'gh-2',
        author: 'Wei Xin L.',
        year: '2022',
        text: 'Abang guard yang baik hati — selalu senyum dan tolong keep food delivery kitorang. Terima kasih banyak-banyak!',
        emoji: '💛',
        timestamp: 39,
      },
    ],
  },
];

// ------------------------------------------------------------
// Zustand Store — 创建全局状态
// ------------------------------------------------------------

export const useCampusStore = create<CampusStore>((set) => ({

  // --- 初始数据 ---
  buildings: initialBuildings,
  selectedBuilding: null,
  isZooming: false,
  showMemoryWall: false,

  // --- 选择建筑 ---
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),

  // --- 控制镜头动画状态 ---
  setIsZooming: (v) => set({ isZooming: v }),

  // --- 显示/隐藏记忆墙 ---
  setShowMemoryWall: (v) => set({ showMemoryWall: v }),

  // --- 添加一条新回忆 ---
  // 同时更新 buildings 数组 和 selectedBuilding（两者都要更新，否则 UI 不会刷新）
  addMemory: (buildingId, memory) =>
    set((state) => {
      // 生成新的回忆对象
      const newMemory: Memory = {
        ...memory,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };

      // 更新建筑列表中对应建筑的 memories
      const updatedBuildings = state.buildings.map((b) =>
        b.id === buildingId
          ? { ...b, memories: [...b.memories, newMemory] }
          : b
      );

      // 如果当前选中的建筑正好是这栋，也同步更新 selectedBuilding
      const updatedSelected =
        state.selectedBuilding?.id === buildingId
          ? { ...state.selectedBuilding, memories: [...state.selectedBuilding.memories, newMemory] }
          : state.selectedBuilding;

      return {
        buildings: updatedBuildings,
        selectedBuilding: updatedSelected,
      };
    }),
}));
