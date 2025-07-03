// src/components/admin/common/ImageUpload.tsx
import React, { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  value: File | string | (File | string)[] | null;
  onChange: (value: File | string | (File | string)[] | null) => void;
  multiple?: boolean;
  aspectRatio?: string;
  placeholder?: string;
  maxSize?: number; // MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  multiple = false,
  aspectRatio,
  placeholder = "Tải lên hình ảnh",
  maxSize = 5,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Validate file size
    const oversizedFiles = fileArray.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Một số file vượt quá ${maxSize}MB`);
      return;
    }

    // Validate file type
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== fileArray.length) {
      alert('Chỉ chấp nhận file hình ảnh');
      return;
    }

    if (multiple) {
      const currentFiles = Array.isArray(value) ? value : [];
      onChange([...currentFiles, ...validFiles]);
    } else {
      onChange(validFiles[0] || null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    if (multiple && Array.isArray(value)) {
      const newFiles = value.filter((_, i) => i !== index);
      onChange(newFiles.length > 0 ? newFiles : null);
    } else {
      onChange(null);
    }
  };

  const getImageUrl = (file: File | string): string => {
    if (typeof file === 'string') return file;
    return URL.createObjectURL(file);
  };

  const renderPreview = () => {
    if (!value) return null;

    if (multiple && Array.isArray(value)) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={getImageUrl(file)}
                alt={`Preview ${index}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreview(getImageUrl(file))}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (value) {
      return (
        <div className="relative group">
          <img
            src={getImageUrl(value as File | string)}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
            style={{ aspectRatio }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
            <button
              type="button"
              onClick={() => setPreview(getImageUrl(value as File | string))}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => removeFile(0)}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="space-y-4">
        {renderPreview()}
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-yellow-500 bg-yellow-500/10'
              : 'border-slate-500 hover:border-slate-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">{placeholder}</p>
          <p className="text-sm text-gray-400 mb-4">
            Kéo thả file hoặc click để chọn
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Chọn file
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Chấp nhận: JPG, PNG, GIF. Tối đa {maxSize}MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUpload;
