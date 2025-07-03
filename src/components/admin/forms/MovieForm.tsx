// src/components/admin/forms/MovieForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FilmIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  LanguageIcon,
  UserGroupIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import type { Movie, MovieFormData, MovieReferences } from '../../../types/movie';
import { movieService } from '../../../services/movieService';
import { referenceService } from '../../../services/referenceService';
import CreatableCombobox from '../common/CreatableCombobox';

const movieSchema = yup.object().shape({
  Movie_Name: yup.string().required('Tên phim không được để trống'),
  Release_Date: yup.string().required('Ngày khởi chiếu không được để trống'),
  Director: yup.string().required('Đạo diễn không được để trống'),
  Duration: yup.number().typeError('Thời lượng phải là số').min(1, 'Thời lượng phải lớn hơn 0').required('Thời lượng không được để trống'),
  Genre: yup.string().required('Phải chọn ít nhất một thể loại'),
  Rating: yup.string().required('Vui lòng chọn phân loại tuổi'),
  Synopsis: yup.string().required('Mô tả không được để trống'),
  Cast: yup.string().required('Phải có ít nhất một diễn viên'),
  Status: yup.string().oneOf(['Coming Soon', 'Now Showing', 'Ended', 'Cancelled', 'Inactive'] as const).required('Vui lòng chọn trạng thái'),
  Premiere_Date: yup.string().nullable().optional(),
  End_Date: yup.string().nullable().optional(),
  Production_Company: yup.string().nullable().optional(),
  Language: yup.string().nullable().optional(),
  Country: yup.string().nullable().optional(),
  Trailer_Link: yup.string().nullable().optional(),
  posterFile: yup.mixed().nullable().optional(),
  Poster_URL: yup.string().nullable().optional(),
});

interface MovieFormProps {
  movie?: Movie;
  onFormSubmit: () => void;
  onCancel: () => void;
}

const statusLabels: { [key: string]: string } = {
  'Coming Soon': 'Sắp chiếu',
  'Now Showing': 'Đang chiếu',
  'Ended': 'Đã kết thúc',
  'Cancelled': 'Đã hủy',
  'Inactive': 'Không hoạt động',
};

const MovieForm: React.FC<MovieFormProps> = ({ movie, onFormSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [references, setReferences] = useState<MovieReferences | null>(null);
  const [newCast, setNewCast] = useState('');

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MovieFormData>({
    resolver: yupResolver(movieSchema) as any,
    defaultValues: {
      Movie_Name: movie?.movieName || '',
      Synopsis: movie?.synopsis || '',
      Duration: movie?.duration || 0,
      Release_Date: movie?.releaseDate ? movie.releaseDate.split('T')[0] : '',
      Premiere_Date: movie?.premiereDate ? movie.premiereDate.split('T')[0] : null,
      End_Date: movie?.endDate ? movie.endDate.split('T')[0] : null,
      Director: movie?.director || '',
      Cast: movie?.cast || '',
      Genre: movie?.genre || '',
      Language: movie?.language || 'Tiếng Việt (Lồng tiếng)',
      Country: movie?.country || 'Việt Nam',
      Rating: movie?.rating || '',
      Status: movie?.status || 'Coming Soon',
      Production_Company: movie?.productionCompany || null,
      Trailer_Link: movie?.trailerLink || null,
      Poster_URL: movie?.posterURL || null,
      posterFile: null,
    }
  });

  const selectedGenres = watch('Genre')?.split(',').filter(Boolean) || [];
  const selectedCast = watch('Cast')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    const fetchReferences = async () => {
      const data = await referenceService.getMovieReferences();
      setReferences(data);
    };
    fetchReferences();
  }, []);

  const addCastMember = () => {
    if (newCast.trim()) {
      const currentCast = watch('Cast') || '';
      const newCastList = currentCast ? `${currentCast},${newCast.trim()}` : newCast.trim();
      setValue('Cast', newCastList, { shouldValidate: true });
      setNewCast('');
    }
  };

  const removeCastMember = (member: string) => {
    const currentCast = watch('Cast') || '';
    const newCastList = currentCast.split(',').filter(c => c.trim() !== member.trim()).join(',');
    setValue('Cast', newCastList, { shouldValidate: true });
  };

  const handleGenreSelection = (genre: string) => {
    const currentGenres = watch('Genre') || '';
    const genreArray = currentGenres.split(',').filter(g => g.trim() !== '');
    const newGenreArray = genreArray.includes(genre)
      ? genreArray.filter(g => g !== genre)
      : [...genreArray, genre];
    setValue('Genre', newGenreArray.join(','), { shouldValidate: true });
  };

  const onSubmit = async (data: MovieFormData) => {
    setLoading(true);
    const toastId = toast.loading(movie ? 'Đang cập nhật phim...' : 'Đang tạo phim...');

    const submissionData = { ...data };

    try {
      if (movie && movie.movieID) {
        await movieService.updateMovie(movie.movieID, submissionData);
        toast.success('Cập nhật phim thành công!', { id: toastId });
      } else {
        await movieService.createMovie(submissionData);
        toast.success('Tạo phim thành công!', { id: toastId });
      }
      onFormSubmit();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || (movie ? 'Cập nhật phim thất bại' : 'Tạo phim thất bại');
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!references) {
    return <div className="text-white text-center p-10">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          {movie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Thông tin cơ bản</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Title */}
              <div>
                <label htmlFor="Movie_Name" className="block text-sm font-medium text-gray-300 mb-2">
                  Tên phim *
                </label>
                <div className="relative">
                  <FilmIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="Movie_Name"
                    {...register('Movie_Name')}
                    className={`w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border ${errors.Movie_Name ? 'border-red-500' : 'border-slate-500'
                      } focus:border-yellow-500 focus:outline-none`}
                    placeholder="Nhập tên phim"
                  />
                </div>
                {errors.Movie_Name && <p className="mt-1 text-sm text-red-500">{errors.Movie_Name.message}</p>}
              </div>

              {/* Production Company */}
              <div>
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
                    />
                  )}
                />
              </div>
            </div>

            {/* Synopsis */}
            <div className="mb-6">
              <label htmlFor="Synopsis" className="block text-sm font-medium text-gray-300 mb-2">
                Mô tả *
              </label>
              <textarea
                id="Synopsis"
                {...register('Synopsis')}
                rows={4}
                className={`w-full px-4 py-2 bg-slate-600 text-white rounded-lg border ${errors.Synopsis ? 'border-red-500' : 'border-slate-500'
                  } focus:border-yellow-500 focus:outline-none`}
                placeholder="Nhập mô tả phim..."
              />
              {errors.Synopsis && <p className="mt-1 text-sm text-red-500">{errors.Synopsis.message}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Duration */}
              <div>
                <label htmlFor="Duration" className="block text-sm font-medium text-gray-300 mb-2">
                  Thời lượng (phút) *
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    id="Duration"
                    {...register('Duration')}
                    min="1"
                    className={`w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border ${errors.Duration ? 'border-red-500' : 'border-slate-500'
                      } focus:border-yellow-500 focus:outline-none`}
                    placeholder="120"
                  />
                </div>
                {errors.Duration && <p className="mt-1 text-sm text-red-500">{errors.Duration.message}</p>}
              </div>

              {/* Age Rating */}
              <div>
                <label htmlFor="Rating" className="block text-sm font-medium text-gray-300 mb-2">
                  Phân loại tuổi *
                </label>
                <Controller
                  name="Rating"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      id="Rating"
                      className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-yellow-500 focus:outline-none"
                    >
                      <option value="">Chọn phân loại</option>
                      {references.ratings.map(rating => (
                        <option key={rating} value={rating}>
                          {rating}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.Rating && <p className="mt-1 text-sm text-red-500">{errors.Rating.message}</p>}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="Status" className="block text-sm font-medium text-gray-300 mb-2">
                  Trạng thái *
                </label>
                <select
                  id="Status"
                  {...register('Status')}
                  className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Chọn trạng thái</option>
                  {references.statuses.map(status => (
                    <option key={status} value={status}>{statusLabels[status] || status}</option>
                  ))}
                </select>
                {errors.Status && <p className="mt-1 text-sm text-red-500">{errors.Status.message}</p>}
              </div>
            </div>
          </div>

          {/* Release Information */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Thông tin phát hành</h3>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Release Date */}
              <div>
                <label htmlFor="Release_Date" className="block text-sm font-medium text-gray-300 mb-2">
                  Ngày khởi chiếu *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    id="Release_Date"
                    {...register('Release_Date')}
                    className={`w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border ${errors.Release_Date ? 'border-red-500' : 'border-slate-500'
                      } focus:border-yellow-500 focus:outline-none`}
                  />
                </div>
                {errors.Release_Date && <p className="mt-1 text-sm text-red-500">{errors.Release_Date.message}</p>}
              </div>

              {/* Premiere Date */}
              <div>
                <label htmlFor="Premiere_Date" className="block text-sm font-medium text-gray-300 mb-2">
                  Ngày công chiếu
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    id="Premiere_Date"
                    {...register('Premiere_Date')}
                    min={watch('Release_Date')}
                    className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="End_Date" className="block text-sm font-medium text-gray-300 mb-2">
                  Ngày kết thúc
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    id="End_Date"
                    {...register('End_Date')}
                    min={watch('Release_Date')}
                    className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Language */}
              <div>
                <label htmlFor="Language" className="block text-sm font-medium text-gray-300 mb-2">
                  Ngôn ngữ
                </label>
                <select
                  id="Language"
                  {...register('Language')}
                  className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-yellow-500 focus:outline-none"
                >
                  {references.languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="Country" className="block text-sm font-medium text-gray-300 mb-2">
                  Quốc gia
                </label>
                <select
                  id="Country"
                  {...register('Country')}
                  className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-yellow-500 focus:outline-none"
                >
                  {references.countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cast and Crew */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Đoàn làm phim</h3>

            {/* Director */}
            <div className="mb-6">
              <Controller
                name="Director"
                control={control}
                render={({ field }) => (
                  <CreatableCombobox
                    label="Đạo diễn"
                    required
                    options={references.directors}
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Chọn hoặc nhập đạo diễn mới"
                    error={errors.Director?.message}
                  />
                )}
              />
            </div>

            {/* Cast */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Diễn viên *
              </label>

              <div className="flex gap-2 mb-4">
                <CreatableCombobox
                  label=""
                  options={references.actors}
                  value={newCast}
                  onChange={(value) => setNewCast(value)}
                  placeholder="Thêm diễn viên..."
                />
                <button
                  type="button"
                  onClick={addCastMember}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2 self-end"
                >
                  <PlusIcon className="w-4 h-4" />
                  Thêm
                </button>
              </div>

              {selectedCast.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCast.map(castMember => (
                    <span
                      key={castMember}
                      className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                    >
                      {castMember}
                      <button
                        type="button"
                        onClick={() => removeCastMember(castMember)}
                        className="hover:bg-yellow-600 rounded-full p-1"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {errors.Cast && <p className="mt-1 text-sm text-red-500">{errors.Cast.message}</p>}
            </div>
          </div>

          {/* Genres */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Thể loại *</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {references.genres.map(genre => (
                <label key={genre} className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => handleGenreSelection(genre)}
                    className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm">{genre}</span>
                </label>
              ))}
            </div>
            {errors.Genre && <p className="mt-1 text-sm text-red-500">{errors.Genre.message}</p>}
          </div>

          {/* Media */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Hình ảnh và Video</h3>

            <div className="grid grid-cols-1 gap-6 mb-6">
              {/* Poster */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Poster phim
                </label>
                <Controller
                  name="posterFile"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-500 file:text-black hover:file:bg-yellow-600"
                    />
                  )}
                />

                {(watch('posterFile') || watch('Poster_URL')) && (
                  <div className="mt-3">
                    <img
                      src={watch('posterFile') ? URL.createObjectURL(watch('posterFile') as File) : watch('Poster_URL') || ''}
                      alt="Poster preview"
                      className="w-32 h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Trailer */}
            <div className="mb-6">
              <label htmlFor="Trailer_Link" className="block text-sm font-medium text-gray-300 mb-2">
                Link trailer (YouTube)
              </label>
              <div className="relative">
                <PlayIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  id="Trailer_Link"
                  {...register('Trailer_Link')}
                  className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Đang xử lý...' : movie ? 'Cập nhật' : 'Tạo phim'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;

