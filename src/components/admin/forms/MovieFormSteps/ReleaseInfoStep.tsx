import React, { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { CalendarIcon, GlobeAltIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import DatePicker, { registerLocale } from "react-datepicker";
import { format, isValid, parse } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import type { MovieReferences, MovieFormData } from "../../../../types/movie";

// Đăng ký locale tiếng Việt
registerLocale("vi", vi);

interface ReleaseInfoStepProps {
  references: MovieReferences;
  mode?: "add" | "edit";
}

const ReleaseInfoStep: React.FC<ReleaseInfoStepProps> = ({ references, mode }) => {
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<MovieFormData>();
  // Detect edit mode and lock release date if needed
  const isEditMode = mode === "edit" ;
  const releaseDateStr = watch("Release_Date");
  let isReleaseDateLocked = false;
  if (isEditMode && releaseDateStr) {
    const releaseDate = new Date(releaseDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (releaseDate <= today) {
      isReleaseDateLocked = true;
    }
  }

  // Animation variants for form elements
  const formItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.4 },
    }),
  };

  // Helper để chuyển string date sang Date object
  const parseDate = (dateString: string | null) => {
    if (!dateString) return null;
    const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
    return isValid(parsedDate) ? parsedDate : null;
  };

  // Lấy giá trị các ngày từ form
  const releaseDate = parseDate(watch("Release_Date") ?? null);
  const premiereDate = parseDate(watch("Premiere_Date") ?? null);
  const endDate = parseDate(watch("End_Date") ?? null);

  // Tạo ngày mai để làm minDate (không cho chọn hôm nay và quá khứ)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Effect để validate và reset ngày khi Release_Date thay đổi
  useEffect(() => {
    if (!releaseDate) return;

    let needsValidation = false;
    const resetMessages = [];

    // Kiểm tra Premiere_Date
    if (premiereDate && premiereDate <= releaseDate) {
      setValue("Premiere_Date", "");
      resetMessages.push("ngày công chiếu");
      needsValidation = true;
    }

    // Kiểm tra End_Date
    if (endDate) {
      if (endDate <= releaseDate) {
        setValue("End_Date", "");
        resetMessages.push("ngày kết thúc");
        needsValidation = true;
      } else if (premiereDate && endDate <= premiereDate) {
        // Nếu End_Date nhỏ hơn Premiere_Date mới
        setValue("End_Date", "");
        resetMessages.push("ngày kết thúc");
        needsValidation = true;
      }
    }

    // Hiển thị thông báo nếu có ngày bị reset
    if (resetMessages.length > 0) {
      toast.error(`Đã reset ${resetMessages.join(" và ")} vì không hợp lệ với ngày khởi chiếu mới`, {
        duration: 4000,
        style: {
          background: "#1e293b",
          color: "#ffffff",
          border: "1px solid #ef4444",
        },
      });
    }

    // Trigger validation cho các field liên quan
    if (needsValidation) {
      setTimeout(() => {
        trigger(["Premiere_Date", "End_Date"]);
      }, 100);
    }
  }, [releaseDate, setValue, trigger, premiereDate, endDate]);

  // Effect để validate End_Date khi Premiere_Date thay đổi
  useEffect(() => {
    if (!premiereDate || !endDate) return;

    if (endDate <= premiereDate) {
      setValue("End_Date", "");
      toast.error("Đã reset ngày kết thúc vì phải sau ngày công chiếu", {
        duration: 4000,
        style: {
          background: "#1e293b",
          color: "#ffffff",
          border: "1px solid #ef4444",
        },
      });
      setTimeout(() => {
        trigger("End_Date");
      }, 100);
    }
  }, [premiereDate, endDate, setValue, trigger]);

  // CSS tùy chỉnh cho DatePicker
  const datePickerCustomStyles = `
        .react-datepicker-wrapper {
            @apply w-full;
            position: relative !important;
        }
        
        .react-datepicker-popper {
            z-index: 9999 !important;
            position: absolute !important;
        }
        
        .react-datepicker {
            background-color: #1e293b !important;
            border: 1px solid #475569 !important;
            border-radius: 0.75rem !important;
            box-shadow: 0 0 20px rgba(255, 216, 117, 0.3) !important;
            color: black !important;
            font-family: inherit !important;
            z-index: 9999 !important;
            font-size: 1rem !important;
            min-width: 320px !important;
            position: relative !important;
        }
        
        .react-datepicker__header {
            background-color: #334155 !important;
            border-bottom: 1px solid #475569 !important;
            border-top-left-radius: 0.75rem !important;
            border-top-right-radius: 0.75rem !important;
            padding: 1rem !important;
        }
        
        .react-datepicker__current-month {
            color: #FFD875 !important;
            font-weight: 600 !important;
            font-size: 1.125rem !important;
            margin-bottom: 0.5rem !important;
        }
        
        .react-datepicker__day-name {
            color: #FFD875 !important;
            font-weight: 500 !important;
            width: 2.5rem !important;
            height: 2.5rem !important;
            line-height: 2.5rem !important;
            margin: 0.125rem !important;
            font-size: 0.875rem !important;
        }
        
        .react-datepicker__day {
            color: white !important;
            width: 2.5rem !important;
            height: 2.5rem !important;
            line-height: 2.5rem !important;
            margin: 0.125rem !important;
            border-radius: 0.5rem !important;
            transition: all 0.2s ease !important;
            font-size: 0.95rem !important;
            font-weight: 500 !important;
            cursor: pointer !important;
        }
        
        .react-datepicker__day:hover {
            background-color: #FFD875 !important;
            color: #1e293b !important;
            border-radius: 0.5rem !important;
            transform: scale(1.05) !important;
        }
        
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
            background-color: #FFD875 !important;
            color: #1e293b !important;
            font-weight: 600 !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 0 15px 3px rgba(255, 216, 117, 0.4) !important;
            transform: scale(1.05) !important;
        }
        
        .react-datepicker__day--today {
            background-color: rgba(255, 216, 117, 0.3) !important;
            color: #FFD875 !important;
            font-weight: 600 !important;
            border: 2px solid #FFD875 !important;
        }
        
        .react-datepicker__day--disabled {
            color: #64748b !important;
            cursor: not-allowed !important;
            opacity: 0.5 !important;
        }
        
        .react-datepicker__day--disabled:hover {
            background-color: transparent !important;
            color: #64748b !important;
            transform: none !important;
        }
        
        .react-datepicker__navigation {
            top: 1rem !important;
            width: 2.5rem !important;
            height: 2.5rem !important;
            border-radius: 0.5rem !important;
            transition: all 0.2s ease !important;
        }
        
        .react-datepicker__navigation:hover {
            background-color: rgba(255, 216, 117, 0.3) !important;
            transform: scale(1.1) !important;
        }
        
        .react-datepicker__navigation-icon::before {
            border-color: #FFD875 !important;
            width: 10px !important;
            height: 10px !important;
            border-width: 2px 2px 0 0 !important;
        }
        
        .react-datepicker__month-dropdown-container,
        .react-datepicker__year-dropdown-container {
            background-color: #1e293b !important;
        }
        
        .react-datepicker__month-dropdown,
        .react-datepicker__year-dropdown {
            background-color: #334155 !important;
            border: 1px solid #475569 !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
            max-height: 200px !important;
            overflow-y: auto !important;
        }
        
        .react-datepicker__month-option,
        .react-datepicker__year-option {
            color: white !important;
            padding: 0.75rem 1rem !important;
            transition: all 0.2s ease !important;
            font-size: 0.95rem !important;
        }
        
        .react-datepicker__month-option:hover,
        .react-datepicker__year-option:hover {
            background-color: #FFD875 !important;
            color: #1e293b !important;
            transform: translateX(4px) !important;
        }
        
        .react-datepicker__month-option--selected,
        .react-datepicker__year-option--selected {
            background-color: #FFD875 !important;
            color: #1e293b !important;
            font-weight: 600 !important;
        }
        
        .react-datepicker__triangle {
            display: none !important;
        }
        
        .react-datepicker__month {
            margin: 1rem !important;
            padding: 0.5rem !important;
        }
        
        .react-datepicker__week {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 0.25rem !important;
        }
    `;

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
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {/* Inject custom DatePicker styles */}
      <style>{datePickerCustomStyles}</style>

      {/* Step Header */}
      <motion.h2 className="text-xl font-bold text-white mb-6 flex items-center" variants={formItemVariants} custom={0}>
        <span className="text-[#FFD875] mr-2">2.</span>
        Thông tin phát hành
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-visible">
        {/* Release Date */}
        <motion.div variants={formItemVariants} custom={1} className="col-span-1 relative group overflow-visible">
          <label htmlFor="Release_Date" className="block text-sm font-medium text-[#FFD875] mb-2">
            Ngày khởi chiếu <span className="text-red-500">*</span>
          </label>
          <Controller
            name="Release_Date"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <DatePicker
                  id="Release_Date"
                  selected={parseDate(field.value ?? null)}
                  onChange={
                    isReleaseDateLocked
                      ? undefined
                      : (date: Date | null, _?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) =>
                          field.onChange(date ? date.toISOString().split("T")[0] : "")
                  }
                  locale="vi"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày khởi chiếu"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${
                    errors.Release_Date ? "border-red-500" : "border-[#FFD875]/30"
                  } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 ${
                    isReleaseDateLocked ? "bg-gray-600 cursor-not-allowed opacity-70" : "cursor-pointer"
                  } shadow-[0_0_10px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_15px_0_rgba(255,216,117,0.5)]`}
                  minDate={tomorrow}
                  popperPlacement="bottom"
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  disabled={isReleaseDateLocked}
                />
                {isReleaseDateLocked && (
                  <div className="absolute top-0 left-8 w-full h-full bg-transparent pointer-events-none flex items-center justify-center">
                    <span className="text-xs text-[#FFD875] bg-slate-800 rounded px-2 py-1">
                      Ngày khởi chiếu đã khóa
                    </span>
                  </div>
                )}
              </div>
            )}
          />
          {errors.Release_Date && <p className="mt-1 text-sm text-red-500">{errors.Release_Date.message}</p>}

          {releaseDate && (
            <div className="mt-2 text-xs text-gray-300 flex items-center">
              <span className="bg-[#FFD875]/10 text-[#FFD875] px-2 py-0.5 rounded font-medium mr-1">
                {format(releaseDate, "EEEE", { locale: vi })}
              </span>
              <span className="text-white">{format(releaseDate, "dd/MM/yyyy")}</span>
            </div>
          )}

          {/* Validation info */}
          <div className="mt-2 text-xs text-gray-400">
            <span className="flex items-center">
              <span className="w-1 h-1 bg-[#FFD875] rounded-full mr-2"></span>
              Phải từ ngày mai trở đi
            </span>
          </div>

          {/* Glowing effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD875]/0 via-[#FFD875]/20 to-[#FFD875]/0 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-x -z-10"></div>
        </motion.div>

        {/* Premiere Date */}
        <motion.div variants={formItemVariants} custom={2} className="col-span-1 relative group overflow-visible">
          <label htmlFor="Premiere_Date" className="block text-sm font-medium text-[#FFD875] mb-2">
            Ngày công chiếu <span className="text-red-500">*</span>
          </label>
          <Controller
            name="Premiere_Date"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="text-[#FFD875] w-5 h-5" />
                </div>
                <DatePicker
                  id="Premiere_Date"
                  selected={parseDate(field.value ?? null)}
                  onChange={(date: Date | null, _?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                  }}
                  locale="vi"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày công chiếu"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${
                    errors.Premiere_Date ? "border-red-500" : "border-[#FFD875]/30"
                  } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 cursor-pointer shadow-[0_0_10px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_15px_0_rgba(255,216,117,0.5)]`}
                  minDate={
                    releaseDate
                      ? new Date(
                          Math.max(
                            tomorrow.getTime(),
                            releaseDate.getTime() + 24 * 60 * 60 * 1000 // +1 ngày từ Release_Date
                          )
                        )
                      : tomorrow
                  } // Phải sau ngày khởi chiếu hoặc từ ngày mai
                  onFocus={(e) => e.target.blur()} // Ngăn không cho nhập trực tiếp
                  popperPlacement="bottom"
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                {premiereDate && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="inline-flex items-center justify-center bg-[#FFD875]/20 text-[#FFD875] rounded-full w-6 h-6 text-xs">
                      {format(premiereDate, "dd")}
                    </span>
                  </div>
                )}
              </div>
            )}
          />
          {errors.Premiere_Date && <p className="mt-1 text-sm text-red-500">{errors.Premiere_Date.message}</p>}

          {premiereDate && (
            <div className="mt-2 text-xs text-gray-300 flex items-center">
              <span className="bg-[#FFD875]/10 text-[#FFD875] px-2 py-0.5 rounded font-medium mr-1">
                {format(premiereDate, "EEEE", { locale: vi })}
              </span>
              <span className="text-white">{format(premiereDate, "dd/MM/yyyy")}</span>
            </div>
          )}

          {/* Validation info */}
          <div className="mt-2 text-xs text-gray-400">
            <span className="flex items-center">
              <span className="w-1 h-1 bg-[#FFD875] rounded-full mr-2"></span>
              Phải sau ngày khởi chiếu
            </span>
          </div>

          {/* Glowing effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD875]/0 via-[#FFD875]/20 to-[#FFD875]/0 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-x -z-10"></div>
        </motion.div>

        {/* End Date */}
        <motion.div variants={formItemVariants} custom={3} className="col-span-1 relative group overflow-visible">
          <label htmlFor="End_Date" className="block text-sm font-medium text-[#FFD875] mb-2">
            Ngày kết thúc <span className="text-red-500">*</span>
          </label>
          <Controller
            name="End_Date"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="text-[#FFD875] w-5 h-5" />
                </div>
                <DatePicker
                  id="End_Date"
                  selected={parseDate(field.value ?? null)}
                  onChange={(date: Date | null, _?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                  }}
                  locale="vi"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày kết thúc"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${
                    errors.End_Date ? "border-red-500" : "border-[#FFD875]/30"
                  } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-all duration-300 cursor-pointer shadow-[0_0_10px_0_rgba(255,216,117,0.3)] hover:shadow-[0_0_15px_0_rgba(255,216,117,0.5)]`}
                  minDate={(() => {
                    if (premiereDate) {
                      // Nếu có ngày công chiếu, End_Date phải sau Premiere_Date
                      return new Date(
                        Math.max(
                          tomorrow.getTime(),
                          premiereDate.getTime() + 24 * 60 * 60 * 1000 // +1 ngày từ Premiere_Date
                        )
                      );
                    } else if (releaseDate) {
                      // Nếu không có ngày công chiếu, End_Date phải sau Release_Date
                      return new Date(
                        Math.max(
                          tomorrow.getTime(),
                          releaseDate.getTime() + 24 * 60 * 60 * 1000 // +1 ngày từ Release_Date
                        )
                      );
                    }

                    return tomorrow; // Mặc định từ ngày mai
                  })()} // Phải sau ngày khởi chiếu/công chiếu hoặc từ ngày mai
                  onFocus={(e) => e.target.blur()} // Ngăn không cho nhập trực tiếp
                  popperPlacement="bottom"
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                {errors.End_Date && <p className="mt-1 text-sm text-red-500">{errors.End_Date.message}</p>}

                {endDate && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="inline-flex items-center justify-center bg-[#FFD875]/20 text-[#FFD875] rounded-full w-6 h-6 text-xs">
                      {format(endDate, "dd")}
                    </span>
                  </div>
                )}
              </div>
            )}
          />

          {endDate && (
            <div className="mt-2 text-xs text-gray-300 flex items-center">
              <span className="bg-[#FFD875]/10 text-[#FFD875] px-2 py-0.5 rounded font-medium mr-1">
                {format(endDate, "EEEE", { locale: vi })}
              </span>
              <span className="text-white">{format(endDate, "dd/MM/yyyy")}</span>
            </div>
          )}

          {/* Validation info */}
          <div className="mt-2 text-xs text-gray-400">
            <span className="flex items-center">
              <span className="w-1 h-1 bg-[#FFD875] rounded-full mr-2"></span>
              Phải sau ngày khởi chiếu/công chiếu
            </span>
          </div>

          {/* Glowing effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFD875]/0 via-[#FFD875]/20 to-[#FFD875]/0 rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-x -z-10"></div>
        </motion.div>
      </div>

      {/* Date relationship timeline */}
      {(releaseDate || premiereDate || endDate) && (
        <motion.div
          variants={formItemVariants}
          custom={4}
          className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 mt-6"
        >
          <h4 className="text-white text-sm mb-3 font-medium flex items-center">
            <span className="inline-block w-4 h-4 rounded-full bg-[#FFD875] mr-2"></span>
            Timeline kiểm tra
          </h4>
          <div className="flex items-center space-x-4 text-xs">
            {releaseDate && (
              <div className="flex items-center text-[#FFD875]">
                <span className="w-2 h-2 bg-[#FFD875] rounded-full mr-1"></span>
                <span>Khởi chiếu: {format(releaseDate, "dd/MM")}</span>
              </div>
            )}

            {releaseDate && premiereDate && (
              <div className="flex items-center">
                <span className="text-gray-400">→</span>
              </div>
            )}

            {premiereDate && (
              <div className="flex items-center text-blue-400">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                <span>Công chiếu: {format(premiereDate, "dd/MM")}</span>
              </div>
            )}

            {premiereDate && endDate && (
              <div className="flex items-center">
                <span className="text-gray-400">→</span>
              </div>
            )}

            {endDate && (
              <div className="flex items-center text-red-400">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                <span>Kết thúc: {format(endDate, "dd/MM")}</span>
              </div>
            )}
          </div>

          {/* Validation status */}
          <div className="mt-3 space-y-1">
            {releaseDate && premiereDate && (
              <div className="flex items-center text-xs">
                {premiereDate > releaseDate ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-green-400">Ngày công chiếu hợp lệ</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-red-400">Ngày công chiếu phải sau ngày khởi chiếu</span>
                  </>
                )}
              </div>
            )}

            {premiereDate && endDate && (
              <div className="flex items-center text-xs">
                {endDate > premiereDate ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-green-400">Ngày kết thúc hợp lệ</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-red-400">Ngày kết thúc phải sau ngày công chiếu</span>
                  </>
                )}
              </div>
            )}

            {releaseDate && endDate && !premiereDate && (
              <div className="flex items-center text-xs">
                {endDate > releaseDate ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-green-400">Ngày kết thúc hợp lệ</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-red-400">Ngày kết thúc phải sau ngày khởi chiếu</span>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Language */}
        <motion.div variants={formItemVariants} custom={5}>
          <label htmlFor="Language" className="block text-sm font-medium text-gray-300 mb-2">
            Ngôn ngữ <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <LanguageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
            <Controller
              name="Language"
              control={control}
              render={({ field }) => (
                <select
                  id="Language"
                  {...field}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${
                    errors.Language ? "border-red-500" : "border-slate-500"
                  } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-colors duration-300 appearance-none shadow-[0_0_8px_0px_rgba(255,216,117,0.2)] group-hover:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]`}
                >
                  <option value="">Chọn ngôn ngữ</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Tiếng Anh (Phụ đề Việt)">Tiếng Anh (Phụ đề Việt)</option>
                  <option value="Tiếng Việt (Phụ đề Anh)">Tiếng Việt (Phụ đề Anh)</option>
                  <option value="Tiếng Hàn">Tiếng Hàn</option>
                  <option value="Tiếng Nhật">Tiếng Nhật</option>
                  <option value="Tiếng Trung">Tiếng Trung</option>
                  <option value="Tiếng Pháp">Tiếng Pháp</option>
                  <option value="Tiếng Đức">Tiếng Đức</option>
                  <option value="Tiếng Tây Ban Nha">Tiếng Tây Ban Nha</option>
                  <option value="Khác">Khác</option>
                </select>
              )}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          {errors.Language && <p className="mt-1 text-sm text-red-500">{errors.Language.message}</p>}
        </motion.div>

        {/* Country */}
        <motion.div variants={formItemVariants} custom={6}>
          <label htmlFor="Country" className="block text-sm font-medium text-gray-300 mb-2">
            Quốc gia <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD875] w-5 h-5" />
            <Controller
              name="Country"
              control={control}
              render={({ field }) => (
                <select
                  id="Country"
                  {...field}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border ${
                    errors.Country ? "border-red-500" : "border-slate-500"
                  } focus:border-[#FFD875] focus:ring focus:ring-[#FFD875]/20 focus:outline-none transition-colors duration-300 appearance-none shadow-[0_0_8px_0px_rgba(255,216,117,0.2)] group-hover:shadow-[0_0_15px_0px_rgba(255,216,117,0.4)]`}
                >
                  <option value="">Chọn quốc gia</option>
                  {references.countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              )}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          {errors.Country && <p className="mt-1 text-sm text-red-500">{errors.Country.message}</p>}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ReleaseInfoStep;
