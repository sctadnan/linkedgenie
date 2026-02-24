'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, RoundedBox, Environment, Sparkles } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function LiquidCrystalCard() {
    const cardRef = useRef<THREE.Group>(null);
    const contentRef = useRef<THREE.Group>(null);
    const orbRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        // Heavy, luxurious parallax tilt
        if (cardRef.current) {
            const targetX = (state.pointer.y * Math.PI) / 8;
            const targetY = (state.pointer.x * Math.PI) / 6;
            cardRef.current.rotation.x = THREE.MathUtils.lerp(cardRef.current.rotation.x, targetX, 0.05);
            cardRef.current.rotation.y = THREE.MathUtils.lerp(cardRef.current.rotation.y, targetY, 0.05);
        }

        // Liquid breathing effect for the inner components
        if (contentRef.current && orbRef.current) {
            const time = state.clock.getElapsedTime();

            // Subtle floating of inner capsules
            contentRef.current.children.forEach((child, index) => {
                if (child !== orbRef.current) {
                    child.position.y += Math.sin(time * 2 + index) * 0.001;
                }
            });

            // Make the AI core orb float and pulse with iridescence
            orbRef.current.position.y = -1.0 + Math.sin(time * 2.5) * 0.08;
            orbRef.current.rotation.x = time * 0.5;
            orbRef.current.rotation.y = time * 0.5;

            // Dynamically shift the iridescence color of the orb
            if (orbRef.current.material) {
                // Changing the emissive slightly or just letting the physical properties shine
                (orbRef.current.material as THREE.MeshPhysicalMaterial).iridescenceThicknessRange = [100, 400 + Math.sin(time) * 300];
            }
        }
    });

    return (
        <group ref={cardRef}>
            <Float
                speed={2}
                rotationIntensity={0.2}
                floatIntensity={0.6}
            >
                {/* 1. The Main Liquid Crystal Body */}
                <RoundedBox args={[2.8, 4.0, 0.3]} radius={0.2} smoothness={16} position={[0, 0, 0]}>
                    <MeshTransmissionMaterial
                        backside
                        samples={8} // optimize
                        thickness={1.5} // massive thickness for liquid light bending
                        roughness={0.05}
                        transmission={1}
                        ior={1.4} // Water/crystal IOR
                        chromaticAberration={0.08}
                        distortion={0.2} // Distorts the background like liquid
                        distortionScale={0.3}
                        temporalDistortion={0.15} // Liquid moves internally over time
                        color="#ffffff"
                    />
                </RoundedBox>

                {/* 2. Layered 3D Inner Components (Liquid Gel Pills) */}
                <group position={[0, 0, 0.35]} ref={contentRef}>

                    {/* Top Row - Purple Capsule */}
                    <mesh position={[-0.4, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <capsuleGeometry args={[0.1, 1.2, 16, 32]} />
                        <meshPhysicalMaterial
                            color="#a855f7"
                            transmission={0.9}
                            ior={1.8}
                            thickness={0.5}
                            roughness={0.1}
                            clearcoat={1}
                        />
                    </mesh>

                    {/* Middle Row - Fuchsia Capsule */}
                    <mesh position={[0.2, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <capsuleGeometry args={[0.1, 2.0, 16, 32]} />
                        <meshPhysicalMaterial
                            color="#d946ef"
                            transmission={0.9}
                            ior={1.8}
                            thickness={0.5}
                            roughness={0.1}
                            clearcoat={1}
                        />
                    </mesh>

                    {/* Bottom Row - Blue Capsule */}
                    <mesh position={[-0.1, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <capsuleGeometry args={[0.1, 1.6, 16, 32]} />
                        <meshPhysicalMaterial
                            color="#3b82f6"
                            transmission={0.9}
                            ior={1.8}
                            thickness={0.5}
                            roughness={0.1}
                            clearcoat={1}
                        />
                    </mesh>

                    {/* The AI Liquid Core Orb (Bottom Right) */}
                    <mesh position={[0.6, -1.0, 0.2]} ref={orbRef}>
                        <icosahedronGeometry args={[0.35, 12]} /> {/* Sphere-like geometry with facet reflections */}
                        <meshPhysicalMaterial
                            color="#f472b6"
                            transmission={1}
                            ior={2.4} // Diamond level refraction
                            thickness={1.5}
                            roughness={0.02}
                            clearcoat={1}
                            iridescence={1} // Pearlescent shiny coating
                            iridescenceIOR={1.5}
                        />
                    </mesh>

                    {/* Accents - Small liquid droplets */}
                    <mesh position={[-0.8, -1.0, 0.1]}>
                        <sphereGeometry args={[0.1, 32, 32]} />
                        <meshPhysicalMaterial color="#60a5fa" transmission={1} ior={1.5} thickness={0.5} roughness={0} />
                    </mesh>
                    <mesh position={[-0.5, -1.2, 0.15]}>
                        <sphereGeometry args={[0.06, 32, 32]} />
                        <meshPhysicalMaterial color="#c084fc" transmission={1} ior={1.5} thickness={0.5} roughness={0} />
                    </mesh>

                </group>

                {/* Magic Ambient Dust */}
                <Sparkles
                    count={30}
                    scale={5}
                    size={4}
                    speed={0.2}
                    opacity={0.4}
                    color="#f0abfc"
                />
            </Float>
        </group>
    );
}

export default function GenieMascot() {
    return (
        <div className="w-full h-[400px] md:h-[500px] relative pointer-events-auto">
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }} className="w-full h-full">
                <Suspense fallback={null}>
                    <ambientLight intensity={1.5} />
                    {/* Colorful spot lights to bounce inside the liquid glass */}
                    <spotLight position={[5, 5, 5]} intensity={50} color="#a855f7" distance={20} />
                    <spotLight position={[-5, -5, -5]} intensity={30} color="#3b82f6" distance={20} />

                    {/* HDRI Environment mapping makes the glass material look highly realistic */}
                    <Environment preset="city" />

                    <LiquidCrystalCard />
                </Suspense>
            </Canvas>
        </div>
    );
}
