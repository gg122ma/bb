// ============================================================
// 文件：main.tsx
// 职责：React 应用入口，挂载到 #root DOM 节点
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
