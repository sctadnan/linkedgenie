'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, RoundedBox, Environment, Sparkles, Text } from '@react-three/drei';
import { useRef, Suspense, useState, useMemo } from 'react';
import * as THREE from 'three';

// Real examples of LinkedIn posts to cycle through
const POSTS = [
    `🚀 How I scaled my SaaS to $10K MRR in 30 days.

Most founders overcomplicate growth.
They build features nobody asked for.
They ignore product-market fit.

Here is my 3-step proven framework:

1. Find a bleeding neck problem.
2. Build a scrappy MVP in 48 hours.
3. Cold outreach to 100 ideal targets.

Don't overthink it. Just execute. 💡`,

    `I've reviewed 500+ LinkedIn profiles.
99% of them make this ONE fatal mistake:

Treating their profile like a resume.

Your profile is a landing page.
Your headline is the value prop.
Your about section is the sales copy.

Stop listing daily tasks.
Start selling real outcomes. 📈`,

    `The algorithm doesn't hate you.
Your hooks are just weak.

A great post with a bad hook is invisible.

Try this framework tomorrow:
[Achievement] without [Common Pain]

Example:
"How I hit 10k followers without 
posting 5x a day."

Steal this. Watch your metrics explode. 💥`
];

function TypingText({ position }: { position: [number, number, number] }) {
    const textRef = useRef<any>(null);
    const [textIndex, setTextIndex] = useState(0);

    // Using a ref for the index to avoid re-renders in useFrame
    const currentPost = POSTS[textIndex];

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const cycleLength = 14; // 14 seconds per post cycle
        const cycle = time % cycleLength;

        const typingDuration = 8; // Takes 8 seconds to type the post completely
        const holdDuration = 4;   // User reads it for 4 seconds

        let charsToShow = 0;
        let showCursor = false;
        let opacity = 1;

        if (cycle < typingDuration) {
            // Typing phase: ease the speed slightly, but mostly linear
            const progress = cycle / typingDuration;
            charsToShow = Math.floor(progress * currentPost.length);
            showCursor = true;
        } else if (cycle < typingDuration + holdDuration) {
            // Hold phase (fully typed)
            charsToShow = currentPost.length;
            // Blink cursor twice a second
            showCursor = Math.floor(time * 2) % 2 === 0;
        } else {
            // Fade out phase
            charsToShow = currentPost.length;
            const fadeProgress = (cycle - (typingDuration + holdDuration)) / 2; // 2 seconds to fade out
            opacity = Math.max(0, 1 - fadeProgress);
            showCursor = false;

            // Switch to next text precisely when fully invisible to avoid flash
            if (fadeProgress > 0.95 && fadeProgress < 1.0) {
                // Determine next index safely
                const nextIdx = Math.floor((time / cycleLength) + 1) % POSTS.length;
                if (textIndex !== nextIdx) {
                    setTextIndex(nextIdx);
                }
            }
        }

        if (textRef.current) {
            // Add the block cursor at the end
            textRef.current.text = currentPost.substring(0, charsToShow) + (showCursor ? "█" : "");
            textRef.current.fillOpacity = opacity;
        }
    });

    return (
        <Text
            ref={textRef}
            position={position}
            fontSize={0.11}
            maxWidth={2.2}
            lineHeight={1.4}
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeA.woff"
            color="#cbd5e1" // Slate-300 for premium readability on frosted glass
            anchorX="left"
            anchorY="top"
        >
            {/* Initial empty state before useFrame takes over */}
            {""}
        </Text>
    );
}

function AIContentGlassWidget() {
    const cardRef = useRef<THREE.Group>(null);
    const aiCoreRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    // Responsive scaling for mobile devices
    // Our widget's base width is roughly 3.0 units.
    // If the mobile viewport width drops below 3.5, we scale down everything.
    const responsiveScale = Math.min(1, viewport.width / 3.5);

    useFrame((state) => {
        // High-end smooth Parallax tilt - reduced intensity on mobile to prevent clipping
        if (cardRef.current) {
            const tiltFactor = responsiveScale < 1 ? 0.05 : 0.1; // Less tilt on mobile
            const targetX = (state.pointer.y * Math.PI) * tiltFactor;
            const targetY = (state.pointer.x * Math.PI) * (tiltFactor * 1.5);
            cardRef.current.rotation.x = THREE.MathUtils.lerp(cardRef.current.rotation.x, targetX, 0.05);
            cardRef.current.rotation.y = THREE.MathUtils.lerp(cardRef.current.rotation.y, targetY, 0.05);
        }

        // Spin and pulse the AI Generation Core indicator
        if (aiCoreRef.current) {
            const time = state.clock.getElapsedTime();
            aiCoreRef.current.rotation.y = time;
            aiCoreRef.current.rotation.x = time * 0.5;

            // Pulse scale to sync with generation
            const scale = 1 + Math.sin(time * 5) * 0.05;
            aiCoreRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group ref={cardRef} scale={responsiveScale}>
            <Float
                speed={1.5}
                rotationIntensity={0.1}
                floatIntensity={0.3}
            >
                {/* 1. iOS Frosted Glass Panel Container */}
                <RoundedBox args={[2.8, 3.8, 0.1]} radius={0.3} smoothness={16} position={[0, 0, 0]}>
                    <MeshTransmissionMaterial
                        backside
                        samples={8}
                        thickness={0.5} // Liquid volume look
                        roughness={0.25} // Ultra frosted
                        transmission={1}
                        ior={1.3}
                        clearcoat={1} // Glossy outer layer
                        clearcoatRoughness={0.1}
                        color="#ffffff"
                    />
                </RoundedBox>

                {/* 2. UI Content Layer on top of the glass */}
                <group position={[0, 0, 0.1]}>

                    {/* Header: AI Generation Status Core */}
                    <mesh position={[-1.1, 1.55, 0.05]} ref={aiCoreRef}>
                        <icosahedronGeometry args={[0.12, 1]} />
                        <meshStandardMaterial color="#c084fc" wireframe emissive="#c084fc" emissiveIntensity={0.5} />
                    </mesh>

                    {/* Header Label */}
                    <Text
                        position={[-0.85, 1.55, 0.05]}
                        fontSize={0.12}
                        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeA.woff"
                        color="#d946ef"
                        anchorX="left"
                        anchorY="middle"
                        fontWeight="bold"
                    >
                        LinkedGenie AI Typing...
                    </Text>

                    {/* Divider Line */}
                    <mesh position={[0, 1.35, 0.05]}>
                        <planeGeometry args={[2.4, 0.01]} />
                        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.3} />
                    </mesh>

                    {/* The Live Literal Text Generation */}
                    <TypingText position={[-1.2, 1.15, 0.05]} />
                </group>

                {/* Subtly glowing aura specific to this container */}
                <Sparkles
                    count={30}
                    scale={4}
                    size={3}
                    speed={0.3}
                    opacity={0.3}
                    color="#fbcfe8" // Light pink/fuchsia specs
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
                    <ambientLight intensity={1} />
                    {/* Soft directional lights to bounce off the glossy clearcoat layer of the frost glass */}
                    <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
                    <directionalLight position={[-5, -5, 5]} intensity={0.5} color="#e2e8f0" />

                    {/* HDRI Environment mapping makes the glass material look highly realistic */}
                    <Environment preset="city" />

                    <AIContentGlassWidget />
                </Suspense>
            </Canvas>
        </div>
    );
}
