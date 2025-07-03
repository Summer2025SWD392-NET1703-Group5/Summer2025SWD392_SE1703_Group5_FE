import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { PhotoIcon, PlayIcon, ArrowUpTrayIcon, LinkIcon } from '@heroicons/react/24/outline';
import type { MovieFormData } from '../../../../types/movie';

const MediaStep: React.FC = () => {
    const { control, register, watch, setValue, formState: { errors } } = useFormContext<MovieFormData>();
    const [dragActive, setDragActive] = useState(false);
    const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

    // Animation variants for form elements
    const formItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (custom: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: custom * 0.1, duration: 0.4 }
        })
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const extractYoutubeVideoId = (url: string | null) => {
        if (!url) return null;

        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    const youtubeId = extractYoutubeVideoId(watch('Trailer_Link'));

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
            {/* Poster Upload */}
            <motion.div
                variants={formItemVariants}
                custom={0}
            >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Poster phim
                </label>

                <div className="mb-4 flex justify-center space-x-3">
                    <button
                        type="button"
                        onClick={() => setUploadMethod('file')}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${uploadMethod === 'file'
                            ? 'bg-[#FFD875] text-gray-900 shadow-[0_0_10px_0px_rgba(255,216,117,0.5)]'
                            : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                    >
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        Tải lên
                    </button>
                    <button
                        type="button"
                        onClick={() => setUploadMethod('url')}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${uploadMethod === 'url'
                            ? 'bg-[#FFD875] text-gray-900 shadow-[0_0_10px_0px_rgba(255,216,117,0.5)]'
                            : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                    >
                        <LinkIcon className="w-4 h-4" />
                        Nhập URL
                    </button>
                </div>

                {uploadMethod === 'url' ? (
                    <div className="mb-4">
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
                            <input
                                type="url"
                                id="Poster_URL"
                                {...register('Poster_URL')}
                                className="w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-500 focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-colors duration-300"
                                placeholder="Nhập URL hình ảnh poster..."
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Nhập đường dẫn URL đến hình ảnh poster (png, jpg, jpeg)</p>
                    </div>
                ) : (
                    <Controller
                        name="posterFile"
                        control={control}
                        render={({ field: { onChange } }) => (
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all duration-200 ${dragActive ? 'border-[#FFD875] bg-[#FFD875]/10 shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]' : 'border-gray-500'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragActive(false);

                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                        onChange(e.dataTransfer.files[0]);
                                    }
                                }}
                            >
                                <PhotoIcon className="w-14 h-14 text-[#FFD875] mb-4" />
                                <p className="text-gray-300 mb-3 text-center">Kéo và thả tệp hình ảnh poster vào đây</p>
                                <p className="text-gray-400 mb-4 text-center">hoặc</p>
                                <label className="cursor-pointer bg-[#FFD875] hover:bg-[#e5c368] text-gray-900 font-medium rounded-lg px-4 py-2 inline-flex items-center gap-2 shadow-[0_0_10px_0px_rgba(255,216,117,0.5)] transition-all duration-300">
                                    <ArrowUpTrayIcon className="w-4 h-4" />
                                    <span>Chọn tệp</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                                    />
                                </label>
                                <p className="text-xs text-gray-400 mt-3">PNG, JPG, GIF tối đa 5MB</p>
                            </div>
                        )}
                    />
                )}

                {/* Poster Preview */}
                {(watch('posterFile') || watch('Poster_URL')) && (
                    <motion.div
                        className="mt-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Xem trước</h4>
                        <div className="flex items-center space-x-4">
                            <div className="relative w-40 h-60 overflow-hidden rounded-lg shadow-lg border border-[#FFD875]/30">
                                <img
                                    src={watch('posterFile') ? URL.createObjectURL(watch('posterFile') as File) : watch('Poster_URL') || ''}
                                    alt="Poster preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (uploadMethod === 'file') {
                                            setValue('posterFile', null);
                                        } else {
                                            setValue('Poster_URL', '');
                                        }
                                    }}
                                    className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                                >
                                    Xóa ảnh
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Trailer Link */}
            <motion.div
                variants={formItemVariants}
                custom={1}
            >
                <label htmlFor="Trailer_Link" className="block text-sm font-medium text-gray-300 mb-2">
                    Link trailer (YouTube)
                </label>
                <div className="relative">
                    <PlayIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
                    <input
                        type="url"
                        id="Trailer_Link"
                        {...register('Trailer_Link')}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-500 focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-colors duration-300"
                        placeholder="https://www.youtube.com/watch?v=..."
                    />
                </div>

                {/* YouTube Trailer Preview */}
                {youtubeId && (
                    <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Xem trước trailer</h4>
                        <div className="aspect-video rounded-lg overflow-hidden shadow-xl border border-[#FFD875]/20">
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default MediaStep; 