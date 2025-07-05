import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  CalendarIcon,
  ClockIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  TagIcon,
  ShieldCheckIcon,
  TicketIcon,
  FilmIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  QrCodeIcon,
  ChevronRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import '../styles/animations.css';
import { promotionService } from '../services/promotionService';
import type { Promotion, PromotionCategory } from '../types/promotion';
import { useReducedMotion, MagneticButton, RippleButton, TiltCard, FloatingParticles } from '../components/promotion/AnimationComponents';
import { DiscountBadge } from '../components/promotion/DiscountBadge';
import { UsageProgressBar } from '../components/promotion/UsageProgressBar';
import PromoDetailsModal from '../components/PromoDetailsModal';

// Định nghĩa các biến animation
const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
      ease: "easeOut"
    }
  }
};

const heroVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 30
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 50,
    rotateX: 10
  },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    rotateX: 5,
    boxShadow: "0 0 20px rgba(255, 216, 117, 0.4)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

const imageVariants: Variants = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const badgeVariants: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
      delay: 0.3
    }
  },
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 0.5
    }
  }
};

// Custom component for copyable promo code
const CopyablePromoCode = ({ code, remainingUsage = 1, isUsed = false }: { code?: string; remainingUsage?: number; isUsed?: boolean }) => {
  const [copied, setCopied] = useState(false);
 
  if (!code) return null;
  
  // Khuyến mãi bị vô hiệu hóa nếu hết lượt hoặc đã được sử dụng
  const isDisabled = remainingUsage <= 0 || isUsed;
  
  const handleCopy = () => {
    if (isDisabled) return; // Don't copy if disabled
    
    navigator.clipboard.writeText(code);
    setCopied(true);
   
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
 
  return (
    <div className="mt-4 pt-4 border-t border-slate-700/30">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">Mã giảm giá:</div>
        <div className="relative">
          <button
            onClick={handleCopy}
            disabled={isDisabled}
            className={`flex items-center space-x-2 px-3 py-1 rounded border transition-all duration-300 ${
              isDisabled 
                ? 'bg-slate-600/30 border-slate-600/30 cursor-not-allowed opacity-50' 
                : 'bg-slate-700/30 border-[#ffd875]/30 hover:border-[#ffd875]/60 cursor-pointer'
            }`}
          >
            <span className={`font-mono font-bold ${isDisabled ? 'text-gray-500' : 'text-[#ffd875]'}`}>
              {code}
            </span>
            {!isDisabled && !copied && (
              <span className="ml-2">
                <ClipboardDocumentIcon className="w-4 h-4 text-[#ffd875]" />
              </span>
            )}
            {isDisabled && (
              <span className="ml-2 text-xs text-gray-500">
                {isUsed}
              </span>
            )}
            {copied && (
              <span className="ml-2 text-green-500 text-xs">
                Đã sao chép!
              </span>
            )}
          </button>
          
          {/* Success message */}
          {copied && !isDisabled && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Đã sao chép!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PromotionsPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [promotionCategories, setPromotionCategories] = useState<PromotionCategory[]>([]);
  const prefersReducedMotion = useReducedMotion();
 
  // Add state for promo details modal
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  // Control animation based on page scroll
  const controls = useAnimation();
  const [mainRef, mainInView] = useInView({ triggerOnce: true, threshold: 0.1 });


  // Fetch promotions data from API
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setIsDataLoading(true);
        
        // Lấy danh sách khuyến mãi hiện có
        const promotionsData = await promotionService.getAvailablePromotions();
        
        // Lấy danh sách khuyến mãi đã sử dụng
        const usedPromotionIds = await promotionService.getUsedPromotions();
        console.log('Used promotion IDs:', usedPromotionIds);
        
        // Đánh dấu các khuyến mãi đã sử dụng
        const markedPromotions = promotionsData.map(promo => ({
          ...promo,
          isUsed: usedPromotionIds.includes(promo.id)
        }));
        
        setActivePromotions(markedPromotions);
        
        const categories = await promotionService.getPromotionCategories();
        setPromotionCategories(categories);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        // If API fails, no need to handle here as the service returns mock data as fallback
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchPromotions();
  }, []);


  useEffect(() => {
    if (mainInView) {
      controls.start("animate");
    }
  }, [controls, mainInView]);


  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };


  // Format date to Vietnamese format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };


  // Function to handle applying promo code
  const handleApplyPromoCode = async (code: string) => {
    try {
      setIsLoading(true);


      // Set the code in local storage so it can be used in the booking flow
      localStorage.setItem('activePromoCode', code);


      // Show confetti effect
    setShowConfetti(true);


      // Navigate to movie list page
      setTimeout(() => {
        window.location.href = '/movies';
      }, 1000);
    } catch (error) {
      console.error('Error applying promotion code:', error);
    } finally {
      setIsLoading(false);
    // Hide confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000);
    }
  };
 
  const openPromoDetails = (promo: Promotion) => {
    setSelectedPromo(promo);
    setIsModalOpen(true);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    if (!email.trim()) return;
   
    setIsLoading(true);
   
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
   
    // Show success feedback
    setShowConfetti(true);
    alert(`Cảm ơn bạn đã đăng ký nhận thông tin khuyến mãi qua email: ${email}`);
    setEmail('');
    setIsLoading(false);
   
    // Hide confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000);
  };
 
  // Confetti component
  const ConfettiExplosion = () => {
    const [particles, setParticles] = useState<Array<{
      id: number;
      x: number;
      y: number;
      color: string;
      size: number;
      velocity: { x: number; y: number };
    }>>([]);
   
    useEffect(() => {
      if (showConfetti) {
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
          id: i,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight,
          color: ['#ffd875', '#ff6b6b', '#4ecdc4', '#45b7d1'][Math.floor(Math.random() * 4)],
          size: Math.random() * 8 + 4,
          velocity: {
            x: (Math.random() - 0.5) * 10,
            y: -(Math.random() * 15 + 10)
          }
        }));
       
        setParticles(newParticles);
       
        setTimeout(() => setParticles([]), 3000);
      }
    }, [showConfetti]);
   
    if (particles.length === 0) return null;
   
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
            }}
            initial={{
              x: particle.x,
              y: particle.y,
            }}
            animate={{
              x: particle.x + particle.velocity.x * 100,
              y: particle.y + particle.velocity.y * 100,
              opacity: [1, 1, 0],
              rotate: 360,
            }}
            transition={{
              duration: 3,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    );
  };


  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-slate-800/60 rounded-2xl p-6 animate-pulse">
      <div className="h-48 bg-slate-700 rounded-lg mb-4 skeleton"></div>
      <div className="h-6 bg-slate-700 rounded mb-3 skeleton"></div>
      <div className="h-4 bg-slate-700 rounded mb-2 skeleton"></div>
      <div className="h-4 bg-slate-700 rounded w-3/4 skeleton"></div>
    </div>
  );


  return (
    <motion.div
      className="bg-slate-900 min-h-screen"
      initial="initial"
      animate="animate"
      variants={pageVariants}
      ref={mainRef}
    >
      {/* Confetti effect for successful actions */}
      {showConfetti && <ConfettiExplosion />}
     
      {/* Promo Details Modal */}
      {selectedPromo && (
        <PromoDetailsModal
          promotion={selectedPromo}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onApply={handleApplyPromoCode}
          formatPrice={formatPrice}
          formatDate={formatDate}
        />
      )}
     
      {/* Hero Banner Section */}
      <motion.section
        className="relative h-96 flex items-center justify-center overflow-hidden animate-gradient-x"
        variants={heroVariants}
        style={{
          background: "linear-gradient(to right, #0f172a, #1e293b, #0f172a)"
        }}
      >
        {/* Background overlay with accent color */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#ffd875]/20 to-transparent"></div>
       
        {/* Floating particles background */}
        <FloatingParticles />
       
        {/* Decorative elements */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#ffd875]/10 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 w-96 h-96 bg-[#ffd875]/5 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
       
        {/* Hero content */}
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Ưu Đãi Đặc Quyền <span className="text-[#ffd875] animate-text-shimmer">Dành Riêng</span> Cho Bạn
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Khám phá những ưu đãi độc quyền và tiết kiệm hơn khi trải nghiệm kho phim đẳng cấp của chúng tôi
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative overflow-hidden"
          >
            <motion.div
              className="text-center"
              animate={{
                textShadow: [
                  "0 0 5px rgba(255, 216, 117, 0.3)",
                  "0 0 20px rgba(255, 216, 117, 0.5)",
                  "0 0 5px rgba(255, 216, 117, 0.3)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <motion.span
                className="text-[#FFD875] font-extrabold text-3xl"
                animate={{
                  filter: [
                    "brightness(100%) contrast(100%)",
                    "brightness(120%) contrast(110%)",
                    "brightness(100%) contrast(100%)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                Khuyến Mãi Hấp Dẫn - Đặt Vé Ngay Hôm Nay
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Promotions Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2
            className="text-2xl font-bold text-white mb-8 flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mr-2 animate-bounce-in">🎉</span> Ưu Đãi Đặc Biệt
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!isDataLoading ? (
              activePromotions.map((promo, index) => (
                <TiltCard key={promo.id}>
                  <motion.div
                    className="relative bg-slate-800/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-[#ffd875]/30 hover:border-[#ffd875] transition-all duration-300 shadow-md hover:shadow-[#ffd875]/30 cursor-pointer"
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ delay: index * 0.1 }}
                    onClick={() => openPromoDetails(promo)}
                  >
                    {/* Image section */}
                    <div className="relative h-48 overflow-hidden">
                      <motion.img
                        src={promo.image}
                        alt={promo.title}
                        className="w-full h-full object-cover"
                        variants={imageVariants}
                        whileHover="hover"
                      />
                     
                      {/* Badge */}
                      {promo.badge && (
                        <motion.div
                          className="absolute top-4 left-4"
                          variants={badgeVariants}
                          initial="initial"
                          animate="animate"
                          whileHover="hover"
                        >
                          <span className={`
                            ${promo.badge === 'HOT' ? 'bg-red-500' :
                              promo.badge === 'NEW' ? 'bg-green-500' :
                              'bg-orange-500'}
                            text-white px-3 py-1 rounded-full text-sm font-bold
                          `}>
                            {promo.badge}
                          </span>
                        </motion.div>
                      )}

                      {/* Đã sử dụng badge */}
                      {promo.isUsed && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm font-bold border border-gray-500">
                            Đã sử dụng
                          </span>
                        </div>
                      )}
                    </div>
                   
                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 hover:text-[#ffd875] transition-colors">
                        {promo.title}
                      </h3>
                      
                      {/* Hiển thị DiscountBadge */}
                      {promo.discountType && promo.discountValue && (
                        <div className="mb-3">
                          <DiscountBadge type={promo.discountType} value={promo.discountValue} />
                        </div>
                      )}
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {promo.description}
                      </p>
                      <div className="flex items-center text-gray-400 text-xs mb-4">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>Có hiệu lực đến: {formatDate(promo.validUntil)}</span>
                      </div>

                      {/* Usage Progress Bar */}
                      <UsageProgressBar 
                        currentUsage={promo.currentUsage} 
                        usageLimit={promo.usageLimit} 
                      />
                     
                      {/* Add the copyable promo code component */}
                      <CopyablePromoCode 
                        code={promo.code} 
                        remainingUsage={promo.remainingUsage}
                        isUsed={promo.isUsed}
                      />
                     
                      <RippleButton
                        className={`w-full ${
                          promo.isUsed 
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-70'
                            : promo.remainingUsage > 0
                              ? 'bg-[#ffd875] hover:bg-[#e6c269] text-black'
                              : 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50'
                        } py-3 rounded-lg font-bold transition-all duration-300 mt-4`}
                        onClick={(e) => {
                          // Ngăn chặn sự kiện nếu đã sử dụng hoặc hết lượt
                          if (promo.isUsed || promo.remainingUsage <= 0) {
                            e.stopPropagation();
                            return;
                          }
                          openPromoDetails(promo);
                        }}
                      >
                        {promo.isUsed 
                          ? 'Đã sử dụng' 
                          : promo.remainingUsage > 0 
                            ? 'Nhận Ưu Đãi' 
                            : 'Đã hết lượt sử dụng'
                        }
                      </RippleButton>
                    </div>
                  </motion.div>
                </TiltCard>
              ))
            ) : (
              // Skeleton loading placeholders
              Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            )}
          </div>
        </motion.section>



      </div>
    </motion.div>
  );
};


export default PromotionsPage;

