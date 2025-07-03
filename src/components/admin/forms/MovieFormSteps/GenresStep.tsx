import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { TagIcon, CheckIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import type { MovieReferences, MovieFormData } from '../../../../types/movie';

interface GenresStepProps {
    references: MovieReferences;
}

const GenresStep: React.FC<GenresStepProps> = ({ references }) => {
    const { register, watch, setValue, formState: { errors } } = useFormContext<MovieFormData>();
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [showNewGenreModal, setShowNewGenreModal] = useState(false);
    const [newGenreName, setNewGenreName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('🎬');
    const [customGenres, setCustomGenres] = useState<Record<string, string>>({});

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03
            }
        }
    };

    const formItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (custom: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: custom * 0.1, duration: 0.4 }
        })
    };

    const genreVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 20 }
        },
        hover: {
            scale: 1.05,
            boxShadow: "0 0 10px rgba(255, 216, 117, 0.5)",
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.95 }
    };

    // Lấy giá trị hiện tại của Genre từ form
    const currentGenres = watch('Genre') || '';

    // Cập nhật state selectedGenres khi currentGenres thay đổi
    useEffect(() => {
        const genresList = currentGenres.split(',').filter(Boolean);
        setSelectedGenres(genresList);
    }, [currentGenres]);

    // Hàm xử lý khi chọn/bỏ chọn thể loại
    const handleGenreToggle = (genre: string) => {
        let newSelectedGenres: string[];

        if (selectedGenres.includes(genre)) {
            // Nếu đã chọn, bỏ chọn thể loại
            newSelectedGenres = selectedGenres.filter(g => g !== genre);
        } else {
            // Nếu chưa chọn, thêm thể loại
            newSelectedGenres = [...selectedGenres, genre];
        }

        // Cập nhật state và giá trị form
        setSelectedGenres(newSelectedGenres);
        setValue('Genre', newSelectedGenres.join(','), { shouldValidate: true });
    };

    // Icons for genres (example)
    const genreIcons: Record<string, string> = {
        "Hành động": "🔥",
        "Phiêu lưu": "🌍",
        "Hoạt hình": "🎬",
        "Hài": "😄",
        "Tội phạm": "🕵️",
        "Tài liệu": "📚",
        "Chính kịch": "🎭",
        "Gia đình": "👪",
        "Giả tưởng": "🧙",
        "Lịch sử": "📜",
        "Kinh dị": "👻",
        "Âm nhạc": "🎵",
        "Bí ẩn": "🔍",
        "Lãng mạn": "💘",
        "Khoa học viễn tưởng": "🚀",
        "Võ thuật": "👊",
        "Giật gân": "😱",
        "Chiến tranh": "⚔️",
        "Miền Tây": "🤠",
        ...customGenres
    };

    // Danh sách icon có thể chọn
    const availableIcons = [
        "🎬", "🔥", "🌍", "😄", "🕵️", "📚", "🎭", "👪", "🧙", "📜",
        "👻", "🎵", "🔍", "💘", "🚀", "👊", "😱", "⚔️", "🤠", "🦸",
        "🧛", "🌟", "🎪", "🎨", "🏆", "💥", "🌈", "🎯", "🎲", "🎸",
        "🛸", "🦖", "🧟", "🤖", "👽", "🌊", "🏰", "🗡️", "🛡️", "🎖️"
    ];

    // Thêm thể loại mới
    const handleAddNewGenre = () => {
        if (newGenreName.trim()) {
            const newGenre = newGenreName.trim();
            setCustomGenres(prev => ({ ...prev, [newGenre]: selectedIcon }));
            handleGenreToggle(newGenre);
            setNewGenreName('');
            setSelectedIcon('🎬');
            setShowNewGenreModal(false);
        }
    };

    // Lấy tất cả thể loại (default + custom)
    const allGenres = [...references.genres, ...Object.keys(customGenres)];

    return (
        <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}
        >
            {/* Step Header */}
            <motion.h2
                className="text-xl font-bold text-white mb-6 flex items-center"
                variants={formItemVariants}
                custom={0}
            >
                <span className="text-[#FFD875] mr-2">4.</span>
                Thể loại
            </motion.h2>

            {/* Genres Selection */}
            <motion.div variants={formItemVariants} custom={1} className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <TagIcon className="w-5 h-5 text-[#FFD875]" />
                        <label className="block text-sm font-medium text-[#FFD875]">
                            Thể loại phim <span className="text-red-500">*</span>
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowNewGenreModal(true)}
                        className="bg-[#FFD875] hover:bg-[#e5c368] text-black px-3 py-1 rounded-lg transition-all duration-300 shadow-[0_0_15px_0px_rgba(255,216,117,0.5)] flex items-center gap-2 text-sm hover:shadow-[0_0_20px_3px_rgba(255,216,117,0.6)]"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Thêm thể loại mới
                    </button>
                </div>

                {/* Hiển thị danh sách các thể loại đã chọn */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {selectedGenres.length > 0 ? (
                        selectedGenres.map(genre => (
                            <span
                                key={genre}
                                className="bg-[#FFD875] text-black px-3 py-1 rounded-full text-sm flex items-center shadow-[0_0_10px_0_rgba(255,216,117,0.3)]"
                            >
                                <span className="mr-1">{genreIcons[genre] || '🎬'}</span>
                                {genre}
                                <button
                                    type="button"
                                    onClick={() => handleGenreToggle(genre)}
                                    className="ml-2 bg-black bg-opacity-10 rounded-full p-0.5 hover:bg-opacity-20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </span>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm">Chưa có thể loại nào được chọn</p>
                    )}
                </div>

                {/* Hidden input để lưu giá trị */}
                <input type="hidden" {...register('Genre')} />

                {/* Hiển thị lỗi nếu có */}
                {errors.Genre && <p className="text-red-500 text-sm mb-4">{errors.Genre.message}</p>}

                {/* Grid hiển thị các thể loại */}
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                    variants={containerVariants}
                >
                    {allGenres.map((genre, index) => (
                        <motion.button
                            key={genre}
                            type="button"
                            onClick={() => handleGenreToggle(genre)}
                            className={`
                            relative overflow-hidden p-4 rounded-lg text-left transition-all duration-300
                            ${selectedGenres.includes(genre)
                                    ? 'bg-[#FFD875] text-slate-900 font-medium shadow-[0_0_15px_0_rgba(255,216,117,0.4)]'
                                    : 'bg-slate-700 text-white hover:bg-slate-600'}
                            `}
                            variants={genreVariants}
                            whileHover="hover"
                            whileTap="tap"
                            custom={index}
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-xl">{genreIcons[genre] || '🎬'}</span>
                                <span>{genre}</span>
                            </span>
                            {selectedGenres.includes(genre) && (
                                <motion.span
                                    className="absolute top-1 right-1 bg-slate-900 rounded-full w-4 h-4 flex items-center justify-center text-xs text-white"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    ✓
                                </motion.span>
                            )}
                            {selectedGenres.includes(genre) && (
                                <motion.div
                                    className="absolute inset-0 bg-[#FFD875]/20"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0.5, 0] }}
                                    transition={{ duration: 0.5 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </motion.div>
            </motion.div>

            {/* Modal thêm thể loại mới */}
            <AnimatePresence>
                {showNewGenreModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowNewGenreModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-[0_0_30px_rgba(255,216,117,0.3)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Thêm thể loại mới</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tên thể loại
                                </label>
                                <input
                                    type="text"
                                    value={newGenreName}
                                    onChange={(e) => setNewGenreName(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-[#FFD875] focus:outline-none"
                                    placeholder="Nhập tên thể loại..."
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Chọn icon
                                </label>
                                <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                                    {availableIcons.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setSelectedIcon(icon)}
                                            className={`p-2 rounded-lg transition-all ${selectedIcon === icon
                                                    ? 'bg-[#FFD875] text-black shadow-[0_0_10px_rgba(255,216,117,0.5)]'
                                                    : 'bg-slate-700 hover:bg-slate-600'
                                                }`}
                                        >
                                            <span className="text-xl">{icon}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleAddNewGenre}
                                    className="flex-1 bg-[#FFD875] hover:bg-[#e5c368] text-black py-2 rounded-lg transition-colors font-medium"
                                >
                                    Thêm thể loại
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewGenreModal(false)}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Guide for genre selection */}
            <motion.div
                variants={formItemVariants}
                custom={2}
                className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 mt-6"
            >
                <h4 className="text-white text-sm mb-2 font-medium flex items-center">
                    <span className="inline-block w-4 h-4 rounded-full bg-[#FFD875] mr-2"></span>
                    Lưu ý khi chọn thể loại
                </h4>
                <ul className="text-gray-400 text-sm space-y-1 ml-6 list-disc">
                    <li>Chọn ít nhất một thể loại phim</li>
                    <li>Có thể chọn nhiều thể loại phim kết hợp</li>
                    <li>Thể loại xuất hiện đầu tiên sẽ là thể loại chính của phim</li>
                    <li>Có thể tạo thể loại mới với icon tùy chỉnh</li>
                </ul>
            </motion.div>
        </motion.div>
    );
};

export default GenresStep; 