// ============================================================
// 文件：cn.ts
// 职责：合并 Tailwind className 的工具函数
// 用法：cn('flex', condition && 'hidden', 'text-white')
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
