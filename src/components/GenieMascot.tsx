'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, RoundedBox, Environment, Sparkles } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

// An animated line that grows from left to right simulating AI typing text
function AnimatedTypingLine({
    position,
    width,
    color,
    delay = 0,
    speed = 1
}: {
    position: [number, number, number],
    width: number,
    color: string,
    delay?: number,
    speed?: number
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame((state) => {
        if (!meshRef.current || !materialRef.current) return;

        const time = state.clock.getElapsedTime();
        // A complete cycle of typing (e.g., 5 seconds)
        const cycleLength = 5;
        const localTime = (time * speed - delay) % cycleLength;
        // Ensure positive modulo
        const cycle = localTime < 0 ? localTime + cycleLength : localTime;

        let scaleX = 0;
        let opacity = 0;

        if (cycle > 0 && cycle < 2) {
            // Typing out (growing)
            const progress = cycle / 2;
            // cubic ease-out for natural typing burst speed
            scaleX = 1 - Math.pow(1 - progress, 3);
            opacity = 0.8;
        } else if (cycle >= 2 && cycle < 4) {
            // Hold the filled line
            scaleX = 1;
            opacity = 0.8;
        } else {
            // Fade out / Reset state
            scaleX = 0.01;
            opacity = 0;
        }

        const currentWidth = Math.max(0.01, width * scaleX);
        meshRef.current.scale.x = currentWidth;

        // Critical: To make it grow from the left, we must shift the X position
        // half the amount it grew from the center constraint.
        const leftOriginX = position[0] - (width / 2);
        meshRef.current.position.x = leftOriginX + (currentWidth / 2);

        materialRef.current.opacity = opacity;
    });

    return (
        <mesh position={position} ref={meshRef}>
            {/* Using BoxGeometry so scaling X doesn't warp rounded corners as badly as capsules */}
            <boxGeometry args={[1, 0.08, 0.02]} />
            <meshBasicMaterial ref={materialRef} color={color} transparent opacity={0.8} />
        </mesh>
    );
}

function AppleGlassWidget() {
    const cardRef = useRef<THREE.Group>(null);
    const siriOrbRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        // Subtle Parallax tilt based on mouse pointer
        if (cardRef.current) {
            const targetX = (state.pointer.y * Math.PI) / 8;
            const targetY = (state.pointer.x * Math.PI) / 6;
            cardRef.current.rotation.x = THREE.MathUtils.lerp(cardRef.current.rotation.x, targetX, 0.05);
            cardRef.current.rotation.y = THREE.MathUtils.lerp(cardRef.current.rotation.y, targetY, 0.05);
        }

        // Rotate and distort the "Apple Intelligence" Siri Orb
        if (siriOrbRef.current) {
            const time = state.clock.getElapsedTime();
            siriOrbRef.current.rotation.y = time;
            siriOrbRef.current.rotation.x = time * 0.5;
            // Scale pulsing
            const scale = 1 + Math.sin(time * 3) * 0.05;
            siriOrbRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group ref={cardRef}>
            <Float
                speed={2}
                rotationIntensity={0.1}
                floatIntensity={0.5}
            >
                {/* 1. The Main iOS Frosted Glass Panel */}
                {/* Generous radius for that iPhone app widget look */}
                <RoundedBox args={[3.2, 4.2, 0.1]} radius={0.4} smoothness={16} position={[0, 0, 0]}>
                    <MeshTransmissionMaterial
                        backside
                        samples={16} // High quality glass
                        thickness={0.2} // Thin, elegant glass pane
                        roughness={0.25} // Frosted look (Sandblasted glass)
                        transmission={1}
                        ior={1.3} // Standard glass IOR
                        clearcoat={1} // Glossy surface layer like an iPhone screen
                        clearcoatRoughness={0.1}
                        color="#ffffff" // Crisp white frost
                    />
                </RoundedBox>

                {/* 2. Inner UI Elements (Foreground of the Glass) */}
                <group position={[0, 0, 0.1]}>

                    {/* The "Apple Intelligence" glowing liquid orb (Top Left) */}
                    <mesh position={[-0.8, 1.3, 0.1]} ref={siriOrbRef}>
                        <icosahedronGeometry args={[0.3, 16]} />
                        <MeshTransmissionMaterial
                            color="#c084fc"
                            transmission={1}
                            roughness={0}
                            ior={2}
                            thickness={1}
                            distortion={0.5}
                            temporalDistortion={0.5} // Liquid blob effect
                            clearcoat={1}
                        />
                        {/* Inner glowing core for the orb */}
                        <mesh scale={0.6}>
                            <sphereGeometry args={[0.3, 16, 16]} />
                            <meshBasicMaterial color="#ec4899" />
                        </mesh>
                    </mesh>

                    {/* Headline Loader (Short, bold) */}
                    <mesh position={[0.2, 1.3, 0]}>
                        <boxGeometry args={[1.2, 0.12, 0.02]} />
                        <meshBasicMaterial color="#cbd5e1" transparent opacity={0.6} />
                    </mesh>

                    {/* Divider Line */}
                    <mesh position={[0, 0.9, 0]}>
                        <planeGeometry args={[2.6, 0.02]} />
                        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.3} />
                    </mesh>

                    {/* AI Generation Typed Lines */}
                    <AnimatedTypingLine
                        position={[0, 0.5, 0]} width={2.4} color="#a855f7" delay={0} speed={1.2}
                    />
                    <AnimatedTypingLine
                        position={[-0.2, 0.1, 0]} width={2.0} color="#d946ef" delay={0.6} speed={1.2}
                    />
                    <AnimatedTypingLine
                        position={[0.1, -0.3, 0]} width={2.6} color="#3b82f6" delay={1.2} speed={1.2}
                    />
                    <AnimatedTypingLine
                        position={[-0.5, -0.7, 0]} width={1.4} color="#8b5cf6" delay={1.8} speed={1.2}
                    />

                    {/* 'Generating...' status pill indicator (Bottom) */}
                    <RoundedBox args={[1.2, 0.25, 0.02]} radius={0.1} smoothness={4} position={[0, -1.4, 0]}>
                        <meshBasicMaterial color="#f0abfc" transparent opacity={0.8} />
                    </RoundedBox>
                </group>

                {/* Ambient Apple/Siri colored aura floating around */}
                <Sparkles
                    count={20}
                    scale={5}
                    size={6}
                    speed={0.1}
                    opacity={0.3}
                    color="#e0e7ff"
                />
            </Float>
        </group>
    );
}

export default function GenieMascot() {
    return (
        <div className="w-full h-[400px] md:h-[500px] relative pointer-events-auto">
            {/* Removed the background gradient to let the Frost Glass blur the site's natural background */}
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }} className="w-full h-full">
                <Suspense fallback={null}>
                    <ambientLight intensity={1.5} />

                    {/* Clean white directional lights for that Apple minimalist lighting */}
                    <directionalLight position={[5, 10, 5]} intensity={3} color="#ffffff" />
                    <directionalLight position={[-5, -5, 5]} intensity={1} color="#f8fafc" />

                    {/* HDRI Environment mapping makes the glass material look highly realistic */}
                    <Environment preset="city" />

                    <AppleGlassWidget />
                </Suspense>
            </Canvas>
        </div>
    );
}
