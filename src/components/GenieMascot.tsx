'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, RoundedBox, Environment, Sparkles } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function HologramCard() {
    const cardRef = useRef<THREE.Group>(null);
    const contentRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        // Parallax hover effect
        if (cardRef.current) {
            // Smoothly rotate the card based on mouse pointer
            const targetX = (state.pointer.y * Math.PI) / 8;
            const targetY = (state.pointer.x * Math.PI) / 6;

            cardRef.current.rotation.x = THREE.MathUtils.lerp(cardRef.current.rotation.x, targetX, 0.05);
            cardRef.current.rotation.y = THREE.MathUtils.lerp(cardRef.current.rotation.y, targetY, 0.05);
        }

        // Pulse the abstract AI text lines
        if (contentRef.current) {
            const time = state.clock.getElapsedTime();
            const opacityOffset = 0.5 + Math.sin(time * 2) * 0.5;

            contentRef.current.children.forEach((child: any, index) => {
                if (child.material) {
                    // Stagger the pulsing effect for each line
                    const staggeredOpacity = 0.5 + Math.sin(time * 3 + index) * 0.5;
                    child.material.opacity = 0.4 + staggeredOpacity * 0.6;
                }
            });
        }
    });

    return (
        <group ref={cardRef}>
            <Float
                speed={2.5}
                rotationIntensity={0.2}
                floatIntensity={0.6}
            >
                {/* The Frosted Glass Card body */}
                <RoundedBox args={[2.5, 3.8, 0.1]} radius={0.15} smoothness={4} position={[0, 0, 0]}>
                    <MeshTransmissionMaterial
                        backside
                        samples={8}
                        thickness={0.5}
                        roughness={0.1}
                        transmission={1}
                        ior={1.2}
                        chromaticAberration={0.06}
                        color="#ffffff" // Clean white/glass
                    />
                </RoundedBox>

                {/* AI Holographic Processing UI (Abstract text lines representing a post) */}
                <group position={[0, 0, 0.11]} ref={contentRef}>
                    <mesh position={[-0.6, 1.2, 0]}>
                        <planeGeometry args={[0.8, 0.08]} />
                        <meshBasicMaterial color="#a855f7" transparent />
                    </mesh>
                    <mesh position={[0, 0.8, 0]}>
                        <planeGeometry args={[1.8, 0.08]} />
                        <meshBasicMaterial color="#d946ef" transparent />
                    </mesh>
                    <mesh position={[-0.1, 0.5, 0]}>
                        <planeGeometry args={[1.6, 0.08]} />
                        <meshBasicMaterial color="#3b82f6" transparent />
                    </mesh>
                    <mesh position={[-0.4, 0.2, 0]}>
                        <planeGeometry args={[1.0, 0.08]} />
                        <meshBasicMaterial color="#8b5cf6" transparent />
                    </mesh>

                    {/* Abstract AI Avatar / Brain icon bottom right */}
                    <mesh position={[0.7, -1.3, 0]}>
                        <circleGeometry args={[0.25, 32]} />
                        <meshBasicMaterial color="#ec4899" transparent opacity={0.8} />
                    </mesh>
                </group>

                {/* Subtle Magic Sparkles around the card */}
                <Sparkles
                    count={40}
                    scale={4}
                    size={3}
                    speed={0.4}
                    opacity={0.3}
                    color="#c084fc"
                />
            </Float>
        </group>
    );
}

export default function GenieMascot() {
    return (
        <div className="w-full h-[400px] md:h-[500px] relative pointer-events-auto">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} className="w-full h-full">
                <Suspense fallback={null}>
                    <ambientLight intensity={1} />
                    <directionalLight position={[2, 5, 2]} intensity={2} color="#ffffff" />

                    {/* HDRI Environment mapping makes the glass material look highly realistic */}
                    <Environment preset="city" />

                    <HologramCard />
                </Suspense>
            </Canvas>
        </div>
    );
}
