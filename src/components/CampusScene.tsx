// ============================================================
// 文件：CampusScene.tsx
// 职责：3D 场景的核心控制器：
//         - 灯光配置（环境光、方向光、天空）
//         - 镜头飞行动画（点击建筑 → 自动飞过去）
//         - 渲染所有建筑（BuildingMesh）
//         - 地面环境（CampusGround）
//         - 轨道控制（鼠标拖拽旋转/缩放）
// ============================================================

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Building, useCampusStore } from '../store/campusStore';
import BuildingMesh from './BuildingMesh';
import CampusGround from './CampusGround';

interface CampusSceneProps {
  onBuildingSelect: (building: Building) => void;
}

export default function CampusScene({ onBuildingSelect }: CampusSceneProps) {
  const {
    buildings,
    selectedBuilding,
    isZooming,
    setIsZooming,
    setShowMemoryWall,
  } = useCampusStore();

  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // --- 镜头动画相关 ref ---
  // 使用 ref 而不是 state，避免每帧触发重渲染
  const targetPos   = useRef(new THREE.Vector3(0, 12, 16));  // 目标镜头位置
  const targetLook  = useRef(new THREE.Vector3(0, 0, 0));    // 目标注视点
  const animating   = useRef(false);                          // 是否正在动画
  const animProgress = useRef(0);                             // 动画进度 0→1
  const startPos    = useRef(new THREE.Vector3());            // 动画起始镜头位置
  const startLook   = useRef(new THREE.Vector3());            // 动画起始注视点

  // --- 初始镜头位置 ---
  useEffect(() => {
    camera.position.set(0, 12, 16);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // --- 当选中建筑变化时，启动镜头飞行动画 ---
  useEffect(() => {
    if (selectedBuilding) {
      // 计算目标镜头位置：建筑正前方，稍高一点
      const [bx, , bz] = selectedBuilding.position;
      const [sx, sy, sz] = selectedBuilding.size;
      const zoomDist = Math.max(sx, sz) * 2.4 + 2.5; // 根据建筑大小动态调整距离

      targetPos.current.set(bx, sy * 1.6 + 2.5, bz + zoomDist);
      targetLook.current.set(bx, sy / 2, bz);

    } else {
      // 没有选中建筑时，飞回总览位置
      targetPos.current.set(0, 12, 16);
      targetLook.current.set(0, 0, 0);
    }

    // 记录动画起始点（当前镜头位置）
    startPos.current.copy(camera.position);
    startLook.current.set(0, 0, 0); // 简化：总是从中心开始插值

    // 启动动画
    animProgress.current = 0;
    animating.current = true;
    setIsZooming(true);

    // 动画期间禁用鼠标轨道控制，防止冲突
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
  }, [selectedBuilding, camera, setIsZooming]);

  // --- 每帧更新：镜头插值动画 ---
  useFrame((_, delta) => {
    if (!animating.current) return;

    // 推进动画进度（速度 1.5 倍，约 0.67 秒完成）
    animProgress.current = Math.min(1, animProgress.current + delta * 1.5);
    const t = easeInOutCubic(animProgress.current);

    // 插值镜头位置
    camera.position.lerpVectors(startPos.current, targetPos.current, t);

    // 插值注视点
    const curLook = new THREE.Vector3().lerpVectors(startLook.current, targetLook.current, t);
    camera.lookAt(curLook);

    // 动画完成
    if (animProgress.current >= 1) {
      animating.current = false;
      setIsZooming(false);

      if (selectedBuilding) {
        // 飞到建筑后，延迟 100ms 打开记忆墙（等动画稳定）
        setTimeout(() => setShowMemoryWall(true), 100);

        // 更新轨道控制目标点到建筑位置
        if (controlsRef.current) {
          controlsRef.current.target.copy(targetLook.current);
        }
      } else {
        // 飞回总览后，恢复鼠标控制
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.enabled = true;
        }
      }
    }
  });

  // --- 建筑点击处理 ---
  // 动画中不响应点击，防止重复触发
  const handleBuildingClick = (building: Building) => {
    if (isZooming) return;
    onBuildingSelect(building);
  };

  return (
    <>
      {/* ===== 天空 ===== */}
      {/* KMK 位于吉打州，热带晴天 */}
      <Sky sunPosition={[80, 40, 80]} turbidity={0.5} rayleigh={0.6} />
      {/* 夜晚星星（数量少，氛围用） */}
      <Stars radius={80} depth={40} count={600} factor={2} fade />

      {/* ===== 灯光系统 ===== */}
      {/* 环境光：整体基础亮度 */}
      <ambientLight intensity={0.75} />

      {/* 方向光：模拟阳光，产生阴影 */}
      <directionalLight
        position={[12, 22, 12]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* 半球光：天空蓝色 + 草地绿色反射，更自然 */}
      <hemisphereLight args={['#bfdbfe', '#86efac', 0.45]} />

      {/* 中央补光：照亮场景中心 */}
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#fef3c7" />

      {/* ===== 地面环境 ===== */}
      <CampusGround />

      {/* ===== 所有建筑 ===== */}
      {buildings.map((building) => (
        <BuildingMesh
          key={building.id}
          building={building}
          onClick={handleBuildingClick}
          isSelected={selectedBuilding?.id === building.id}
          isAnySelected={!!selectedBuilding}
        />
      ))}

      {/* ===== 轨道控制 ===== */}
      {/* 允许鼠标拖拽旋转、滚轮缩放 */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}           // 最近不能太近
        maxDistance={28}          // 最远总览整个校园
        maxPolarAngle={Math.PI / 2.1}  // 不能看到地面以下
        minPolarAngle={Math.PI / 7}    // 不能完全俯视
        target={[0, 0, 0]}
      />
    </>
  );
}

// ------------------------------------------------------------
// 工具函数：缓入缓出三次方曲线
// 使镜头动画开始慢、中间快、结束慢，更流畅自然
// t 范围：0→1，返回值范围：0→1
// ------------------------------------------------------------
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
