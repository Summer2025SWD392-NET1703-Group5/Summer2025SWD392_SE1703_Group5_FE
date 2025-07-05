import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Hook để tạo fade in animation khi element xuất hiện trong viewport
export const useFadeInOnScroll = (options?: {
    delay?: number;
    duration?: number;
    y?: number;
    stagger?: number;
}) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const {
            delay = 0,
            duration = 0.8,
            y = 50,
            stagger = 0
        } = options || {};

        gsap.fromTo(
            element.children,
            {
                opacity: 0,
                y: y,
            },
            {
                opacity: 1,
                y: 0,
                duration: duration,
                delay: delay,
                stagger: stagger,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [options]);

    return elementRef;
};

// Hook để tạo parallax effect
export const useParallax = (speed: number = 0.5) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        gsap.to(element, {
            yPercent: -100 * speed,
            ease: 'none',
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [speed]);

    return elementRef;
};

// Hook để tạo stagger animation cho list items
export const useStaggerAnimation = (options?: {
    delay?: number;
    stagger?: number;
    duration?: number;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const {
            delay = 0,
            stagger = 0.1,
            duration = 0.6
        } = options || {};

        const items = container.querySelectorAll('.stagger-item');

        gsap.fromTo(
            items,
            {
                opacity: 0,
                y: 30,
                scale: 0.9
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: duration,
                delay: delay,
                stagger: stagger,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: container,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [options]);

    return containerRef;
};

// Hook để tạo hover effect với 3D transform
export const useHover3D = (depth: number = 10) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * depth;
            const rotateY = ((centerX - x) / centerX) * depth;

            gsap.to(element, {
                rotationX: rotateX,
                rotationY: rotateY,
                duration: 0.3,
                ease: 'power2.out',
                transformPerspective: 1000
            });
        };

        const handleMouseLeave = () => {
            gsap.to(element, {
                rotationX: 0,
                rotationY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
            element.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [depth]);

    return elementRef;
};

// Hook để tạo text reveal animation
export const useTextReveal = (options?: {
    duration?: number;
    delay?: number;
}) => {
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = textRef.current;
        if (!element) return;

        const {
            duration = 1,
            delay = 0
        } = options || {};

        // Split text into spans for each character
        const text = element.innerText;
        element.innerHTML = text
            .split('')
            .map(char => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
            .join('');

        const chars = element.querySelectorAll('span');

        gsap.fromTo(
            chars,
            {
                opacity: 0,
                y: 50,
                rotationX: -90
            },
            {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: duration,
                delay: delay,
                stagger: 0.02,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [options]);

    return textRef;
};

// Hook cho counting animation
export const useCountAnimation = (
    endValue: number,
    duration: number = 2,
    startValue: number = 0
) => {
    const countRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const element = countRef.current;
        if (!element) return;

        const counter = { value: startValue };

        gsap.to(counter, {
            value: endValue,
            duration: duration,
            ease: 'power2.out',
            onUpdate: () => {
                if (element) {
                    element.textContent = Math.round(counter.value).toString();
                }
            },
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [endValue, duration, startValue]);

    return countRef;
};

// Hook cho magnetic button effect
export const useMagneticButton = (strength: number = 0.3) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(button, {
                x: x * strength,
                y: y * strength,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [strength]);

    return buttonRef;
}; 