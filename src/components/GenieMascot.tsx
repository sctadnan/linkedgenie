'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

const PARTICLE_COUNT = 150;
const CONNECTION_DISTANCE = 1.2;
const MOUSE_ATTRACTION_RADIUS = 2.5;

function NetworkTopology() {
    const pointsRef = useRef<THREE.Points>(null);
    const linesRef = useRef<THREE.LineSegments>(null);
    const { pointer, viewport, invalidate } = useThree();

    // Generate initial completely random positions in a sphere
    const [originalPositions, positions, velocity] = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
        const velocity = new Float32Array(PARTICLE_COUNT * 3);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Random point in a sphere
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = Math.cbrt(Math.random()) * 4; // radius 4

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;

            // Small random velocity for floating effect (even though frameloop is demand, when it renders it moves slightly)
            velocity[i * 3] = (Math.random() - 0.5) * 0.01;
            velocity[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
            velocity[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
        }
        return [originalPositions, positions, velocity];
    }, []);

    useFrame((state) => {
        if (!pointsRef.current || !linesRef.current) return;

        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

        // Convert mouse pointer (-1 to 1) to world coordinates (roughly)
        const mouseX = (pointer.x * viewport.width) / 2;
        const mouseY = (pointer.y * viewport.height) / 2;
        const mouseVector = new THREE.Vector3(mouseX, mouseY, 0);

        // Arrays to hold dynamic line data
        const linePositions = [];
        const lineColors = [];
        let connections = 0;

        // Loop through all particles
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            const pos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
            const origPos = new THREE.Vector3(originalPositions[i3], originalPositions[i3 + 1], originalPositions[i3 + 2]);

            // Distance from mouse
            const distToMouse = pos.distanceTo(mouseVector);

            // Mouse Repulsion & Attraction logic (Attract close ones, natural float otherwise)
            if (distToMouse < MOUSE_ATTRACTION_RADIUS) {
                // Attract towards mouse
                pos.lerp(mouseVector, 0.05);
            } else {
                // Return to original position slowly
                pos.lerp(origPos, 0.02);
            }

            // Apply position updates
            positions[i3] = pos.x;
            positions[i3 + 1] = pos.y;
            positions[i3 + 2] = pos.z;

            // Check connections with other nodes
            for (let j = i + 1; j < PARTICLE_COUNT; j++) {
                const j3 = j * 3;
                const pos2 = new THREE.Vector3(positions[j3], positions[j3 + 1], positions[j3 + 2]);
                const dist = pos.distanceTo(pos2);

                if (dist < CONNECTION_DISTANCE) {
                    connections++;
                    linePositions.push(
                        pos.x, pos.y, pos.z,
                        pos2.x, pos2.y, pos2.z
                    );

                    // Color based on distance to mouse. Close to mouse = Purple/Pink glow. Far = dim gray.
                    const distToMouseMid = (distToMouse + pos2.distanceTo(mouseVector)) / 2;
                    let opacity = 1 - (dist / CONNECTION_DISTANCE);

                    let r, g, b;
                    if (distToMouseMid < MOUSE_ATTRACTION_RADIUS * 1.5) {
                        // Highlighted network (Pink/Purple)
                        r = 236 / 255; g = 72 / 255; b = 153 / 255; // #ec4899
                        opacity = Math.min(opacity * 2.5, 1); // Boost opacity near mouse
                    } else {
                        // Dim background network (Zinc 600)
                        r = 82 / 255; g = 82 / 255; b = 91 / 255; // #52525b
                        opacity *= 0.3; // Make background lines very faint
                    }

                    lineColors.push(r, g, b, opacity, r, g, b, opacity);
                }
            }
        }

        if (pointsRef.current) {
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // Update lines
        if (linesRef.current) {
            const lineGeo = linesRef.current.geometry as THREE.BufferGeometry;
            lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 4));
            // Needs proper blending for alpha in vertex colors
            if (linesRef.current.material) {
                (linesRef.current.material as THREE.LineBasicMaterial).transparent = true;
                (linesRef.current.material as THREE.LineBasicMaterial).vertexColors = true;
            }
        }
    });

    useEffect(() => {
        if (pointsRef.current) {
            pointsRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        }
    }, [positions]);

    return (
        <group>
            {/* The Nodes (Particles) */}
            <points ref={pointsRef}>
                <bufferGeometry />
                <pointsMaterial
                    size={0.08}
                    color="#c084fc" // Purple nodes
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                />
            </points>

            {/* The Network Connections (Lines) */}
            <lineSegments ref={linesRef}>
                <bufferGeometry />
                <lineBasicMaterial vertexColors transparent depthWrite={false} />
            </lineSegments>
        </group>
    );
}

// Wrapper component to handle the frameloop demand and mouse tracking
function InteractiveCanvas() {
    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            frameloop="demand"
            className="w-full h-full"
            onPointerMove={(e) => {
                // Invalidate context to force a re-render frame when mouse moves
                // This guarantees incredible performance when static
                if (typeof window !== 'undefined' && (window as any).__R3F_INVALIDATE) {
                    (window as any).__R3F_INVALIDATE();
                }
            }}
            onMouseLeave={() => {
                // Render one last frame when leaving to settle
                if (typeof window !== 'undefined' && (window as any).__R3F_INVALIDATE) {
                    (window as any).__R3F_INVALIDATE();
                }
            }}
        >
            <ambientLight intensity={0.5} />
            <NetworkTopologySetter />
            <NetworkTopology />
        </Canvas>
    );
}

// Helper to expose invalidate to the window object for easy access from Canvas events
function NetworkTopologySetter() {
    const { invalidate } = useThree();
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).__R3F_INVALIDATE = invalidate;
        }
    }, [invalidate]);
    return null;
}

export default function GenieMascot() {
    return (
        <div className="w-full h-[400px] md:h-[500px] relative pointer-events-auto overflow-hidden">
            {/* Gradient glow behind the network for visual depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 rounded-full blur-3xl pointer-events-none transform scale-150" />

            <InteractiveCanvas />
        </div>
    );
}
