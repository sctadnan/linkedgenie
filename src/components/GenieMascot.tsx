'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Sphere, MeshTransmissionMaterial } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function InteractiveCore() {
    const meshRef = useRef<THREE.Group>(null);
    const materialRef = useRef<any>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Smoothly track mouse pointer coordinates (x: -1 to 1, y: -1 to 1)
            const targetX = (state.pointer.x * Math.PI) / 3;
            const targetY = (state.pointer.y * Math.PI) / 3;

            // Lerp rotation to smoothly follow mouse
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetY, delta * 4);
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX, delta * 4);

            // Basic idle rotation for the Z axis
            meshRef.current.rotation.z += delta * 0.15;
        }

        // Dynamically change color based on mouse distance from center
        if (materialRef.current) {
            const distance = Math.sqrt(state.pointer.x ** 2 + state.pointer.y ** 2);
            const targetColor = new THREE.Color().lerpColors(
                new THREE.Color("#8b5cf6"), // Neutral purple
                new THREE.Color("#ec4899"), // Hyper-active pink
                Math.min(distance * 1.5, 1) // Clamp between 0 and 1
            );
            // Smoothly interpolate the current material color toward the target color
            materialRef.current.color.lerp(targetColor, delta * 4);
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={1} floatingRange={[-0.1, 0.1]}>
            <group ref={meshRef}>
                {/* Complex Geometric Core (AI knot) */}
                <mesh>
                    <torusKnotGeometry args={[1.2, 0.35, 128, 32]} />
                    <MeshTransmissionMaterial
                        ref={materialRef}
                        attach="material"
                        transmission={0.95}
                        thickness={2.0}
                        roughness={0.05}
                        ior={1.6}
                        chromaticAberration={0.06}
                    />
                </mesh>

                {/* Inner Energy Sphere */}
                <Sphere args={[0.5, 32, 32]}>
                    <meshBasicMaterial color="#ffffff" />
                </Sphere>
                <pointLight intensity={3} color="#fbcfe8" distance={6} />
            </group>
        </Float>
    );
}

export default function GenieMascot() {
    return (
        <div className="w-full h-[400px] md:h-[500px] relative pointer-events-auto cursor-crosshair">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1.5} />
                <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

                <InteractiveCore />

                {/* Pre-baked environment lighting is essential for MeshTransmissionMaterial to refract something */}
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
