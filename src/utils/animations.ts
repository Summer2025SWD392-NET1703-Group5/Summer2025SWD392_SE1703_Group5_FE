import gsap from 'gsap';

// Hàm tạo timeline cho page transitions
export const createPageTransition = () => {
    const tl = gsap.timeline();

    tl.to('.page-transition', {
        scaleY: 1,
        duration: 0.5,
        ease: 'power4.inOut'
    })
        .to('.page-transition', {
            scaleY: 0,
            duration: 0.5,
            ease: 'power4.inOut',
            delay: 0.3
        });

    return tl;
};

// Hàm tạo ripple effect khi click
export const createRipple = (event: MouseEvent, element: HTMLElement) => {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    element.appendChild(ripple);

    gsap.to(ripple, {
        scale: 4,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
    });
};

// Hàm tạo particle effect
export const createParticles = (container: HTMLElement, count: number = 20) => {
    const particles: HTMLElement[] = [];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        container.appendChild(particle);
        particles.push(particle);
    }

    particles.forEach((particle, index) => {
        gsap.to(particle, {
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            opacity: 0,
            scale: Math.random() * 2 + 1,
            duration: Math.random() * 2 + 1,
            delay: index * 0.02,
            ease: 'power2.out',
            onComplete: () => particle.remove()
        });
    });
};

// Hàm tạo typing effect
export const typewriterEffect = (element: HTMLElement, text: string, speed: number = 50) => {
    element.textContent = '';
    let index = 0;

    const type = () => {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    };

    type();
};

// Hàm tạo gradient animation cho background
export const animateGradient = (element: HTMLElement) => {
    let angle = 0;

    const animate = () => {
        angle += 1;
        element.style.background = `linear-gradient(${angle}deg, #FFD875, #FFA500, #FF6B6B, #4ECDC4, #FFD875)`;
        requestAnimationFrame(animate);
    };

    animate();
};

// Hàm tạo glitch effect cho text
export const glitchEffect = (element: HTMLElement) => {
    const text = element.textContent || '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let iteration = 0;

    const interval = setInterval(() => {
        element.textContent = text
            .split('')
            .map((_, index) => {
                if (index < iteration) {
                    return text[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

        if (iteration >= text.length) {
            clearInterval(interval);
        }

        iteration += 1 / 3;
    }, 30);
};

// Hàm tạo morph effect cho SVG
export const morphSVG = (from: string, to: string, duration: number = 1) => {
    return gsap.to(from, {
        morphSVG: to,
        duration: duration,
        ease: 'power2.inOut'
    });
};

// Hàm tạo float animation
export const floatAnimation = (element: HTMLElement, amplitude: number = 20) => {
    gsap.to(element, {
        y: amplitude,
        duration: 2 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2
    });
};

// Hàm tạo pulse animation
export const pulseAnimation = (element: HTMLElement) => {
    gsap.to(element, {
        scale: 1.05,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
    });
};

// Hàm tạo shake animation
export const shakeAnimation = (element: HTMLElement, intensity: number = 5) => {
    gsap.to(element, {
        x: intensity,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: 'power2.inOut',
        onComplete: () => {
            gsap.set(element, { x: 0 });
        }
    });
};

// Hàm tạo confetti effect
export const createConfetti = (container: HTMLElement) => {
    const colors = ['#FFD875', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA500'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        container.appendChild(confetti);

        gsap.to(confetti, {
            y: window.innerHeight + 100,
            x: (Math.random() - 0.5) * 200,
            rotation: Math.random() * 720,
            duration: Math.random() * 3 + 2,
            ease: 'power1.out',
            delay: Math.random() * 0.5,
            onComplete: () => confetti.remove()
        });
    }
};

// Hàm tạo spotlight effect
export const createSpotlight = (event: MouseEvent) => {
    const spotlight = document.querySelector('.spotlight') as HTMLElement;
    if (!spotlight) return;

    gsap.to(spotlight, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.3,
        ease: 'power2.out'
    });
};

// Hàm tạo text scramble effect
export const scrambleText = (element: HTMLElement, newText: string) => {
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    let iteration = 0;

    const interval = setInterval(() => {
        element.textContent = newText
            .split('')
            .map((_, index) => {
                if (index < iteration) {
                    return newText[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

        if (iteration >= newText.length) {
            clearInterval(interval);
        }

        iteration += 1 / 3;
    }, 30);
}; 