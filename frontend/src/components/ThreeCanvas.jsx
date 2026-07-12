import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PointMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------
// 1. HERO WORKSPACE SCENE (Home Page 3D Workspace)
// Includes: Floating AI Brain, Floating Resume, Laptop,
// Holographic Dashboards, Moving Particles, and Parallax.
// ----------------------------------------------------

function BrainNode({ position, color = '#d200ff' }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t + position[0]) * 0.15;
    meshRef.current.rotation.x = Math.sin(t) * 0.2;
    meshRef.current.rotation.y = t * 0.5;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.5, 2]} />
      <meshStandardMaterial 
        color={color} 
        wireframe 
        emissive={color}
        emissiveIntensity={1.2}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
}

function FloatingResumeMesh() {
  const ref = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.position.y = Math.sin(t * 0.8) * 0.2 + 0.5;
    ref.current.position.x = Math.cos(t * 0.5) * 0.1 - 1.5;
    ref.current.rotation.y = t * 0.2;
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.1;
  });

  return (
    <mesh ref={ref} position={[-1.5, 0.5, 0.5]} rotation={[0.2, 0.3, -0.1]}>
      <boxGeometry args={[0.8, 1.1, 0.03]} />
      <meshPhysicalMaterial 
        color="#00d2ff"
        transparent
        opacity={0.4}
        roughness={0.1}
        metalness={0.1}
        clearcoat={1.0}
        transmission={0.6}
        ior={1.5}
      />
    </mesh>
  );
}

function LaptopMesh() {
  const ref = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.1 - 0.2;
  });

  return (
    <group ref={ref} position={[1.5, -0.5, 0]}>
      {/* Laptop Keyboard Base */}
      <mesh>
        <boxGeometry args={[1.5, 0.05, 1.1]} />
        <meshStandardMaterial color="#2d2d3a" roughness={0.5} metalness={0.8} />
      </mesh>
      {/* Laptop Screen Lid */}
      <group position={[0, 0.02, -0.55]} rotation={[1.3, 0, 0]}>
        <mesh position={[0, 0.5, 0.02]}>
          <boxGeometry args={[1.5, 1.0, 0.04]} />
          <meshStandardMaterial color="#1a1a24" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* Glow Screen */}
        <mesh position={[0, 0.5, 0.05]}>
          <planeGeometry args={[1.4, 0.9]} />
          <meshStandardMaterial 
            color="#02000c" 
            emissive="#00f6ff" 
            emissiveIntensity={1.8} 
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

function ParticleNetwork() {
  const count = 250;
  const meshRef = useRef();

  const [positions, speeds] = useMemo(() => {
    const pos = [];
    const spd = [];
    for (let i = 0; i < count; i++) {
      pos.push((Math.random() - 0.5) * 8); // X
      pos.push((Math.random() - 0.5) * 6); // Y
      pos.push((Math.random() - 0.5) * 6); // Z
      spd.push(0.005 + Math.random() * 0.015);
    }
    return [new Float32Array(pos), spd];
  }, []);

  useFrame(() => {
    const geo = meshRef.current.geometry;
    const posArr = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += speeds[i]; // Move Y up
      if (posArr[i * 3 + 1] > 3) {
        posArr[i * 3 + 1] = -3;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position"
          args={[positions, 3]} 
        />
      </bufferGeometry>
      <PointMaterial 
        color="#00f6ff"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
}

function FloatingPanels() {
  const panelRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    panelRef.current.rotation.y = t * 0.05;
  });

  return (
    <group ref={panelRef}>
      {/* Panel 1 */}
      <mesh position={[-2.2, 1.2, -1]} rotation={[0, 0.4, 0.1]}>
        <planeGeometry args={[1.2, 0.6]} />
        <meshPhysicalMaterial 
          color="#d200ff"
          transparent
          opacity={0.2}
          roughness={0.1}
          metalness={0.1}
          transmission={0.8}
        />
      </mesh>
      {/* Panel 2 */}
      <mesh position={[2.2, 1.0, -1.2]} rotation={[0, -0.4, -0.1]}>
        <planeGeometry args={[1.0, 0.5]} />
        <meshPhysicalMaterial 
          color="#00d2ff"
          transparent
          opacity={0.2}
          roughness={0.1}
          metalness={0.1}
          transmission={0.8}
        />
      </mesh>
    </group>
  );
}

// Camera Mouse Parallax
function ParallaxCamera() {
  const { camera } = useThree();
  useFrame((state) => {
    const x = state.pointer.x * 0.8;
    const y = state.pointer.y * 0.8;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, x, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, y + 0.5, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function HeroWorkspace() {
  return (
    <div className="w-full h-full min-h-[450px] relative">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <pointLight position={[0, 1, 1]} color="#00f6ff" intensity={2} />

        <BrainNode position={[0, 0.6, 0]} color="#d200ff" />
        <FloatingResumeMesh />
        <LaptopMesh />
        <ParticleNetwork />
        <FloatingPanels />
        <Stars radius={100} depth={50} count={300} factor={4} saturation={0} fade speed={1.5} />
        <ParallaxCamera />
      </Canvas>
    </div>
  );
}

// ----------------------------------------------------
// 2. RESUME SCANNER SCENE (Resume Page Scanner)
// Includes: Floating doc and a moving cyan scanner bar.
// ----------------------------------------------------

function ResumeScannerMesh() {
  const docRef = useRef();
  const beamRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    docRef.current.position.y = Math.sin(t * 1.5) * 0.15;
    docRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    
    // Move scanning laser beam up & down
    const beamY = Math.sin(t * 2) * 0.8;
    beamRef.current.position.y = beamY;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Floating Document */}
      <mesh ref={docRef}>
        <boxGeometry args={[1.2, 1.7, 0.04]} />
        <meshPhysicalMaterial 
          color="#0e0c26"
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.8}
          clearcoat={1.0}
        />
        {/* Mock text lines on document */}
        <mesh position={[0, 0.5, 0.021]}>
          <planeGeometry args={[0.9, 0.05]} />
          <meshBasicMaterial color="#d200ff" />
        </mesh>
        <mesh position={[-0.1, 0.2, 0.021]}>
          <planeGeometry args={[0.7, 0.04]} />
          <meshBasicMaterial color="#00f6ff" />
        </mesh>
        <mesh position={[0, -0.1, 0.021]}>
          <planeGeometry args={[0.9, 0.04]} />
          <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
        <mesh position={[-0.15, -0.3, 0.021]}>
          <planeGeometry args={[0.6, 0.04]} />
          <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
      </mesh>

      {/* Laser Scanning Grid Beam */}
      <mesh ref={beamRef} position={[0, 0, 0.05]}>
        <boxGeometry args={[1.4, 0.04, 0.08]} />
        <meshStandardMaterial 
          color="#00f6ff" 
          emissive="#00f6ff" 
          emissiveIntensity={5.0} 
        />
      </mesh>
    </group>
  );
}

export function ResumeScannerCanvas() {
  return (
    <div className="w-full h-full min-h-[350px]">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[0, 0, 1.5]} color="#00f6ff" intensity={3} />
        <ResumeScannerMesh />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.0} />
      </Canvas>
    </div>
  );
}

// ----------------------------------------------------
// 3. SKILL NETWORK SCENE (Role Matcher Network)
// Includes: Floating nodes, line connectors, and text tags.
// ----------------------------------------------------

function SkillNetworkMesh() {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.15;
    groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.1;
  });

  const [nodes, lines] = useMemo(() => {
    const count = 18;
    const items = [];
    // Generate nodes on a sphere
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.2;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      items.push(new THREE.Vector3(x, y, z));
    }

    const connections = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (items[i].distanceTo(items[j]) < 1.4) {
          connections.push([items[i], items[j]]);
        }
      }
    }
    return [items, connections];
  }, []);

  return (
    <group ref={groupRef}>
      {/* Node Spheres */}
      {nodes.map((pos, idx) => (
        <mesh key={idx} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial 
            color={idx % 2 === 0 ? "#00f6ff" : "#d200ff"} 
            emissive={idx % 2 === 0 ? "#00f6ff" : "#d200ff"}
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}

      {/* Connective Line Wireframe */}
      {lines.map((pts, idx) => {
        const pointsArray = [pts[0], pts[1]];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pointsArray);
        return (
          <line key={idx} geometry={lineGeo}>
            <lineBasicMaterial color="#4f46e5" opacity={0.4} transparent linewidth={1.5} />
          </line>
        );
      })}
    </group>
  );
}

export function SkillNetworkCanvas() {
  return (
    <div className="w-full h-full min-h-[350px]">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <pointLight position={[0, 0, 1.2]} color="#d200ff" intensity={2} />
        <SkillNetworkMesh />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}

// ----------------------------------------------------
// 4. ROBOT INTERVIEWER SCENE (Mock Interview Robot)
// Includes: Floating detailed metal parts, glowing visor.
// ----------------------------------------------------

function RobotInterviewerMesh() {
  const robotRef = useRef();
  const visorRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    robotRef.current.position.y = Math.sin(t * 1.2) * 0.1;
    robotRef.current.rotation.y = Math.sin(t * 0.4) * 0.15;
    
    // Visor glow breathing
    visorRef.current.material.emissiveIntensity = 2.0 + Math.sin(t * 4.0) * 0.8;
  });

  return (
    <group ref={robotRef} position={[0, -0.2, 0]}>
      {/* Robot Head Body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.9, 0.7, 0.7]} />
        <meshStandardMaterial color="#2a2935" roughness={0.2} metalness={0.9} />
      </mesh>
      
      {/* Glowing Visor (Eyes) */}
      <mesh ref={visorRef} position={[0, 0.4, 0.36]}>
        <boxGeometry args={[0.7, 0.15, 0.05]} />
        <meshStandardMaterial 
          color="#00f6ff" 
          emissive="#00f6ff" 
          emissiveIntensity={2.5} 
        />
      </mesh>

      {/* Cyber Ears */}
      <mesh position={[-0.48, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        <meshStandardMaterial color="#d200ff" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0.48, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        <meshStandardMaterial color="#d200ff" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Base neck stand */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 0.3, 16]} />
        <meshStandardMaterial color="#1f1e29" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#8e8d99" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial 
          color="#d200ff" 
          emissive="#d200ff" 
          emissiveIntensity={2} 
        />
      </mesh>
    </group>
  );
}

export function RobotInterviewerCanvas() {
  return (
    <div className="w-full h-full min-h-[350px]">
      <Canvas camera={{ position: [0, 0.3, 1.8], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} />
        <pointLight position={[-3, -3, -3]} intensity={0.3} />
        <pointLight position={[0, 0.5, 1.0]} color="#00f6ff" intensity={2} />
        <RobotInterviewerMesh />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

// ----------------------------------------------------
// 5. FLOATING ANALYTICS DASHBOARD SCENE (Dashboard)
// Includes: Floating grids, 3D bars that rise and fall.
// ----------------------------------------------------

function AnalyticsDashboardMesh() {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* 3D Wireframe Grid Floor */}
      <gridHelper args={[3, 10, '#00f6ff', '#4b5563']} position={[0, -0.6, 0]} />

      {/* Floating 3D bar chart pillars */}
      <mesh position={[-0.8, -0.1, -0.4]}>
        <boxGeometry args={[0.25, 0.8, 0.25]} />
        <meshStandardMaterial color="#00d2ff" roughness={0.1} metalness={0.8} />
      </mesh>

      <mesh position={[-0.2, 0.1, -0.2]}>
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        <meshStandardMaterial color="#d200ff" roughness={0.1} metalness={0.8} />
      </mesh>

      <mesh position={[0.4, 0.3, 0.2]}>
        <boxGeometry args={[0.25, 1.6, 0.25]} />
        <meshStandardMaterial color="#00f6ff" roughness={0.1} metalness={0.8} />
      </mesh>

      <mesh position={[1.0, -0.2, 0.4]}>
        <boxGeometry args={[0.25, 0.6, 0.25]} />
        <meshStandardMaterial color="#d200ff" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Outer spinning wireframe sphere representing data flow */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial color="#a78bfa" wireframe opacity={0.15} transparent />
      </mesh>
    </group>
  );
}

export function AnalyticsDashboardCanvas() {
  return (
    <div className="w-full h-full min-h-[350px]">
      <Canvas camera={{ position: [0, 0.8, 2.8], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 8, 3]} intensity={1.5} />
        <pointLight position={[0, 0.2, 1.0]} color="#00f6ff" intensity={2} />
        <AnalyticsDashboardMesh />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
