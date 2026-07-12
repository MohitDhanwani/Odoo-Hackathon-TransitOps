"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// Premium cinematic neon palettes
const PALETTES = [
  ["#00f2fe", "#4facfe", "#00c6ff", "#0072ff"], // Electric Cyan/Blue
  ["#f857a6", "#ff5858", "#ff0844", "#ffb199"], // Magenta/Pink
  ["#b224ef", "#7579ff", "#b224ef", "#7b2ff7"], // Deep Purple/Violet
  ["#00b09b", "#96c93d", "#00ff87", "#60efff"], // Teal/Neon Green
  ["#F97316", "#FB923C", "#EA580C", "#FDBA74"], // Original Warm Amber
];

// Simple noise function for idle wandering
function generateNoise(time: number, offset: number) {
  return new THREE.Vector3(
    Math.sin(time * 0.5 + offset) * 2 + Math.cos(time * 0.3 + offset * 2),
    Math.cos(time * 0.4 + offset) * 2 + Math.sin(time * 0.6 + offset * 2),
    Math.sin(time * 0.2 + offset) * 1.5
  );
}

function Tube({ id, basePoints, targetPlane, currentPalette }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Create a mutable array of vector points for the curve
  const points = useMemo(() => basePoints.map((p: THREE.Vector3) => p.clone()), [basePoints]);
  const velocities = useMemo(() => basePoints.map(() => new THREE.Vector3()), [basePoints]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const mouseTarget = useMemo(() => new THREE.Vector3(), []);
  
  // Select a random color from the current palette
  const [targetColor, setTargetColor] = useState(() => new THREE.Color(currentPalette[Math.floor(Math.random() * currentPalette.length)]));
  const currentColor = useRef(new THREE.Color(targetColor));

  // When palette changes, pick a new target color
  useEffect(() => {
    setTargetColor(new THREE.Color(currentPalette[Math.floor(Math.random() * currentPalette.length)]));
  }, [currentPalette]);

  useFrame(({ pointer, camera, clock }) => {
    const time = clock.getElapsedTime();

    // 1. Raycast to find mouse target
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(targetPlane, mouseTarget);
    
    // Smooth color transition
    if (materialRef.current) {
      currentColor.current.lerp(targetColor, 0.03);
      materialRef.current.color.copy(currentColor.current);
      materialRef.current.emissive.copy(currentColor.current);
      
      // Pulse emission slightly based on time and velocity
      const speed = velocities[velocities.length - 1].length();
      materialRef.current.emissiveIntensity = 1 + speed * 2 + Math.sin(time * 2 + id) * 0.3;
    }
    
    // 2. Physics-based trailing (Inertia & Springs)
    // The head of the tube tries to reach the mouse + some idle noise
    const noise = generateNoise(time, id * 10);
    const headTarget = new THREE.Vector3().copy(mouseTarget).add(noise);
    
    points.forEach((p: THREE.Vector3, i: number) => {
      const v = velocities[i];
      
      if (i === points.length - 1) {
        // The head point chases the mouse target with spring physics
        const springForce = 0.05 + (id * 0.005); // slightly different springs per tube
        const friction = 0.85;
        
        v.x += (headTarget.x - p.x) * springForce;
        v.y += (headTarget.y - p.y) * springForce;
        // Keep Z within bounds to prevent hitting camera
        v.z += (Math.max(-5, Math.min(2, headTarget.z)) - p.z) * springForce;
        
        v.multiplyScalar(friction);
        p.add(v);
      } else {
        // Trailing points chase the point ahead of them
        const nextP = points[i + 1];
        const springForce = 0.15;
        const friction = 0.75;
        
        // Maintain some distance between points to stretch out the tail based on speed
        const offset = new THREE.Vector3().subVectors(p, nextP).normalize().multiplyScalar(0.5);
        const targetPos = new THREE.Vector3().copy(nextP).add(offset);
        
        v.x += (targetPos.x - p.x) * springForce;
        v.y += (targetPos.y - p.y) * springForce;
        v.z += (targetPos.z - p.z) * springForce;
        
        v.multiplyScalar(friction);
        p.add(v);
      }
    });
    
    // 3. Update geometry
    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = new THREE.TubeGeometry(curve, 64, 0.06 + Math.sin(time + id)*0.02, 8, false);
    }
  });

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 64, 0.06, 8, false]} />
      <meshStandardMaterial 
        ref={materialRef} 
        color={currentColor.current} 
        emissive={currentColor.current} 
        emissiveIntensity={1.5} 
        roughness={0.1} 
        metalness={0.9} 
      />
    </mesh>
  );
}

function TubeSystem({ currentPalette }: { currentPalette: string[] }) {
  const { viewport } = useThree();
  
  // Reduce tube count slightly for performance given the complex physics and postprocessing
  const tubeCount = 8;
  
  // Shared plane at Z=0 for raycasting
  const targetPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

  const tubes = useMemo(() => {
    return Array.from({ length: tubeCount }).map((_, i) => {
      const points = [];
      // Generate initial points spread out
      for (let j = 0; j < 6; j++) {
        points.push(new THREE.Vector3(
          (Math.random() - 0.5) * viewport.width,
          (Math.random() - 0.5) * viewport.height,
          -5 - j * 2
        ));
      }
      return { id: i, basePoints: points };
    });
  }, [viewport]);

  return (
    <>
      {tubes.map((t) => (
        <Tube key={t.id} id={t.id} basePoints={t.basePoints} targetPlane={targetPlane} currentPalette={currentPalette} />
      ))}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 10]} intensity={1} color={currentPalette[0]} />
      <pointLight position={[0, -5, -5]} intensity={2} color={currentPalette[1]} distance={20} />
    </>
  );
}

export function TubesBackground() {
  const [mounted, setMounted] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePointerDown = () => {
    setPaletteIndex((prev) => (prev + 1) % PALETTES.length);
  };

  if (!mounted) return null;
  
  return (
    <div className="absolute inset-0 z-0 bg-[#030303] overflow-hidden" onPointerDown={handlePointerDown}>
      <Canvas 
        camera={{ position: [0, 0, 12], fov: 50 }} 
        dpr={[1, 1.5]} // Capped at 1.5 for performance with bloom
        gl={{ powerPreference: "high-performance", antialias: false, alpha: false }}
      >
        <color attach="background" args={["#030303"]} />
        <fog attach="fog" args={["#030303", 5, 25]} />
        
        <TubeSystem currentPalette={PALETTES[paletteIndex]} />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            mipmapBlur 
            intensity={1.5} 
            levels={8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
