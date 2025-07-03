import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Hook để kiểm tra tùy chọn giảm animation
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    // Kiểm tra thiết lập người dùng về reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
};

// Component nút từ tính (magnetic button)
export const MagneticButton = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    
    buttonRef.current.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  };
  
  const handleMouseLeave = () => {
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'translate(0px, 0px)';
    }
  };
  
  return (
    <button
      ref={buttonRef}
      className={`transition-transform duration-200 ${className || ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
};

// Component nút hiệu ứng gợn sóng (ripple button)
export const RippleButton = ({ 
  children, 
  onClick, 
  className 
}: { 
  children: React.ReactNode, 
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void, 
  className?: string 
}) => {
  const [ripples, setRipples] = useState<{id: number, x: number, y: number, size: number}[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Tính toán kích thước của ripple dựa trên kích thước button
    const size = Math.max(button.offsetWidth, button.offsetHeight) * 2;
    
    // Thêm ripple mới với id duy nhất
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Xóa ripple sau khi animation hoàn thành
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };
  
  return (
    <button
      ref={buttonRef}
      className={`relative overflow-hidden ${className || ''}`}
      onClick={(e) => {
        addRipple(e);
        onClick && onClick(e);
      }}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/20 rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}
      {children}
    </button>
  );
};

// Component thẻ 3D tilt
export const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    const x = (clientX - (left + width / 2)) / 25;
    const y = -(clientY - (top + height / 2)) / 25;
    
    cardRef.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg)`;
  };
  
  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    }
  };
  
  return (
    <div
      ref={cardRef}
      className="transition-transform duration-200"
      onMouseMove={prefersReducedMotion ? undefined : handleMouseMove}
      onMouseLeave={prefersReducedMotion ? undefined : handleMouseLeave}
    >
      {children}
    </div>
  );
};

// Component hiệu ứng hạt nổi (floating particles)
export const FloatingParticles = () => {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) return null;
  
  // Tạo số lượng ngẫu nhiên các hạt
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    color: [
      '#ffd875',
      '#ffffff',
      '#e6c269',
      '#ffecb3'
    ][Math.floor(Math.random() * 4)]
  }));
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: 0.6
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + Math.random() * 3,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}; 