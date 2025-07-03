import React, { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { UserIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import CreatableCombobox from '../../common/CreatableCombobox';
import type { MovieReferences, MovieFormData } from '../../../../types/movie';

interface CastCrewStepProps {
    references: MovieReferences;
}

const CastCrewStep: React.FC<CastCrewStepProps> = ({ references }) => {
    const { control, register, watch, setValue, formState: { errors } } = useFormContext<MovieFormData>();
    const [newCast, setNewCast] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Animation variants for form elements
    const formItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (custom: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: custom * 0.1, duration: 0.4 }
        })
    };

    const tagVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } }
    };

    const selectedCast = (watch('Cast') as string || '').split(',').filter(Boolean);

    useEffect(() => {
        // Lọc gợi ý dựa trên input
        if (newCast.trim() !== '') {
            const filteredSuggestions = references.actors.filter(actor =>
                actor.toLowerCase().includes(newCast.toLowerCase()) &&
                !selectedCast.includes(actor)
            );
            setSuggestions(filteredSuggestions);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
        setFocusedIndex(-1);
    }, [newCast, references.actors, selectedCast]);

    // Đóng danh sách gợi ý khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const addCastMember = (actor: string = newCast) => {
        if (actor.trim()) {
            const currentCast = (watch('Cast') as string) || '';
            const castList = currentCast.split(',').filter(Boolean);

            // Kiểm tra nếu diễn viên đã tồn tại trong danh sách
            if (!castList.includes(actor.trim())) {
                const newCastList = currentCast ? `${currentCast},${actor.trim()}` : actor.trim();
                setValue('Cast', newCastList, { shouldValidate: true });
            }

            setNewCast('');
            setShowSuggestions(false);
            inputRef.current?.focus();
        }
    };

    const removeCastMember = (member: string) => {
        const currentCast = (watch('Cast') as string) || '';
        const newCastList = currentCast.split(',').filter((c: string) => c.trim() !== member.trim()).join(',');
        setValue('Cast', newCastList, { shouldValidate: true });
    };

    // Xử lý phím Enter khi nhập diễn viên
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
                addCastMember(suggestions[focusedIndex]);
            } else {
                addCastMember();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (showSuggestions && suggestions.length > 0) {
                setFocusedIndex(prev => {
                    const newIndex = prev < suggestions.length - 1 ? prev + 1 : prev;
                    // Scroll đến item được focus
                    setTimeout(() => {
                        const element = document.getElementById(`suggestion-${newIndex}`);
                        element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }, 0);
                    return newIndex;
                });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex(prev => {
                const newIndex = prev > 0 ? prev - 1 : -1;
                // Scroll đến item được focus
                if (newIndex >= 0) {
                    setTimeout(() => {
                        const element = document.getElementById(`suggestion-${newIndex}`);
                        element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }, 0);
                }
                return newIndex;
            });
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowSuggestions(false);
            setFocusedIndex(-1);
        }
    };

    return (
        <motion.div
            className="space-y-8"
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
                <span className="text-[#FFD875] mr-2">3.</span>
                Đoàn làm phim
            </motion.h2>

            {/* Director */}
            <motion.div
                variants={formItemVariants}
                custom={1}
                className="relative group"
            >
                <label htmlFor="Director" className="block text-sm font-medium text-[#FFD875] mb-2">
                    Đạo diễn <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="Director"
                    control={control}
                    render={({ field }) => (
                        <CreatableCombobox
                            label=""
                            options={references.directors}
                            value={(field.value as string) || ''}
                            onChange={field.onChange}
                            placeholder="Chọn hoặc nhập đạo diễn mới"
                            error={errors.Director?.message}
                            iconLeft={true}
                            className="shadow-[0_0_10px_0px_rgba(255,216,117,0.3)] border-[#FFD875]/30 focus-within:shadow-[0_0_15px_0px_rgba(255,216,117,0.5)]"
                            icon={<UserIcon className="text-[#FFD875] w-5 h-5" />}
                        />
                    )}
                />

                {/* Glowing Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD875]/0 via-[#FFD875]/20 to-[#FFD875]/0 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-x -z-10"></div>
            </motion.div>

            {/* Cast */}
            <motion.div
                variants={formItemVariants}
                custom={2}
                className="mt-8 relative group"
            >
                <label className="block text-sm font-medium text-[#FFD875] mb-2">
                    Diễn viên <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2 mb-4">
                    <div className="flex-grow relative">
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5 z-10" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={newCast}
                                onChange={(e) => setNewCast(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => newCast.trim() && setShowSuggestions(true)}
                                placeholder="Nhập tên diễn viên..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-[#FFD875]/30 focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-colors shadow-[0_0_10px_0px_rgba(255,216,117,0.3)] focus:shadow-[0_0_15px_0px_rgba(255,216,117,0.5)]"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Nhấn Enter để thêm</p>

                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div
                                ref={suggestionsRef}
                                className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-52 overflow-y-auto"
                            >
                                {suggestions.map((actor, index) => (
                                    <div
                                        key={index}
                                        id={`suggestion-${index}`}
                                        onClick={() => addCastMember(actor)}
                                        onMouseEnter={() => setFocusedIndex(index)}
                                        className={`px-4 py-2 cursor-pointer transition-colors ${focusedIndex === index
                                            ? 'bg-[#FFD875] text-black shadow-[0_0_15px_0_rgba(255,216,117,0.5)]'
                                            : 'text-white hover:bg-slate-700'
                                            }`}
                                    >
                                        {actor}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => addCastMember()}
                        className="bg-[#FFD875] hover:bg-[#e5c368] text-black h-12 px-4 rounded-lg transition-all duration-300 shadow-[0_0_15px_0px_rgba(255,216,117,0.5)] flex items-center gap-2 self-start hover:shadow-[0_0_20px_3px_rgba(255,216,117,0.6)]"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Thêm
                    </button>
                </div>

                <motion.div
                    className="flex flex-wrap gap-2 bg-slate-700/50 p-4 rounded-lg border border-slate-600 min-h-[100px] shadow-[0_0_10px_0px_rgba(255,216,117,0.15)]"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.05
                            }
                        }
                    }}
                >
                    {selectedCast.length > 0 ? (
                        selectedCast.map(castMember => (
                            <motion.span
                                key={castMember}
                                className="bg-[#FFD875] text-black px-3 py-1 rounded-lg text-sm flex items-center gap-2 shadow-[0_0_10px_0px_rgba(255,216,117,0.5)]"
                                variants={tagVariants}
                                layout
                            >
                                {castMember}
                                <button
                                    type="button"
                                    onClick={() => removeCastMember(castMember)}
                                    className="hover:bg-[#e5c368] rounded-full p-1 transition-colors"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </motion.span>
                        ))
                    ) : (
                        <p className="text-gray-400 italic text-sm">Chưa có diễn viên nào được thêm</p>
                    )}
                </motion.div>
                {errors.Cast && <p className="mt-2 text-sm text-red-500">{errors.Cast.message}</p>}

                {/* Glowing Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD875]/0 via-[#FFD875]/20 to-[#FFD875]/0 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-x -z-10"></div>
            </motion.div>

            {/* Hướng dẫn thêm diễn viên */}
            <motion.div
                variants={formItemVariants}
                custom={3}
                className="bg-slate-700/30 p-4 rounded-lg border border-slate-600"
            >
                <h4 className="text-white text-sm mb-2 font-medium flex items-center">
                    <span className="inline-block w-4 h-4 rounded-full bg-[#FFD875] mr-2"></span>
                    Mẹo thêm diễn viên
                </h4>
                <ul className="text-gray-400 text-sm space-y-1 ml-6 list-disc">
                    <li>Nhập tên diễn viên và nhấn phím Enter để thêm nhanh</li>
                    <li>Có thể thêm nhiều diễn viên tùy ý</li>
                    <li>Nhấp vào nút X để xóa diễn viên đã thêm</li>
                </ul>
            </motion.div>
        </motion.div>
    );
};

export default CastCrewStep; 