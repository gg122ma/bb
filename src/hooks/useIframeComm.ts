// ============================================================
// 文件：useIframeComm.ts
// 职责：处理 3D 地图与外部网站之间的双向 postMessage 通信
// 调用位置：App.tsx（只调用一次，全局生效）
// ============================================================
//
// 通信方向：
//   外部网站 → 3D 地图：发送"指令"（如 FLY_TO、RESET_CAMERA）
//   3D 地图 → 外部网站：发送"事件"（如 BUILDING_CLICKED、SCENE_READY）
//
// 外部网站使用方法：
//   // 发送指令
//   document.getElementById('kmk-iframe').contentWindow.postMessage(
//     { type: 'FLY_TO', buildingId: 'perpustakaan' }, '*'
//   );
//   // 监听事件
//   window.addEventListener('message', (e) => {
//     if (e.data.type === 'BUILDING_CLICKED') { ... }
//   });
// ============================================================

import { useEffect } from 'react';
import { useCampusStore } from '../store/campusStore';

// ------------------------------------------------------------
// 类型定义：外部网站发来的指令
// ------------------------------------------------------------
type InboundMessage =
  | { type: 'FLY_TO'; buildingId: string }           // 镜头飞到某栋建筑
  | { type: 'HIGHLIGHT'; buildingId: string }         // 高亮某栋建筑（不打开记忆墙）
  | { type: 'RESET_CAMERA' }                          // 重置镜头到总览
  | { type: 'OPEN_MEMORY_WALL'; buildingId: string }  // 直接打开某栋建筑的记忆墙
  | { type: 'CLOSE_MEMORY_WALL' };                    // 关闭记忆墙

// ------------------------------------------------------------
// 类型定义：3D 地图发给外部网站的事件
// ------------------------------------------------------------
type OutboundMessage =
  | { type: 'SCENE_READY' }                                                       // 场景加载完成
  | { type: 'BUILDING_CLICKED'; buildingId: string; buildingName: string }        // 用户点击了建筑
  | { type: 'MEMORY_WALL_OPENED'; buildingId: string; buildingName: string }      // 记忆墙打开
  | { type: 'MEMORY_WALL_CLOSED' }                                                // 记忆墙关闭
  | { type: 'MEMORY_ADDED'; buildingId: string; author: string };                 // 用户提交了回忆

// ------------------------------------------------------------
// 工具函数：向父页面（外部网站）发送事件
// 如果不在 iframe 里（即直接在浏览器中打开），则不发送
// ------------------------------------------------------------
export function sendToParent(message: OutboundMessage) {
  // window.parent !== window 意味着在 iframe 里
  if (window.parent !== window) {
    window.parent.postMessage(message, '*');
    // 注意：生产环境请将 '*' 替换为实际域名，如 'https://yourdomain.com'
  }
}

// ------------------------------------------------------------
// 主 Hook：useIframeComm
// 在 App.tsx 中调用一次即可
// ------------------------------------------------------------
export function useIframeComm() {
  // 取得 store 中的数据和操作方法
  const {
    buildings,
    setSelectedBuilding,
    setShowMemoryWall,
  } = useCampusStore();

  useEffect(() => {
    // --- 步骤 1：监听来自父页面的指令 ---
    function handleMessage(event: MessageEvent) {
      // 安全检查：只接受带有 type 字段的消息
      // 生产环境请加上：if (event.origin !== 'https://yourdomain.com') return;
      const msg = event.data as InboundMessage;
      if (!msg || typeof msg.type !== 'string') return;

      switch (msg.type) {

        // 指令：飞镜头到某栋建筑，并打开记忆墙
        case 'FLY_TO': {
          const building = buildings.find((b) => b.id === msg.buildingId);
          if (building) {
            setShowMemoryWall(false);      // 先关闭现有记忆墙
            setSelectedBuilding(building); // 触发镜头飞行动画
          }
          break;
        }

        // 指令：高亮某栋建筑（只飞镜头，不打开记忆墙）
        case 'HIGHLIGHT': {
          const building = buildings.find((b) => b.id === msg.buildingId);
          if (building) {
            setShowMemoryWall(false);
            setSelectedBuilding(building);
            // 记忆墙不会自动打开，因为 showMemoryWall 由镜头动画结束后触发
            // 这里通过在镜头动画结束后不 setShowMemoryWall(true) 来实现
            // （在 CampusScene.tsx 中处理）
          }
          break;
        }

        // 指令：重置镜头到总览
        case 'RESET_CAMERA': {
          setShowMemoryWall(false);
          setSelectedBuilding(null);
          break;
        }

        // 指令：直接打开某栋建筑的记忆墙
        case 'OPEN_MEMORY_WALL': {
          const building = buildings.find((b) => b.id === msg.buildingId);
          if (building) {
            setSelectedBuilding(building);
            setShowMemoryWall(true);
          }
          break;
        }

        // 指令：关闭记忆墙
        case 'CLOSE_MEMORY_WALL': {
          setShowMemoryWall(false);
          setSelectedBuilding(null);
          break;
        }
      }
    }

    // 注册监听器
    window.addEventListener('message', handleMessage);

    // --- 步骤 2：场景加载完成，通知父页面 ---
    // 稍微延迟，确保 Three.js 场景已渲染
    const timer = setTimeout(() => {
      sendToParent({ type: 'SCENE_READY' });
    }, 500);

    // 清理：组件卸载时移除监听器
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timer);
    };
  }, [buildings, setSelectedBuilding, setShowMemoryWall]);
}
