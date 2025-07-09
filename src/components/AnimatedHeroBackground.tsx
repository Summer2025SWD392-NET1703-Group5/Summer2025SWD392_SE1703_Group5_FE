import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import gsap from 'gsap';

// Particle component
function Particles() {
    const points = useRef<THREE.Points>(null);
    const particlesCount = 500;

    // Create random positions
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }

    useFrame((state) => {
        if (!points.current) return;

        // Rotate particles
        points.current.rotation.x = state.clock.elapsedTime * 0.05;
        points.current.rotation.y = state.clock.elapsedTime * 0.08;

        // Float effect
        points.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesCount}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.015}
                color="#FFD875"
                sizeAttenuation
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// Floating cinema elements
function FloatingElement({ position, scale }: { position: [number, number, number]; scale: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Floating animation
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={meshRef} position={position} scale={scale}>
                <dodecahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial
                    color="#FFD875"
                    emissive="#FFD875"
                    emissiveIntensity={0.5}
                    roughness={0.3}
                    metalness={0.8}
                />
            </mesh>
        </Float>
    );
}

interface AnimatedHeroBackgroundProps {
    children: React.ReactNode;
    imageUrl?: string;
}

const AnimatedHeroBackground: React.FC<AnimatedHeroBackgroundProps> = ({ children, imageUrl }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gradientRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!gradientRef.current) return;

        // Animated gradient background
        let angle = 0;
        const animateGradient = () => {
            angle += 0.5;
            if (gradientRef.current) {
                gradientRef.current.style.background = `linear-gradient(${angle}deg, 
          rgba(255, 216, 117, 0.1) 0%, 
          rgba(255, 165, 0, 0.05) 25%, 
          rgba(0, 0, 0, 0) 50%, 
          rgba(255, 216, 117, 0.05) 75%, 
          rgba(255, 165, 0, 0.1) 100%)`;
            }
            requestAnimationFrame(animateGradient);
        };

        animateGradient();

        // Mouse parallax effect
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            const xPos = (clientX / innerWidth - 0.5) * 20;
            const yPos = (clientY / innerHeight - 0.5) * 20;

            gsap.to(containerRef.current, {
                rotateY: xPos,
                rotateX: -yPos,
                duration: 1,
                ease: 'power2.out',
                transformPerspective: 1000
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden">
            {/* 3D Canvas Background */}
            <div className="absolute inset-0">
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 45 }}
                    style={{ background: 'transparent' }}
                >
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFD875" />

                    {/* Stars */}
                    <Stars
                        radius={100}
                        depth={50}
                        count={5000}
                        factor={4}
                        saturation={0}
                        fade
                        speed={1}
                    />

                    {/* Particles */}
                    <Particles />

                    {/* Floating elements */}
                    <FloatingElement position={[2, 1, -2]} scale={0.8} />
                    <FloatingElement position={[-3, -1, -3]} scale={0.6} />
                    <FloatingElement position={[1, -2, -1]} scale={0.7} />
                </Canvas>
            </div>

            {/* Image Background with Ken Burns effect */}
            {imageUrl && (
                <div className="absolute inset-0">
                    <img
                        src={imageUrl}
                        alt="Hero background"
                        className="w-full h-full object-cover animate-slow-zoom"
                        style={{
                            animationDuration: '30s',
                            animationIterationCount: 'infinite',
                            animationDirection: 'alternate'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
                </div>
            )}

            {/* Animated Gradient Overlay */}
            <div ref={gradientRef} className="absolute inset-0 opacity-50 mix-blend-overlay" />

            {/* Vignette Effect */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/50" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Animated Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD875" stopOpacity="0" />
                        <stop offset="50%" stopColor="#FFD875" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#FFD875" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Animated diagonal lines */}
                {[...Array(5)].map((_, i) => (
                    <line
                        key={i}
                        x1="0"
                        y1={`${i * 25}%`}
                        x2="100%"
                        y2={`${i * 25 + 50}%`}
                        stroke="url(#line-gradient)"
                        strokeWidth="0.5"
                        opacity="0.3"
                        className="animate-pulse"
                        style={{
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: '3s'
                        }}
                    />
                ))}
            </svg>

            <style>{`
        @keyframes slow-zoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }
        
        .bg-radial-gradient {
          background: radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.8) 100%);
        }
      `}</style>
        </div>
    );
};

export default AnimatedHeroBackground; 