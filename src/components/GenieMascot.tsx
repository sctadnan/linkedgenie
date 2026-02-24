'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function MagicOrb() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    // Rotate the orb slowly
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    return (
        <Float
            speed={2} // Animation speed, defaults to 1
            rotationIntensity={0.5} // XYZ rotation intensity, defaults to 1
            floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
            floatingRange={[-0.1, 0.1]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
        >
            <mesh
                ref={meshRef}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                scale={hovered ? 1.1 : 1}
                position={[0, 0, 0]}
            >
                <sphereGeometry args={[1.5, 64, 64]} />
                <MeshDistortMaterial
                    color={hovered ? "#ec4899" : "#8b5cf6"} // Pink on hover, Purple default
                    attach="material"
                    distort={0.4} // Amount of distortion
                    speed={2} // Speed of distortion movement
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            {/* Core glowing light inside the orb */}
            <pointLight position={[0, 0, 0]} intensity={hovered ? 2 : 1.5} color={hovered ? "#f472b6" : "#a78bfa"} distance={4} />
        </Float>
    );
}

export default function GenieMascot() {
    return (
        <div className="w-full h-[400px] md:h-[500px] relative">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

                <MagicOrb />

                {/* Pre-baked environment lighting for realistic reflections without heavy computation */}
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
