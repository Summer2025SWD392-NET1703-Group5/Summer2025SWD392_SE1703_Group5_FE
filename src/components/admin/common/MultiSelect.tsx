// src/components/admin/common/MultiSelect.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !value.includes(option.value)
  );

  const selectedOptions = options.filter(option => value.includes(option.value));

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 border border-slate-500 focus:border-yellow-500 cursor-pointer min-h-[42px] flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map(option => (
              <span
                key={option.value}
                className="inline-flex items-center px-2 py-1 bg-yellow-600 text-white rounded text-sm"
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(option.value);
                  }}
                  className="ml-1 text-yellow-200 hover:text-white"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10 max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-slate-600">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="Tìm kiếm..."
                autoFocus
              />
            </div>
          )}
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className="px-4 py-2 text-white hover:bg-slate-600 cursor-pointer"
                  onClick={() => toggleOption(option.value)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-400">
                {searchTerm ? 'Không tìm thấy kết quả' : 'Không có tùy chọn nào'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
