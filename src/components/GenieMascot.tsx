'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment, Icosahedron } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function MagicCrystal() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    // Rotate the crystal slowly
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    return (
        <Float
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={1.5}
            floatingRange={[-0.2, 0.2]}
        >
            {/* The Outer Glass Crystal */}
            <Icosahedron
                ref={meshRef}
                args={[1.5, 0]} // radius 1.5, detail 0 for low-poly crystal aesthetic
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                scale={hovered ? 1.1 : 1}
                position={[0, 0, 0]}
            >
                <MeshTransmissionMaterial
                    attach="material"
                    color={hovered ? "#f472b6" : "#c084fc"} // Pinkish/Purple tint
                    transmission={0.95} // High transmission for glass look
                    thickness={1.5}     // Refraction thickness
                    roughness={0.1}     // Slight frosting
                    ior={1.5}           // Index of refraction equivalent to glass
                    chromaticAberration={0.05} // Subtle rainbow edges
                />
            </Icosahedron>

            {/* Inner Glowing Core */}
            <mesh scale={hovered ? 0.6 : 0.4} position={[0, 0, 0]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color={hovered ? "#ec4899" : "#6366f1"} />
            </mesh>

            {/* Intense Light emitted from the core */}
            <pointLight position={[0, 0, 0]} intensity={hovered ? 3 : 2} color={hovered ? "#fbcfe8" : "#818cf8"} distance={5} />
        </Float>
    );
}

export default function GenieMascot() {
    return (
        <div className="w-full h-[400px] md:h-[500px] relative pointer-events-auto">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1.5} />
                <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

                <MagicCrystal />

                {/* Pre-baked environment lighting is essential for MeshTransmissionMaterial to refract something */}
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
