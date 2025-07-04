import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { StarIcon, PlayIcon, TicketIcon, HeartIcon } from '@heroicons/react/24/solid';
import { createRipple } from '../utils/animations';
import type { Movie } from '../types';

interface MovieCard3DProps {
    movie: Movie;
    index?: number;
    onFavorite?: (movieId: number) => void;
    isFavorite?: boolean;
}

const MovieCard3D: React.FC<MovieCard3DProps> = ({
    movie,
    index = 0,
    onFavorite,
    isFavorite = false
}) => {
    const navigate = useNavigate();
    const cardRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // 3D tilt effect on mouse move
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation values
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            // Apply 3D transform
            gsap.to(card, {
                rotationX: rotateX,
                rotationY: rotateY,
                duration: 0.3,
                ease: 'power2.out',
                transformPerspective: 1000,
                transformOrigin: 'center center'
            });

            // Move glow effect
            if (glowRef.current) {
                gsap.to(glowRef.current, {
                    x: (x - centerX) * 0.3,
                    y: (y - centerY) * 0.3,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                duration: 0.5,
                ease: 'back.out(1.5)'
            });

            if (glowRef.current) {
                gsap.to(glowRef.current, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'back.out(1.5)'
                });
            }
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    // Entrance animation
    useEffect(() => {
        if (!cardRef.current || !isImageLoaded) return;

        gsap.fromTo(cardRef.current,
            {
                opacity: 0,
                y: 50,
                rotateX: -15,
                scale: 0.9
            },
            {
                opacity: 1,
                y: 0,
                rotateX: 0,
                scale: 1,
                duration: 0.8,
                delay: index * 0.1,
                ease: 'power3.out'
            }
        );
    }, [index, isImageLoaded]);

    const handleCardClick = (e: React.MouseEvent) => {
        createRipple(e.nativeEvent, e.currentTarget as HTMLElement);
        setTimeout(() => {
            navigate(`/movies/${movie.id}`);
        }, 300);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Heart burst animation
        const heart = e.currentTarget;
        gsap.to(heart, {
            scale: 0.8,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
            onComplete: () => {
                if (onFavorite) onFavorite(movie.id);
            }
        });

        // Create particles
        if (!isFavorite) {
            createHeartParticles(heart as HTMLElement);
        }
    };

    const createHeartParticles = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const container = document.body;

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.innerHTML = '❤️';
            particle.style.position = 'fixed';
            particle.style.left = `${rect.left + rect.width / 2}px`;
            particle.style.top = `${rect.top + rect.height / 2}px`;
            particle.style.fontSize = '20px';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            container.appendChild(particle);

            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 + Math.random() * 50;

            gsap.to(particle, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance - 30,
                opacity: 0,
                scale: 0.5,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => particle.remove()
            });
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-400';
        if (rating >= 3.5) return 'text-yellow-400';
        if (rating >= 2.5) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div
            ref={cardRef}
            className="relative movie-card-3d cursor-pointer group"
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                transformStyle: 'preserve-3d',
                willChange: 'transform'
            }}
        >
            {/* Card Container */}
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-slate-900">
                {/* Loading skeleton */}
                {!isImageLoaded && (
                    <div className="absolute inset-0 bg-slate-800 animate-pulse">
                        <div className="absolute inset-0 shimmer" />
                    </div>
                )}

                {/* Movie Poster */}
                <img
                    src={movie.poster}
                    alt={movie.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'
                        }`}
                    loading="lazy"
                    onLoad={() => setIsImageLoaded(true)}
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60" />
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-90' : 'opacity-0'
                    }`} />

                {/* Glow Effect */}
                <div
                    ref={glowRef}
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                >
                    <div className="absolute inset-0 bg-gradient-radial from-[#FFD875]/20 via-transparent to-transparent blur-2xl" />
                </div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    <div className="flex flex-col gap-2">
                        {movie.isNew && (
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                                MỚI
                            </span>
                        )}
                        {movie.isHot && (
                            <span className="px-3 py-1 bg-gradient-to-r from-[#FFD875] to-[#FFA500] text-black text-xs font-bold rounded-full flex items-center gap-1">
                                <span className="animate-bounce">🔥</span> HOT
                            </span>
                        )}
                    </div>

                    {/* Favorite Button */}
                    <button
                        onClick={handleFavoriteClick}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${isFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-black/50 text-white hover:bg-red-500'
                            }`}
                    >
                        <HeartIcon className={`w-5 h-5 ${isFavorite ? 'animate-pulse' : ''}`} />
                    </button>
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                    <StarIcon className={`w-4 h-4 ${getRatingColor(movie.rating)}`} />
                    <span className={`text-sm font-bold ${getRatingColor(movie.rating)}`}>
                        {movie.rating.toFixed(1)}
                    </span>
                </div>

                {/* Content */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 transform transition-all duration-500 ${isHovered ? 'translate-y-0' : 'translate-y-2'
                    }`}>
                    {/* Title */}
                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-2 drop-shadow-lg">
                        {movie.title}
                    </h3>

                    {/* Movie Info */}
                    <div className={`flex items-center gap-3 text-xs text-gray-300 mb-3 transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <span>{movie.genre}</span>
                        <span>•</span>
                        <span>{movie.duration}</span>
                        <span>•</span>
                        <span>{movie.ageRating}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex gap-2 transition-all duration-500 transform ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}>
                        <button className="flex-1 bg-[#FFD875] text-black font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#e5c368] transition-colors">
                            <TicketIcon className="w-4 h-4" />
                            <span>Đặt vé</span>
                        </button>
                        <button className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors">
                            <PlayIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 3D Shadow */}
                <div
                    className="absolute -bottom-4 left-4 right-4 h-20 bg-black/50 blur-2xl rounded-full transform -z-10"
                    style={{
                        transform: `translateZ(-50px) scale(0.9)`
                    }}
                />
            </div>

            <style jsx>{`
        .movie-card-3d {
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to));
        }
        
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
        </div>
    );
};

export default MovieCard3D; 