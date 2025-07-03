import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface Seat {
    id: string;
    row: string;
    number: number;
    type: 'standard' | 'vip' | 'couple';
    status: 'available' | 'occupied' | 'selected';
    position: [number, number, number];
}

interface SeatMap3DProps {
    seats: Seat[];
    onSeatSelect: (seatId: string) => void;
    selectedSeats: string[];
}

// Component cho mỗi ghế 3D
const Seat3D: React.FC<{
    seat: Seat;
    isSelected: boolean;
    onClick: () => void;
}> = ({ seat, isSelected, onClick }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Animation khi hover
    useEffect(() => {
        if (!meshRef.current) return;

        gsap.to(meshRef.current.scale, {
            x: hovered ? 1.1 : 1,
            y: hovered ? 1.1 : 1,
            z: hovered ? 1.1 : 1,
            duration: 0.3,
            ease: 'power2.out'
        });

        gsap.to(meshRef.current.position, {
            y: hovered ? seat.position[1] + 0.1 : seat.position[1],
            duration: 0.3,
            ease: 'power2.out'
        });
    }, [hovered, seat.position]);

    // Animation khi select
    useEffect(() => {
        if (!meshRef.current) return;

        if (isSelected) {
            gsap.to(meshRef.current.rotation, {
                y: Math.PI * 2,
                duration: 0.6,
                ease: 'power2.out'
            });
        }
    }, [isSelected]);

    // Màu sắc theo loại ghế và trạng thái
    const getColor = () => {
        if (seat.status === 'occupied') return '#374151';
        if (isSelected) return '#FFD875';

        switch (seat.type) {
            case 'vip': return '#FFD875';
            case 'couple': return '#EC4899';
            default: return '#10B981';
        }
    };

    return (
        <group position={seat.position}>
            <Box
                ref={meshRef}
                args={seat.type === 'couple' ? [1.8, 0.8, 1] : [0.8, 0.8, 1]}
                onClick={() => seat.status === 'available' && onClick()}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshStandardMaterial
                    color={getColor()}
                    emissive={hovered ? getColor() : '#000000'}
                    emissiveIntensity={hovered ? 0.3 : 0}
                    metalness={0.3}
                    roughness={0.7}
                />
            </Box>

            {/* Label cho ghế */}
            <Text
                position={[0, -0.6, 0]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {seat.row}{seat.number}
            </Text>

            {/* Icon cho ghế đã chọn */}
            {isSelected && (
                <Text
                    position={[0, 0.5, 0.5]}
                    fontSize={0.4}
                    color="#FFD875"
                    anchorX="center"
                    anchorY="middle"
                >
                    ✓
                </Text>
            )}
        </group>
    );
};

// Component cho màn hình chiếu phim
const Screen3D: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Hiệu ứng nhấp nháy nhẹ cho màn hình
        meshRef.current.material.emissiveIntensity =
            0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    });

    return (
        <group position={[0, 3, -8]}>
            <Plane args={[16, 6]} ref={meshRef}>
                <meshStandardMaterial
                    color="#1F2937"
                    emissive="#FFD875"
                    emissiveIntensity={0.2}
                    metalness={0.8}
                    roughness={0.2}
                />
            </Plane>
            <Text
                position={[0, 0, 0.1]}
                fontSize={0.8}
                color="#FFD875"
                anchorX="center"
                anchorY="middle"
            >
                MÀN HÌNH
            </Text>
        </group>
    );
};

// Component camera controller
const CameraController: React.FC = () => {
    const { camera } = useThree();

    useEffect(() => {
        // Set vị trí camera ban đầu
        gsap.to(camera.position, {
            x: 0,
            y: 8,
            z: 12,
            duration: 2,
            ease: 'power3.out'
        });

        camera.lookAt(0, 0, 0);
    }, [camera]);

    return null;
};

// Component chính
const SeatMap3D: React.FC<SeatMap3DProps> = ({
    seats,
    onSeatSelect,
    selectedSeats
}) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-[600px] bg-slate-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#FFD875] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white">Đang tải sơ đồ ghế...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[600px] bg-slate-900 rounded-lg overflow-hidden relative">
            <Canvas
                camera={{ position: [0, 10, 15], fov: 50 }}
                shadows
            >
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                <pointLight position={[-10, 10, 10]} intensity={0.5} />
                <spotLight
                    position={[0, 10, 0]}
                    angle={0.5}
                    penumbra={1}
                    intensity={0.8}
                    castShadow
                />

                {/* Camera controller */}
                <CameraController />

                {/* Controls */}
                <OrbitControls
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2}
                    minDistance={10}
                    maxDistance={20}
                />

                {/* Floor */}
                <Plane
                    args={[20, 20]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, -1, 0]}
                    receiveShadow
                >
                    <meshStandardMaterial color="#1E293B" />
                </Plane>

                {/* Screen */}
                <Screen3D />

                {/* Seats */}
                {seats.map((seat) => (
                    <Seat3D
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeats.includes(seat.id)}
                        onClick={() => onSeatSelect(seat.id)}
                    />
                ))}
            </Canvas>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">Chú thích:</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#10B981] rounded" />
                        <span className="text-white text-sm">Ghế thường</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#FFD875] rounded" />
                        <span className="text-white text-sm">Ghế VIP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#EC4899] rounded" />
                        <span className="text-white text-sm">Ghế đôi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-600 rounded" />
                        <span className="text-white text-sm">Đã đặt</span>
                    </div>
                </div>
            </div>

            {/* Selected seats info */}
            {selectedSeats.length > 0 && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-white">
                        Đã chọn: <span className="text-[#FFD875] font-bold">{selectedSeats.length}</span> ghế
                    </p>
                </div>
            )}
        </div>
    );
};

export default SeatMap3D; 