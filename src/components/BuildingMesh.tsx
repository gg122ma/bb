// ============================================================
// 文件：BuildingMesh.tsx
// 职责：渲染单栋建筑的 3D 模型，包括：
//         - 主体（box）、屋顶、窗户、门
//         - 悬停时上浮 + 发光动画
//         - 选中时放大 + 底部光圈
//         - 未选中时变透明（场景聚焦效果）
//         - 建筑名称标签、记忆数量角标
// ============================================================

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Building } from '../store/campusStore';

interface BuildingMeshProps {
  building: Building;
  onClick: (building: Building) => void;
  isSelected: boolean;   // 此建筑是否被选中
  isAnySelected: boolean; // 场景中是否有任何建筑被选中
}

export default function BuildingMesh({
  building,
  onClick,
  isSelected,
  isAnySelected,
}: BuildingMeshProps) {

  // --- refs ---
  const groupRef = useRef<THREE.Group>(null);
  const meshRef  = useRef<THREE.Mesh>(null);

  // --- 悬停状态 ---
  const [hovered, setHovered] = useState(false);

  // 解构建筑数据
  const [px, py, pz] = building.position;
  const [sx, sy, sz] = building.size;

  // --- 材质颜色（useMemo 避免每帧重新创建 Color 对象）---
  const mainColor    = useMemo(() => new THREE.Color(building.color), [building.color]);
  const roofColor    = useMemo(() => new THREE.Color(building.roofColor), [building.roofColor]);
  const emissiveColor = useMemo(
    () => new THREE.Color(hovered || isSelected ? building.color : '#000000'),
    [hovered, isSelected, building.color]
  );

  // --- 每帧动画：平滑插值 ---
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // 悬停时：整组上浮 0.3 单位
    const targetY = hovered && !isAnySelected ? 0.3 : 0;
    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * Math.min(1, delta * 8);

    // 选中时：整组放大 1.08；悬停时：1.05；正常：1.0
    const targetScale = isSelected ? 1.08 : hovered && !isAnySelected ? 1.05 : 1;
    groupRef.current.scale.x +=
      (targetScale - groupRef.current.scale.x) * Math.min(1, delta * 8);
    groupRef.current.scale.z +=
      (targetScale - groupRef.current.scale.z) * Math.min(1, delta * 8);

    // 发光强度：选中 0.4，悬停 0.25，正常 0
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      const targetEmissiveIntensity = isSelected ? 0.4 : hovered ? 0.25 : 0;
      mat.emissiveIntensity +=
        (targetEmissiveIntensity - mat.emissiveIntensity) * Math.min(1, delta * 6);
    }
  });

  // 当有其他建筑被选中时，本建筑半透明
  const opacity = isAnySelected && !isSelected ? 0.35 : 1;

  return (
    <group
      ref={groupRef}
      position={[px, py, pz]}

      // 点击：触发父组件回调
      onClick={(e) => {
        e.stopPropagation(); // 防止事件冒泡到 Canvas
        onClick(building);
      }}

      // 悬停进入：显示浮起动画 + 改鼠标样式
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!isAnySelected) {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}

      // 悬停离开：恢复
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >

      {/* ===== 建筑主体 ===== */}
      <mesh ref={meshRef} position={[0, sy / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sx, sy, sz]} />
        <meshStandardMaterial
          color={mainColor}
          emissive={emissiveColor}
          emissiveIntensity={0}   // 由 useFrame 动画控制
          transparent
          opacity={opacity}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* ===== 屋顶 ===== */}
      {/* 比主体略宽，形成屋檐效果 */}
      <mesh position={[0, sy + 0.2, 0]} castShadow>
        <boxGeometry args={[sx + 0.12, 0.38, sz + 0.12]} />
        <meshStandardMaterial
          color={roofColor}
          transparent
          opacity={opacity}
          roughness={0.5}
        />
      </mesh>

      {/* ===== 窗户（正面两排，每排三个）===== */}
      {[0.28, 0.68].map((rowFrac) =>
        [-0.28, 0, 0.28].map((colOffset, ci) => (
          <mesh
            key={`win-${rowFrac}-${ci}`}
            position={[colOffset * sx, rowFrac * sy + 0.05, sz / 2 + 0.01]}
          >
            <planeGeometry args={[sx * 0.18, sy * 0.14]} />
            <meshStandardMaterial
              color={hovered || isSelected ? '#fef9c3' : '#bfdbfe'}
              emissive={hovered || isSelected ? '#fef08a' : '#93c5fd'}
              emissiveIntensity={hovered || isSelected ? 0.8 : 0.2}
              transparent
              opacity={opacity * 0.9}
            />
          </mesh>
        ))
      )}

      {/* ===== 入口大门 ===== */}
      <mesh position={[0, sy * 0.15, sz / 2 + 0.01]}>
        <planeGeometry args={[sx * 0.22, sy * 0.28]} />
        <meshStandardMaterial color="#78350f" transparent opacity={opacity * 0.9} />
      </mesh>

      {/* ===== 选中光圈（仅在选中时显示）===== */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(sx, sz) * 0.72, Math.max(sx, sz) * 0.88, 32]} />
          <meshBasicMaterial color={building.color} transparent opacity={0.55} />
        </mesh>
      )}

      {/* ===== 悬停/选中时：建筑名称提示 ===== */}
      {/* Billboard 使标签始终面向镜头 */}
      {(hovered || isSelected) && !isAnySelected && (
        <Billboard position={[0, sy + 1.2, 0]}>
          {/* 建筑名称 */}
          <Text
            fontSize={0.28}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#000000"
            font={undefined}
          >
            {building.emoji} {building.name}
          </Text>
          {/* 点击提示 */}
          <Text
            fontSize={0.16}
            color="#fde68a"
            anchorX="center"
            anchorY="middle"
            position={[0, -0.34, 0]}
            outlineWidth={0.03}
            outlineColor="#000000"
            font={undefined}
          >
            Klik untuk lihat kenangan
          </Text>
        </Billboard>
      )}

      {/* ===== 常驻图标（没有建筑被选中时，每栋楼头顶显示 emoji）===== */}
      {!isAnySelected && !hovered && (
        <Billboard position={[0, sy + 0.75, 0]}>
          <Text
            fontSize={0.22}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.035}
            outlineColor="#1e1b4b"
            font={undefined}
          >
            {building.emoji}
          </Text>
        </Billboard>
      )}

      {/* ===== 回忆数量角标（右上角）===== */}
      {!isAnySelected && (
        <Billboard position={[sx / 2 + 0.12, sy + 0.55, 0]}>
          <Text
            fontSize={0.17}
            color="#fef3c7"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#78350f"
            font={undefined}
          >
            {`💬 ${building.memories.length}`}
          </Text>
        </Billboard>
      )}

    </group>
  );
}
