// ============================================================
// 文件：CampusGround.tsx
// 职责：渲染 KMK 校园的地面环境：
//         - 主草地（绿色地面）
//         - 道路网络（灰色小路）
//         - 树木（圆柱树干 + 球形树冠）
//         - 路灯（带点光源）
//         - 校园入口牌匾
//         - 中央广场喷泉
// ============================================================

import { useMemo } from 'react';
import * as THREE from 'three';

export default function CampusGround() {

  // --- 材质缓存（useMemo 避免每帧重新创建）---
  const pathMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.9, metalness: 0 }),
    []
  );
  const grassMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 1, metalness: 0 }),
    []
  );
  const darkGrassMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 1, metalness: 0 }),
    []
  );

  return (
    <group>

      {/* ===== 主地面（整个校园底层绿地）===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#2d6a4f" roughness={1} />
      </mesh>

      {/* ===== 道路网络 ===== */}
      {/* KMK 校园的道路：横向主路、纵向主路、宿舍区支路 */}

      {/* 横向主路（连接学术区与宿舍区） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 1.5]} receiveShadow>
        <planeGeometry args={[24, 1.4]} />
        <primitive object={pathMaterial} />
      </mesh>

      {/* 纵向主路（南北向，贯穿全校） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[1.4, 24]} />
        <primitive object={pathMaterial} />
      </mesh>

      {/* 宿舍区横路（连接各宿舍楼） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 5.5]} receiveShadow>
        <planeGeometry args={[16, 1.2]} />
        <primitive object={pathMaterial} />
      </mesh>

      {/* 学术区横路（连接各讲堂） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -3.5]} receiveShadow>
        <planeGeometry args={[14, 1.2]} />
        <primitive object={pathMaterial} />
      </mesh>

      {/* 东侧纵路（连接 Masjid 和 Makmal 区） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.005, -1.0]} receiveShadow>
        <planeGeometry args={[1.0, 10]} />
        <primitive object={pathMaterial} />
      </mesh>

      {/* 西侧纵路（连接 Blok Tutorial 区） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.5, 0.005, -2.0]} receiveShadow>
        <planeGeometry args={[1.0, 8]} />
        <primitive object={pathMaterial} />
      </mesh>

      {/* Guard House 到校门路 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 9.0]} receiveShadow>
        <planeGeometry args={[3.0, 3.0]} />
        <primitive object={pathMaterial} />
      </mesh>

      {/* ===== 草坪装饰区块 ===== */}
      {/* 在道路交叉口和建筑之间放置圆形草坪 */}
      {[
        [-3.5, 3.5],   // 宿舍西侧草坪
        [3.5, 3.5],    // 宿舍东侧草坪
        [-2.5, -1.0],  // 学术区西草坪
        [2.5, -1.0],   // 学术区东草坪
        [0, -8.0],     // 图书馆前广场草坪
        [-8.0, -2.0],  // 西角草坪
      ].map(([x, z], i) => (
        <mesh key={`grass-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, z]} receiveShadow>
          <circleGeometry args={[1.6, 16]} />
          <primitive object={i % 2 === 0 ? grassMaterial : darkGrassMaterial} />
        </mesh>
      ))}

      {/* ===== 树木 ===== */}
      {/* 每棵树由树干（cylinder）+ 树冠（sphere）组成 */}
      {/* 格式：[x, z, 树冠半径, 颜色索引] */}
      {[
        [-2.5, 2.5, 0.55, 0],
        [2.5, 2.5, 0.50, 1],
        [-8.5, 1.0, 0.65, 2],
        [8.5, -1.0, 0.55, 0],
        [-3.0, -5.5, 0.60, 1],
        [3.0, -5.5, 0.50, 2],
        [-1.5, -8.5, 0.55, 0],
        [1.5, -8.5, 0.60, 1],
        [-7.0, 3.5, 0.50, 2],
        [7.0, 3.5, 0.55, 0],
        [-2.0, 4.8, 0.45, 1],
        [2.0, 4.8, 0.45, 2],
        [-4.5, -6.5, 0.50, 0],
        [4.5, -6.5, 0.55, 1],
      ].map(([x, z, s, ci], i) => (
        <group key={`tree-${i}`} position={[x as number, 0, z as number]}>
          {/* 树干 */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.13, 0.9, 8]} />
            <meshStandardMaterial color="#78350f" roughness={1} />
          </mesh>
          {/* 树冠 */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <sphereGeometry args={[s as number, 10, 10]} />
            <meshStandardMaterial
              color={
                (ci as number) % 3 === 0 ? '#15803d' :
                (ci as number) % 3 === 1 ? '#16a34a' : '#4ade80'
              }
              roughness={1}
            />
          </mesh>
        </group>
      ))}

      {/* ===== 路灯 ===== */}
      {/* 分布在主要道路交叉口，每盏路灯带一个点光源 */}
      {[
        [-2.0, 2.0],
        [2.0, 2.0],
        [-2.0, -1.5],
        [2.0, -1.5],
        [-2.0, 5.0],
        [2.0, 5.0],
        [0, -5.5],
      ].map(([x, z], i) => (
        <group key={`lamp-${i}`} position={[x, 0, z]}>
          {/* 灯柱 */}
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 2.2, 6]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* 灯球（发光材质） */}
          <mesh position={[0, 2.3, 0]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fef08a"
              emissiveIntensity={1}
            />
          </mesh>
          {/* 点光源（照亮周围区域） */}
          <pointLight
            position={[x, 2.3, z]}
            intensity={0.5}
            distance={5}
            color="#fef9c3"
          />
        </group>
      ))}

      {/* ===== KMK 校园入口牌匾 ===== */}
      {/* 位于 Guard House 前方 */}
      <group position={[0, 0, 10.5]}>
        {/* 左柱 */}
        <mesh position={[-1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 1.6, 8]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
        {/* 右柱 */}
        <mesh position={[1.2, 0.8, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 1.6, 8]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
        {/* 牌匾板（深蓝色，代表 KMK 校色） */}
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[3.0, 0.6, 0.12]} />
          <meshStandardMaterial color="#1e3a5f" />
        </mesh>
      </group>

      {/* ===== 中央广场喷泉 ===== */}
      {/* 位于场景中心（x=0, z=0），是校园的视觉焦点 */}
      <group position={[0, 0, 0]}>
        {/* 外圈水池 */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.85, 0.95, 0.18, 24]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.5} />
        </mesh>
        {/* 喷泉柱 */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.5, 10]} />
          <meshStandardMaterial color="#64748b" metalness={0.6} />
        </mesh>
        {/* 水面（半透明蓝色） */}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.68, 0.78, 0.08, 24]} />
          <meshStandardMaterial
            color="#60a5fa"
            transparent
            opacity={0.7}
            roughness={0}
            metalness={0.1}
          />
        </mesh>
      </group>

    </group>
  );
}
