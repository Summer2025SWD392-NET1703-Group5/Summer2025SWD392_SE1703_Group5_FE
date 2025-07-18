import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FilmIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import CreatableCombobox from '../../common/CreatableCombobox';
import type { MovieReferences, MovieFormData } from '../../../../types/movie';

interface BasicInfoStepProps {
    references: MovieReferences;
    additionalData?: any;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ references, additionalData }) => {
    const { register, control, watch, setValue, formState: { errors }, clearErrors, setError } = useFormContext<MovieFormData>();

    useEffect(() => {
        // Đảm bảo Status và Language được đặt đúng giá trị ban đầu nếu có sẵn
        if (additionalData?.statuses) {
            const currentStatus = watch('Status');
            if (currentStatus && !additionalData.statuses.includes(currentStatus)) {
                setValue('Status', additionalData.statuses[0]);
            }
        }
    }, [additionalData, setValue, watch]);

    const statusLabels: { [key: string]: string } = {
        'Coming Soon': 'Sắp chiếu',
        'Now Showing': 'Đang chiếu',
        'Ended': 'Đã kết thúc',
    };

    // Animation variants for form elements
    const formItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (custom: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: custom * 0.1, duration: 0.4 }
        })
    };

    // Xử lý validate runtime trên UI khi người dùng nhập
    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (value < 60) {
            setError('Duration', {
                type: 'manual',
                message: 'Thời lượng phim phải từ 60 phút trở lên'
            });
        } else {
            clearErrors('Duration');
        }
    };

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
                <span className="text-[#FFD875] mr-2">1.</span>
                Thông tin cơ bản
            </motion.h2>

            {/* Movie title */}
            <motion.div
                variants={formItemVariants}
                custom={1}
            >
                <label htmlFor="Movie_Name" className="block text-sm font-medium text-gray-300 mb-2">
                    Tên phim <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <FilmIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
                    <input
                        type="text"
                        id="Movie_Name"
                        {...register('Movie_Name')}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${errors.Movie_Name ? 'border-red-500' : 'border-[#FFD875]/30'
                            } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-colors duration-300 shadow-[0_0_8px_0px_rgba(255,216,117,0.2)]`}
                        placeholder="Nhập tên phim"
                    />
                </div>
                {errors.Movie_Name && <p className="mt-1 text-sm text-red-500">{errors.Movie_Name.message}</p>}
            </motion.div>

            {/* Production Company */}
            <motion.div
                variants={formItemVariants}
                custom={2}
                className="relative group"
            >
                <Controller
                    name="Production_Company"
                    control={control}
                    render={({ field }) => (
                        <CreatableCombobox
                            label="Công ty sản xuất"
                            options={references.productionCompanies}
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Chọn hoặc nhập công ty sản xuất"
                            error={errors.Production_Company?.message}
                            className="shadow-[0_0_10px_0px_rgba(255,216,117,0.3)] border-[#FFD875]/30 focus-within:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]"
                            labelClassName="text-[#FFD875]"
                        />
                    )}
                />

                {/* Subtle glowing effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD875]/0 via-[#FFD875]/20 to-[#FFD875]/0 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-x -z-10"></div>
            </motion.div>

            {/* Synopsis */}
            <motion.div
                variants={formItemVariants}
                custom={3}
            >
                <label htmlFor="Synopsis" className="block text-sm font-medium text-gray-300 mb-2">
                    Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="Synopsis"
                    {...register('Synopsis')}
                    rows={5}
                    className={`w-full px-4 py-3 bg-slate-700 text-white rounded-lg border ${errors.Synopsis ? 'border-red-500' : 'border-slate-500'
                        } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-colors duration-300`}
                    placeholder="Nhập mô tả phim..."
                />
                {errors.Synopsis && <p className="mt-1 text-sm text-red-500">{errors.Synopsis.message}</p>}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Duration */}
                <motion.div
                    variants={formItemVariants}
                    custom={4}
                >
                    <label htmlFor="Duration" className="block text-sm font-medium text-gray-300 mb-2">
                        Thời lượng (phút) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
                        <input
                            type="number"
                            id="Duration"
                            {...register('Duration', {
                                min: {
                                    value: 60,
                                    message: 'Thời lượng phim phải từ 60 phút trở lên'
                                },
                                validate: value =>
                                    Number(value) >= 60 || 'Thời lượng phim phải từ 60 phút trở lên'
                            })}
                            onChange={handleDurationChange}
                            min="60"
                            className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${errors.Duration ? 'border-red-500' : 'border-slate-500'
                                } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-colors duration-300`}
                            placeholder="Nhập thời lượng (tối thiểu 60 phút)"
                        />
                    </div>
                    {errors.Duration && (
                        <p className="mt-1 text-sm text-red-500 font-medium">
                            {errors.Duration.message}
                        </p>
                    )}
                    {!errors.Duration && (
                        <p className="mt-1 text-xs text-gray-400">
                            Thời lượng phim phải từ 60 phút trở lên
                        </p>
                    )}
                </motion.div>

                {/* Age Rating */}
                <motion.div
                    variants={formItemVariants}
                    custom={5}
                >
                    <label htmlFor="Rating" className="block text-sm font-medium text-gray-300 mb-2">
                        Phân loại tuổi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <StarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
                        <select
                            id="Rating"
                            {...register('Rating')}
                            className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${errors.Rating ? 'border-red-500' : 'border-slate-500'
                                } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-colors duration-300 appearance-none`}
                        >
                            <option value="">Chọn phân loại</option>
                            {references.ratings.map(rating => (
                                <option key={rating} value={rating}>
                                    {rating}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.Rating && <p className="mt-1 text-sm text-red-500">{errors.Rating.message}</p>}
                </motion.div>

                {/* Status */}
                <motion.div
                    variants={formItemVariants}
                    custom={6}
                >
                    <label htmlFor="Status" className="block text-sm font-medium text-gray-300 mb-2">
                        Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                        <FilmIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
                        <select
                            id="Status"
                            {...register('Status')}
                            className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${errors.Status ? 'border-red-500' : 'border-slate-500'
                                } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-colors duration-300 appearance-none shadow-[0_0_8px_0px_rgba(255,216,117,0.2)] group-hover:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]`}
                        >
                            {additionalData?.statuses ? (
                                // Nếu additionalData có chứa statuses (cho trang edit), dùng danh sách từ đó
                                additionalData.statuses.map((status: string) => (
                                    <option key={status} value={status}>
                                        {statusLabels[status] || status}
                                    </option>
                                ))
                            ) : (
                                // Mặc định cho trang Add
                                <>
                                    <option value="Coming Soon">Sắp chiếu</option>
                                    <option value="Now Showing">Đang chiếu</option>
                                    <option value="Ended">Đã kết thúc</option>
                                </>
                            )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                    {errors.Status && <p className="mt-1 text-sm text-red-500">{errors.Status.message}</p>}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default BasicInfoStep; 