'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function GyroscopeRings() {
    const groupRef = useRef<THREE.Group>(null);
    const ring1 = useRef<THREE.Mesh>(null);
    const ring2 = useRef<THREE.Mesh>(null);
    const ring3 = useRef<THREE.Mesh>(null);
    const core = useRef<THREE.Mesh>(null);

    // Materials created once to save memory
    const materials = useMemo(() => {
        return {
            ring: new THREE.MeshStandardMaterial({
                color: '#8b5cf6', // Violet
                roughness: 0.1,
                metalness: 0.9,
                transparent: true,
                opacity: 0.8,
            }),
            core: new THREE.MeshBasicMaterial({
                color: '#d946ef', // Fuchsia glow
                wireframe: true,
            }),
            coreSolid: new THREE.MeshStandardMaterial({
                color: '#c084fc',
                roughness: 0.2,
                metalness: 0.8,
            })
        };
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Continuous rotation for each ring (Gyroscope effect)
        if (ring1.current) ring1.current.rotation.x = time * 0.3;
        if (ring2.current) {
            ring2.current.rotation.y = time * 0.4;
            ring2.current.rotation.z = time * 0.1;
        }
        if (ring3.current) {
            ring3.current.rotation.x = time * 0.5;
            ring3.current.rotation.y = time * 0.5;
        }

        // Pulse the core slightly
        if (core.current) {
            const scale = 1 + Math.sin(time * 3) * 0.08;
            core.current.scale.set(scale, scale, scale);
            core.current.rotation.y = time * 0.5;
            core.current.rotation.x = time * 0.2;
        }

        // Mouse Parallax Effect on the whole group
        if (groupRef.current) {
            // Target rotations based on mouse pointer (-1 to 1)
            // Limit the tilt angle for elegance
            const targetX = (state.pointer.y * Math.PI) / 6;
            const targetY = (state.pointer.x * Math.PI) / 6;

            // Smoothly interpolate to target rotation using Lerp
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.05);
        }
    });

    return (
        <group ref={groupRef}>
            {/* The AI Core (Geodesic Sphere) */}
            <group ref={core}>
                {/* Inner solid core */}
                <mesh material={materials.coreSolid}>
                    <icosahedronGeometry args={[0.5, 1]} />
                </mesh>
                {/* Outer wireframe glow */}
                <mesh material={materials.core} scale={1.2}>
                    <icosahedronGeometry args={[0.5, 1]} />
                </mesh>
            </group>

            {/* Inner Ring */}
            <mesh ref={ring3} material={materials.ring}>
                <torusGeometry args={[1.2, 0.02, 16, 100]} />
            </mesh>

            {/* Middle Ring */}
            <mesh ref={ring2} material={materials.ring} rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[1.8, 0.03, 16, 100]} />
            </mesh>

            {/* Outer Ring */}
            <mesh ref={ring1} material={materials.ring} rotation={[0, Math.PI / 4, 0]}>
                <torusGeometry args={[2.5, 0.04, 16, 100]} />
            </mesh>
        </group>
    );
}

export default function GenieMascot() {
    return (
        <div className="w-full h-[400px] md:h-[500px] relative pointer-events-auto overflow-visible">
            {/* Canvas for 3D AI Core Gyroscope */}
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }} className="w-full h-full">
                <ambientLight intensity={0.4} />

                {/* Strategic dramatic lighting to highlight the metallic rings */}
                <directionalLight position={[5, 5, 5]} intensity={2} color="#a855f7" /> {/* Purple top light */}
                <directionalLight position={[-5, -5, -2]} intensity={1} color="#3b82f6" /> {/* Blue rim light */}
                <pointLight position={[0, 0, 0]} intensity={2} color="#f0abfc" distance={5} /> {/* Core inner light */}

                <GyroscopeRings />
            </Canvas>
        </div>
    );
}
