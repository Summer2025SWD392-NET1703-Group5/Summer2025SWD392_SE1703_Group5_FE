import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import type { Movie, MovieFormData, MovieReferences } from '../../../types/movie';
import { movieService } from '../../../services/movieService';
import { referenceService } from '../../../services/referenceService';

// Step Components
import BasicInfoStep from './MovieFormSteps/BasicInfoStep';
import ReleaseInfoStep from './MovieFormSteps/ReleaseInfoStep';
import CastCrewStep from './MovieFormSteps/CastCrewStep';
import GenresStep from './MovieFormSteps/GenresStep';
import MediaStep from './MovieFormSteps/MediaStep';
import ButtonWithSpinner from '../common/ButtonWithSpinner';

const movieSchema = yup.object().shape({
    Movie_Name: yup.string().required('Tên phim không được để trống'),
    Release_Date: yup.string()
        .required('Ngày khởi chiếu không được để trống')
        .test('not-past', 'Ngày khởi chiếu phải từ ngày mai trở đi', function (value) {
            if (!value) return true;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const selectedDate = new Date(value);
            return selectedDate >= tomorrow;
        }),
    Director: yup.string().required('Đạo diễn không được để trống'),
    Duration: yup.number().typeError('Thời lượng phải là số').min(60, 'Thời lượng phải lớn hơn 60 phút').required('Thời lượng không được để trống'),
    Genre: yup.string().required('Phải chọn ít nhất một thể loại'),
    Rating: yup.string().required('Vui lòng chọn phân loại tuổi'),
    Synopsis: yup.string().required('Mô tả không được để trống'),
    Cast: yup.string().required('Phải có ít nhất một diễn viên'),
    Status: yup.string().oneOf(['Coming Soon', 'Now Showing', 'Ended', 'Cancelled', 'Inactive'] as const).required('Vui lòng chọn trạng thái'),
    Language: yup.string().required('Vui lòng chọn ngôn ngữ'),
    Country: yup.string().required('Vui lòng chọn quốc gia'),
    Premiere_Date: yup.string()
        .required('Ngày công chiếu không được để trống')
        .test('not-past', 'Ngày công chiếu phải từ ngày mai trở đi', function (value) {
            if (!value) return true;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const selectedDate = new Date(value);
            return selectedDate >= tomorrow;
        })
        .test('after-release', 'Ngày công chiếu phải sau ngày khởi chiếu', function (value) {
            if (!value) return true;
            const releaseDate = this.parent.Release_Date;
            if (!releaseDate) return true;
            return new Date(value) > new Date(releaseDate);
        })
        .test('not-same-as-release', 'Ngày công chiếu không được trùng với ngày khởi chiếu', function (value) {
            if (!value) return true;
            const releaseDate = this.parent.Release_Date;
            if (!releaseDate) return true;
            return value !== releaseDate;
        })
        .test('not-same-as-end', 'Ngày công chiếu không được trùng với ngày kết thúc', function (value) {
            if (!value) return true;
            const endDate = this.parent.End_Date;
            if (!endDate) return true;
            return value !== endDate;
        })
        .test('before-end-date', 'Ngày công chiếu không được vượt quá ngày kết thúc', function (value) {
            if (!value) return true;
            const endDate = this.parent.End_Date;
            if (!endDate) return true;
            return new Date(value) < new Date(endDate);
        }),
    End_Date: yup.string()
        .required('Ngày kết thúc không được để trống')
        .test('not-past', 'Ngày kết thúc phải từ ngày mai trở đi', function (value) {
            if (!value) return true;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const selectedDate = new Date(value);
            return selectedDate >= tomorrow;
        })
        .test('after-release', 'Ngày kết thúc phải sau ngày khởi chiếu', function (value) {
            if (!value) return true;
            const releaseDate = this.parent.Release_Date;
            if (!releaseDate) return true;
            return new Date(value) > new Date(releaseDate);
        })
        .test('after-premiere', 'Ngày kết thúc phải sau ngày công chiếu', function (value) {
            if (!value) return true;
            const premiereDate = this.parent.Premiere_Date;
            if (!premiereDate) return true;
            return new Date(value) > new Date(premiereDate);
        })
        .test('not-same-as-release', 'Ngày kết thúc không được trùng với ngày khởi chiếu', function (value) {
            if (!value) return true;
            const releaseDate = this.parent.Release_Date;
            if (!releaseDate) return true;
            return value !== releaseDate;
        })
        .test('not-same-as-premiere', 'Ngày kết thúc không được trùng với ngày công chiếu', function (value) {
            if (!value) return true;
            const premiereDate = this.parent.Premiere_Date;
            if (!premiereDate) return true;
            return value !== premiereDate;
        }),
    Production_Company: yup.string().nullable().optional(),
    Trailer_Link: yup.string().required('Phải nhập link trailer'),
    posterFile: yup.mixed().nullable().optional(),
    Poster_URL: yup.string().nullable().optional(),
}).test('poster-required', 'Phải thêm poster (tải lên hoặc nhập URL)', function (value) {
    if (!value) return false;
    // Nếu không có cả file lẫn url thì lỗi
    if (!value.posterFile && (!value.Poster_URL || value.Poster_URL.trim() === '')) {
        return this.createError({ path: 'Poster_URL', message: 'Phải thêm poster (tải lên hoặc nhập URL)' });
    }
    return true;
});

interface MultiStepMovieFormProps {
    movie?: Movie;
    mode: 'add' | 'edit';
    additionalData?: {
        statuses?: string[];
    };
}

const steps = [
    { id: 'basic', title: 'Thông tin cơ bản' },
    { id: 'release', title: 'Thông tin phát hành' },
    { id: 'cast', title: 'Đoàn làm phim' },
    { id: 'genres', title: 'Thể loại' },
    { id: 'media', title: 'Hình ảnh & Trailer' },
];

const MultiStepMovieForm: React.FC<MultiStepMovieFormProps> = ({ movie, mode, additionalData }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [references, setReferences] = useState<MovieReferences | null>(null);
    const [changingStep, setChangingStep] = useState(false);
    const [direction, setDirection] = useState(0); // -1 for going back, 1 for going forward
    const navigate = useNavigate();

    // Initialize form with default values
    const methods = useForm<MovieFormData>({
        resolver: yupResolver(movieSchema) as any,
        mode: 'onChange',
        defaultValues: {
            Movie_Name: (movie as any)?.Movie_Name || (movie as any)?.movieName || movie?.title || '',
            Synopsis: (movie as any)?.Synopsis || movie?.synopsis || '',
            Duration: (movie as any)?.Duration || movie?.duration || 0,
            Release_Date: (movie as any)?.Release_Date || (movie?.releaseDate ? movie.releaseDate.split('T')[0] : '') || '',
            Premiere_Date: (movie as any)?.Premiere_Date || (movie?.premiereDate ? movie.premiereDate.split('T')[0] : null) || null,
            End_Date: (movie as any)?.End_Date || (movie?.endDate ? movie.endDate.split('T')[0] : null) || null,
            Director: (movie as any)?.Director || movie?.director || '',
            Cast: (movie as any)?.Cast || movie?.cast || '',
            Genre: (movie as any)?.Genre || movie?.genre || '',
            Language: (movie as any)?.Language || movie?.language || '',
            Country: (movie as any)?.Country || movie?.country || '',
            Rating: (movie as any)?.Rating || movie?.rating || '',
            Status: (movie as any)?.Status || movie?.status || 'Coming Soon',
            Production_Company: (movie as any)?.Production_Company || movie?.productionCompany || null,
            Trailer_Link: (movie as any)?.Trailer_Link || movie?.trailerLink || null,
            Poster_URL: (movie as any)?.Poster_URL || (movie as any)?.posterURL || movie?.poster || null,
            posterFile: null,
        }
    });

    const { handleSubmit, trigger, formState: { errors }, watch } = methods;

    useEffect(() => {
        const fetchReferences = async () => {
            const data = await referenceService.getMovieReferences();

            // Nếu có additionalData, áp dụng các giới hạn
            if (additionalData) {
                if (additionalData.statuses) {
                    data.statuses = additionalData.statuses;
                }
            }

            setReferences(data);
        };
        fetchReferences();
    }, [additionalData, mode]);

    const goToNextStep = async () => {
        // Validate current step fields before proceeding
        const isValid = await validateCurrentStep();
        if (isValid) {
            setDirection(1);
            setChangingStep(true);
            setTimeout(() => {
                setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                setChangingStep(false);
                // Scroll to top when changing steps
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
        }
    };

    const goToPreviousStep = () => {
        setDirection(-1);
        setChangingStep(true);
        setTimeout(() => {
            setCurrentStep((prev) => Math.max(prev - 1, 0));
            setChangingStep(false);
            // Scroll to top when changing steps
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
    };

    const goToStep = async (stepIndex: number) => {
        // Không cho phép nhảy đến bước chưa hoàn thành
        if (stepIndex > currentStep) {
            // Validate tất cả các bước từ currentStep đến stepIndex - 1
            for (let i = currentStep; i < stepIndex; i++) {
                const tempCurrentStep = currentStep;
                // Tạm thời set currentStep để validate đúng bước
                setCurrentStep(i);
                const isValid = await validateStepByIndex(i);
                setCurrentStep(tempCurrentStep);

                if (!isValid) {
                    return; // Dừng lại nếu có bước không hợp lệ
                }
            }
        }

        // Thực hiện chuyển bước
        setDirection(stepIndex > currentStep ? 1 : -1);
        setChangingStep(true);
        setTimeout(() => {
            setCurrentStep(stepIndex);
            setChangingStep(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
    };

    const validateStepByIndex = async (stepIndex: number) => {
        let fieldsToValidate: string[] = [];

        switch (stepIndex) {
            case 0: // Basic info - xóa Language và Country
                fieldsToValidate = ['Movie_Name', 'Synopsis', 'Duration', 'Rating', 'Status', 'Production_Company'];
                break;
            case 1: // Release info - thêm Language, Country, Premiere_Date, End_Date
                fieldsToValidate = ['Release_Date', 'Language', 'Country', 'Premiere_Date', 'End_Date'];
                // In edit mode, if Release_Date is today or in the past, skip validation for Release_Date
                if (mode === 'edit') {
                    const releaseDateStr = watch('Release_Date');
                    if (releaseDateStr) {
                        const releaseDate = new Date(releaseDateStr);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (releaseDate <= today) {
                            fieldsToValidate = fieldsToValidate.filter(f => f !== 'Release_Date');
                        }
                    }
                }
                break;
            case 2: // Cast and crew
                fieldsToValidate = ['Director', 'Cast'];
                break;
            case 3: // Genres
                fieldsToValidate = ['Genre'];
                break;
            case 4: // Media
                return true;
        }

        const result = await trigger(fieldsToValidate as any);

        // Debug validation khi có lỗi
        if (!result) {
            console.log('Validation failed for step', stepIndex);
            console.log('Fields to validate:', fieldsToValidate);
            console.log('Current errors:', errors);

            // Debug đặc biệt cho director field
            if (fieldsToValidate.includes('Director')) {
                const directorValue = watch('Director');
                console.log('Director validation debug:', {
                    value: directorValue,
                    type: typeof directorValue,
                    isEmpty: !directorValue || (typeof directorValue === 'string' && directorValue.trim() === ''),
                    error: errors.Director
                });
            }

            // Hiển thị toast cảnh báo về lỗi validation
            const errorMessages = fieldsToValidate
                .filter(field => errors[field as keyof typeof errors])
                .map(field => {
                    const error = errors[field as keyof typeof errors];
                    return error?.message || `Lỗi ở trường ${field}`;
                });

            if (errorMessages.length > 0) {
                toast.error(`Vui lòng kiểm tra lại:\n${errorMessages.join('\n')}`, {
                    duration: 4000,
                    style: { whiteSpace: 'pre-line' }
                });
            }
        }

        return result;
    };

    const validateCurrentStep = async () => {
        return await validateStepByIndex(currentStep);
    };

    const onSubmit = async (data: MovieFormData) => {
        setLoading(true);
        const toastId = toast.loading(movie ? 'Đang cập nhật phim...' : 'Đang tạo phim...');

        try {
            // Validate dữ liệu cuối cùng trước khi gửi
            console.log('=== FORM SUBMISSION DEBUG ===');
            console.log('Dữ liệu gửi lên API:', data);
            console.log('Form errors:', errors);

            // Kiểm tra những field quan trọng
            const requiredFields = ['Movie_Name', 'Director', 'Cast', 'Duration', 'Genre', 'Rating', 'Language', 'Country', 'Release_Date', 'Premiere_Date', 'End_Date'];
            const missingFields = requiredFields.filter(field => {
                const value = data[field as keyof MovieFormData];
                const isEmpty = !value || (typeof value === 'string' && value.trim() === '');

                // Debug log cho field director đặc biệt
                if (field === 'Director') {
                    console.log('Director field debug:', {
                        fieldName: field,
                        value: value,
                        isEmpty: isEmpty,
                        type: typeof value
                    });
                }

                return isEmpty;
            });

            if (missingFields.length > 0) {
                console.error('Missing required fields:', missingFields);

                // Tạo message chi tiết hơn
                const fieldLabels: { [key: string]: string } = {
                    'Movie_Name': 'Tên phim',
                    'Director': 'Đạo diễn',
                    'Cast': 'Diễn viên',
                    'Duration': 'Thời lượng',
                    'Genre': 'Thể loại',
                    'Rating': 'Phân loại tuổi',
                    'Language': 'Ngôn ngữ',
                    'Country': 'Quốc gia',
                    'Release_Date': 'Ngày khởi chiếu',
                    'Premiere_Date': 'Ngày công chiếu',
                    'End_Date': 'Ngày kết thúc'
                };

                const missingFieldLabels = missingFields.map(field => fieldLabels[field] || field);
                toast.error(`Các trường bắt buộc chưa điền:\n${missingFieldLabels.join('\n')}`, {
                    id: toastId,
                    duration: 5000,
                    style: { whiteSpace: 'pre-line' }
                });
                return;
            }

            // Kiểm tra validation ngày tháng
            const releaseDate = new Date(data.Release_Date);
            const premiereDate = data.Premiere_Date ? new Date(data.Premiere_Date) : null;
            const endDate = data.End_Date ? new Date(data.End_Date) : null;

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            if (releaseDate < tomorrow) {
                toast.error('Ngày khởi chiếu phải từ ngày mai trở đi', { id: toastId });
                return;
            }

            if (premiereDate && premiereDate < tomorrow) {
                toast.error('Ngày công chiếu phải từ ngày mai trở đi', { id: toastId });
                return;
            }

            if (premiereDate && premiereDate <= releaseDate) {
                toast.error('Ngày công chiếu phải sau ngày khởi chiếu', { id: toastId });
                return;
            }

            if (endDate && premiereDate && endDate <= premiereDate) {
                toast.error('Ngày kết thúc phải sau ngày công chiếu', { id: toastId });
                return;
            }

            console.log('All validations passed, sending to API...');

            const movieId = (movie as any)?.Movie_ID || (movie as any)?.movieID || movie?.id;

            if (movie && movieId) {
                await movieService.updateMovie(movieId, data);
                toast.success('Cập nhật phim thành công!', { id: toastId });
            } else {
                await movieService.createMovie(data);
                toast.success('Tạo phim thành công!', { id: toastId });
            }

            // Redirect to movie list page
            navigate('/admin/movies');
        } catch (error: any) {
            console.error('API Error:', error);

            let errorMessage = movie ? 'Cập nhật phim thất bại' : 'Tạo phim thất bại';

            // Xử lý các loại lỗi khác nhau từ API
            if (error.response) {
                // Lỗi từ server (status 4xx hoặc 5xx)
                const { status, data: errorData } = error.response;

                if (status === 400) {
                    // Bad Request - lỗi validation từ server
                    if (errorData.success === false) {
                        // Xử lý format mới từ API
                        if (errorData.message) {
                            errorMessage = errorData.message;

                            // Ưu tiên errorDetails nếu có, nếu không mới dùng errors array
                            if (errorData.errorDetails && typeof errorData.errorDetails === 'object') {
                                const detailMessages = [];
                                for (const [field, messages] of Object.entries(errorData.errorDetails)) {
                                    if (Array.isArray(messages)) {
                                        detailMessages.push(`${field}: ${messages.join(', ')}`);
                                    } else {
                                        detailMessages.push(`${field}: ${messages}`);
                                    }
                                }
                                if (detailMessages.length > 0) {
                                    errorMessage += '\n\n' + detailMessages.join('\n');
                                }
                            } else if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                                // Chỉ dùng errors array nếu không có errorDetails
                                errorMessage += '\n\n' + errorData.errors.join('\n');
                            }
                        } else if (errorData.errorDetails) {
                            // Chỉ có errorDetails object
                            const detailMessages = [];
                            for (const [field, messages] of Object.entries(errorData.errorDetails)) {
                                if (Array.isArray(messages)) {
                                    detailMessages.push(`${field}: ${messages.join(', ')}`);
                                } else {
                                    detailMessages.push(`${field}: ${messages}`);
                                }
                            }
                            errorMessage = `Lỗi validation:\n${detailMessages.join('\n')}`;
                        } else if (errorData.errors && Array.isArray(errorData.errors)) {
                            // Chỉ có errors array
                            errorMessage = `Lỗi validation:\n${errorData.errors.join('\n')}`;
                        }
                    } else if (errorData.message) {
                        // Format cũ
                        errorMessage = errorData.message;
                    } else if (errorData.errors) {
                        // Nếu có nhiều lỗi validation (format cũ)
                        const errors = Array.isArray(errorData.errors)
                            ? errorData.errors.join(', ')
                            : Object.values(errorData.errors).join(', ');
                        errorMessage = `Lỗi validation: ${errors}`;
                    } else {
                        errorMessage = 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại';
                    }
                } else if (status === 401) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
                } else if (status === 403) {
                    errorMessage = 'Bạn không có quyền thực hiện thao tác này';
                } else if (status === 409) {
                    errorMessage = 'Tên phim đã tồn tại, vui lòng chọn tên khác';
                } else if (status === 422) {
                    // Unprocessable Entity - có thể có format tương tự 400
                    if (errorData.success === false && errorData.message) {
                        errorMessage = errorData.message;
                        if (errorData.errors && Array.isArray(errorData.errors)) {
                            errorMessage += '\n\n' + errorData.errors.join('\n');
                        }
                    } else {
                        errorMessage = errorData.message || 'Dữ liệu không thể xử lý, vui lòng kiểm tra lại';
                    }
                } else if (status >= 500) {
                    errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau';
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } else if (error.request) {
                // Lỗi mạng - không nhận được response từ server
                errorMessage = 'Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng';
            } else if (error.message) {
                // Lỗi khác
                errorMessage = error.message;
            }

            // Hiển thị lỗi chi tiết
            toast.error(() => (
                <div style={{ whiteSpace: 'pre-line', maxWidth: '400px' }}>
                    {errorMessage}
                </div>
            ), {
                id: toastId,
                duration: 6000, // Hiển thị lâu hơn để user đọc được
                style: {
                    maxWidth: '500px',
                    padding: '16px',
                }
            });
        } finally {
            setLoading(false);
        }
    };

    if (!references) {
        return (
            <div className="text-white text-center p-10 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD875]"></div>
            </div>
        );
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return <BasicInfoStep references={references} additionalData={additionalData} />;
            case 1:
                return <ReleaseInfoStep references={references} mode={mode} />;
            case 2:
                return <CastCrewStep references={references} />;
            case 3:
                return <GenresStep references={references} />;
            case 4:
                return <MediaStep />;
            default:
                return null;
        }
    };

    return (
        <FormProvider {...methods}>
            <div className="max-w-6xl mx-auto">
                {/* Step indicators */}
                <div className="flex items-center justify-between mb-8 px-2 relative">
                    {/* Progress bar */}
                    <div className="absolute top-5 left-0 h-0.5 bg-gray-500 w-full -z-10">
                        <motion.div
                            className="h-full bg-[#FFD875]"
                            initial={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>

                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center z-10">
                            <motion.button
                                type="button"
                                onClick={() => goToStep(index)}
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${currentStep >= index
                                    ? 'bg-[#FFD875] border-[#FFD875] text-gray-900 shadow-[0_0_15px_3px_rgba(255,216,117,0.3)] hover:bg-[#e5c368] cursor-pointer'
                                    : 'border-gray-500 text-gray-500 bg-slate-800 hover:border-gray-400 hover:text-gray-400 cursor-pointer'
                                    }`}
                                initial={false}
                                animate={{
                                    scale: currentStep === index ? [1, 1.1, 1] : 1,
                                }}
                                transition={{
                                    duration: 0.4,
                                    times: [0, 0.5, 1]
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {currentStep > index ? (
                                    <CheckCircleIcon className="w-6 h-6" />
                                ) : (
                                    <span className="font-medium">{index + 1}</span>
                                )}
                            </motion.button>
                            <div className="text-center mt-2">
                                <motion.p
                                    className={`text-xs font-medium cursor-pointer ${currentStep >= index ? 'text-[#FFD875]' : 'text-gray-500'
                                        } hover:text-[#FFD875] transition-colors`}
                                    animate={{
                                        opacity: currentStep === index ? 1 : 0.7,
                                        scale: currentStep === index ? 1.05 : 1
                                    }}
                                    onClick={() => goToStep(index)}
                                >
                                    {step.title}
                                </motion.p>
                            </div>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{
                            opacity: 0,
                            x: changingStep ? (direction > 0 ? 50 : -50) : 0
                        }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{
                            opacity: 0,
                            x: direction > 0 ? -50 : 50,
                            transition: { duration: 0.2 }
                        }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-800 rounded-lg shadow-xl p-6 mb-6"
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex justify-between mt-6">
                    <motion.button
                        type="button"
                        onClick={goToPreviousStep}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-2 py-2 px-5 rounded-lg transition-all duration-300
                        ${currentStep === 0
                                ? 'opacity-50 cursor-not-allowed bg-gray-700 text-gray-400'
                                : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                        whileHover={currentStep !== 0 ? { scale: 1.02 } : {}}
                        whileTap={currentStep !== 0 ? { scale: 0.98 } : {}}
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Quay lại
                    </motion.button>

                    {currentStep < steps.length - 1 ? (
                        <motion.button
                            type="button"
                            onClick={goToNextStep}
                            className="flex items-center gap-2 py-2 px-5 bg-[#FFD875] text-gray-900 rounded-lg hover:bg-[#e5c368] shadow-[0_0_15px_0px_rgba(255,216,117,0.4)] transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Tiếp theo
                            <ArrowRightIcon className="w-5 h-5" />
                        </motion.button>
                    ) : (
                        <ButtonWithSpinner
                            onClick={handleSubmit(onSubmit)}
                            loading={loading}
                            loadingText="Đang xử lý..."
                            defaultText={movie ? 'Cập nhật' : 'Tạo phim'}
                            className="flex items-center gap-2 py-2 px-6 bg-[#FFD875] text-gray-900 rounded-lg hover:bg-[#e5c368] shadow-[0_0_15px_0px_rgba(255,216,117,0.4)] transition-all duration-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:shadow-none"
                        >
                            {movie ? 'Cập nhật' : 'Tạo phim'}
                            <CheckCircleIcon className="w-5 h-5" />
                        </ButtonWithSpinner>
                    )}
                </div>
            </div>
        </FormProvider>
    );
};

export default MultiStepMovieForm; 