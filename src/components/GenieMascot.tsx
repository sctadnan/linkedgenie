'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const NODE_COUNT = 35; // Fewer nodes because they are larger profile pictures
const CONNECTION_DISTANCE = 2.5;
const MOUSE_ATTRACTION_RADIUS = 3.0;

// Reliable avatar URLs for the demo
const AVATAR_URLS = [
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/men/46.jpg',
    'https://randomuser.me/api/portraits/women/12.jpg',
    'https://randomuser.me/api/portraits/men/90.jpg',
    'https://randomuser.me/api/portraits/women/33.jpg',
    'https://randomuser.me/api/portraits/men/22.jpg',
];

function NetworkNodes() {
    const groupRef = useRef<THREE.Group>(null);
    const linesRef = useRef<THREE.LineSegments>(null);
    const { pointer, viewport } = useThree();

    // Load textures
    const textures = useTexture(AVATAR_URLS);

    // Ensure textures are rendered beautifully (sRGB, smooth filtering)
    useEffect(() => {
        textures.forEach(t => {
            t.colorSpace = THREE.SRGBColorSpace;
            t.generateMipmaps = true;
            t.minFilter = THREE.LinearMipmapLinearFilter;
        });
    }, [textures]);

    // Generate initial completely random positions and metadata for each node
    const nodes = useMemo(() => {
        const temp = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            // Random point in a sphere
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = Math.cbrt(Math.random()) * 5; // spread radius

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            temp.push({
                id: i,
                pos: new THREE.Vector3(x, y, z),
                origPos: new THREE.Vector3(x, y, z),
                textureIndex: Math.floor(Math.random() * AVATAR_URLS.length),
                // Slight offset size for variety
                size: 0.2 + (Math.random() * 0.1)
            });
        }
        return temp;
    }, []);

    useFrame(() => {
        if (!groupRef.current || !linesRef.current) return;

        // Convert mouse pointer (-1 to 1) to world coordinates (roughly)
        const mouseX = (pointer.x * viewport.width) / 2;
        const mouseY = (pointer.y * viewport.height) / 2;
        const mouseVector = new THREE.Vector3(mouseX, mouseY, 0);

        // Arrays to hold dynamic line data
        const linePositions = [];
        const lineColors = [];

        // Update Node Positions
        nodes.forEach((node, i) => {
            const distToMouse = node.pos.distanceTo(mouseVector);

            // Mouse Interaction: Pull towards mouse if close, else drift back to original pos
            if (distToMouse < MOUSE_ATTRACTION_RADIUS) {
                node.pos.lerp(mouseVector, 0.03); // gentle pull
            } else {
                node.pos.lerp(node.origPos, 0.015); // gentle return
            }

            // Sync the actual mesh position
            const mesh = groupRef.current!.children[i] as THREE.Mesh;
            mesh.position.copy(node.pos);

            // Make the circle face the camera always (Billboard effect)
            mesh.quaternion.copy(groupRef.current!.parent!.quaternion).invert();
        });

        // Calculate Connections
        for (let i = 0; i < NODE_COUNT; i++) {
            const nodeA = nodes[i];
            for (let j = i + 1; j < NODE_COUNT; j++) {
                const nodeB = nodes[j];
                const dist = nodeA.pos.distanceTo(nodeB.pos);

                if (dist < CONNECTION_DISTANCE) {
                    linePositions.push(
                        nodeA.pos.x, nodeA.pos.y, nodeA.pos.z,
                        nodeB.pos.x, nodeB.pos.y, nodeB.pos.z
                    );

                    // Line opacity and color logic based on proximity to mouse
                    const distToMouseMid = (nodeA.pos.distanceTo(mouseVector) + nodeB.pos.distanceTo(mouseVector)) / 2;
                    let opacity = 1 - (dist / CONNECTION_DISTANCE);

                    let r, g, b;
                    if (distToMouseMid < MOUSE_ATTRACTION_RADIUS * 1.5) {
                        // Active professional connection (Blue/Purple)
                        r = 99 / 255; g = 102 / 255; b = 241 / 255; // #6366f1 (Indigo)
                        opacity = Math.min(opacity * 2.0, 0.8);
                    } else {
                        // Inactive/Distanced connection
                        r = 82 / 255; g = 82 / 255; b = 91 / 255; // #52525b (Zinc)
                        opacity *= 0.2;
                    }

                    lineColors.push(r, g, b, opacity, r, g, b, opacity);
                }
            }
        }

        // Update Lines BufferGeometry
        const lineGeo = linesRef.current.geometry as THREE.BufferGeometry;
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 4));
        if (linesRef.current.material) {
            (linesRef.current.material as THREE.LineBasicMaterial).transparent = true;
            (linesRef.current.material as THREE.LineBasicMaterial).vertexColors = true;
            (linesRef.current.material as THREE.LineBasicMaterial).depthWrite = false;
        }
    });

    return (
        <group>
            {/* The Nodes (Profile Pictures) */}
            <group ref={groupRef}>
                {nodes.map((node) => (
                    <mesh key={node.id} position={node.pos}>
                        <circleGeometry args={[node.size, 32]} />
                        <meshBasicMaterial
                            map={textures[node.textureIndex]}
                            transparent
                            side={THREE.DoubleSide}
                        />
                        {/* Optional subtle ring around the profile pic */}
                        <mesh position={[0, 0, -0.01]}>
                            <circleGeometry args={[node.size + 0.02, 32]} />
                            <meshBasicMaterial color="#3f3f46" />
                        </mesh>
                    </mesh>
                ))}
            </group>

            {/* The Network Connections (Lines) */}
            <lineSegments ref={linesRef}>
                <bufferGeometry />
                <lineBasicMaterial vertexColors transparent depthWrite={false} linewidth={1} />
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
                if (typeof window !== 'undefined' && (window as any).__R3F_INVALIDATE) {
                    (window as any).__R3F_INVALIDATE();
                }
            }}
            onMouseLeave={() => {
                if (typeof window !== 'undefined' && (window as any).__R3F_INVALIDATE) {
                    (window as any).__R3F_INVALIDATE();
                }
            }}
        >
            <ambientLight intensity={1} />
            <NetworkTopologySetter />
            <NetworkNodes />
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
        <div className="w-full h-[400px] md:h-[500px] relative pointer-events-auto">
            {/* Removed the background gradient to perfectly match the site's dark aesthetic */}
            <InteractiveCanvas />
        </div>
    );
}
