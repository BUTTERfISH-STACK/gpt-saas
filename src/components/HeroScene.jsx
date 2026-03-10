"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Html, Instance, Instances } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function OrbitalCluster() {
  const group = useRef();
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * 0.4;
    if (group.current) {
      group.current.rotation.y = t.current;
      group.current.rotation.x = Math.sin(t.current * 0.4) * 0.2;
    }
  });

  const points = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      const radius = 2.4 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      return {
        position: new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.cos(phi),
          radius * Math.sin(theta) * Math.sin(phi)
        ),
        scale: 0.08 + Math.random() * 0.12,
      };
    });
  }, []);

  return (
    <group ref={group}>
      <Instances limit={points.length}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color="#7cf0ff"
          emissive="#7cf0ff"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.6}
        />
        {points.map((point, index) => (
          <Instance
            key={index}
            position={point.position}
            scale={point.scale}
          />
        ))}
      </Instances>
    </group>
  );
}

function HeroCore() {
  const mesh = useRef();

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.4;
    mesh.current.rotation.x += delta * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={1.4}>
      <mesh ref={mesh}>
        <torusKnotGeometry args={[0.9, 0.32, 160, 24]} />
        <meshStandardMaterial
          color="#9b7bff"
          emissive="#5e5ef7"
          emissiveIntensity={0.8}
          roughness={0.18}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function DataRings() {
  const rings = useRef();

  useFrame((_, delta) => {
    if (!rings.current) return;
    rings.current.rotation.z += delta * 0.2;
  });

  return (
    <group ref={rings}>
      {[0, 1, 2].map((index) => (
        <mesh key={index} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8 + index * 0.45, 1.82 + index * 0.45, 128]} />
          <meshBasicMaterial color="#7cf0ff" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0b0d1a"]} />
      <fog attach="fog" args={["#0b0d1a", 4, 12]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color="#7cf0ff" />
      <pointLight position={[-4, -2, -2]} intensity={0.8} color="#9b7bff" />
      <HeroCore />
      <DataRings />
      <OrbitalCluster />
      <Environment preset="night" />
      <Html position={[0, -2.4, 0]} center>
        <div className="scene-caption">Realtime knowledge orbit</div>
      </Html>
    </Canvas>
  );
}
