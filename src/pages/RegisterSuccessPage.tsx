import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

const RegisterSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [windowDimension, setWindowDimension] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const detectSize = () => {
            setWindowDimension({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', detectSize);
        return () => {
            window.removeEventListener('resize', detectSize);
        };
    }, []);

    // Auto redirect after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 10000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
            {/* Confetti effect */}
            <Confetti
                width={windowDimension.width}
                height={windowDimension.height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.1}
                colors={['#FFD875', '#e5c368', '#FFF', '#FF6B6B', '#4ECDC4']}
            />

            {/* Background sparkles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        initial={{
                            x: Math.random() * windowDimension.width,
                            y: Math.random() * windowDimension.height,
                            opacity: 0,
                        }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                        }}
                        transition={{
                            duration: 3,
                            delay: Math.random() * 2,
                            repeat: Infinity,
                            repeatDelay: Math.random() * 3,
                        }}
                    >
                        <SparklesIcon className="w-6 h-6 text-[#FFD875]" />
                    </motion.div>
                ))}
            </div>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="max-w-md w-full bg-slate-800/70 backdrop-blur-sm p-10 rounded-xl shadow-lg border border-[#FFD875]/20 shadow-[0_0_40px_rgba(255,216,117,0.4)] relative z-10 text-center"
            >
                {/* Success icon with animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                    className="relative inline-block mb-6"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 10, 0],
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 0.8,
                            repeat: 3,
                        }}
                    >
                        <CheckCircleIcon className="w-24 h-24 text-[#FFD875] mx-auto" />
                    </motion.div>

                    {/* Glowing ring animation */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-[#FFD875]"
                        initial={{ scale: 0.8, opacity: 1 }}
                        animate={{
                            scale: [0.8, 1.5, 2],
                            opacity: [1, 0.5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                    />
                </motion.div>

                {/* Success message */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-white mb-4"
                    style={{
                        textShadow: '0 0 30px rgba(255,216,117,0.5)',
                    }}
                >
                    Chúc mừng bạn!
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-gray-300 mb-8"
                >
                    Bạn đã đăng ký thành công tài khoản Galaxy Cinema!
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-700/50 rounded-lg p-4 mb-8"
                >
                    <p className="text-sm text-gray-400 mb-2">
                        Một email xác thực đã được gửi đến địa chỉ của bạn.
                    </p>
                    <p className="text-sm text-gray-400">
                        Vui lòng kiểm tra hộp thư và kích hoạt tài khoản.
                    </p>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                >
                    <Link
                        to="/login"
                        className="block w-full py-3 px-6 rounded-lg bg-[#FFD875] text-slate-900 font-medium hover:bg-[#e5c368] transition-all shadow-[0_0_20px_rgba(255,216,117,0.5)] hover:shadow-[0_0_30px_rgba(255,216,117,0.7)]"
                    >
                        Đăng nhập ngay
                    </Link>

                    <Link
                        to="/"
                        className="block w-full py-3 px-6 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-all"
                    >
                        Về trang chủ
                    </Link>
                </motion.div>

                {/* Auto redirect notice */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-xs text-gray-500 mt-6"
                >
                    Tự động chuyển đến trang đăng nhập sau 10 giây...
                </motion.p>
            </motion.div>
        </div>
    );
};

export default RegisterSuccessPage; 