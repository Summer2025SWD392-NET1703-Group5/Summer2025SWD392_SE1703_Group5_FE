import React, { useState } from 'react';
import { 
  FilmIcon,
  SparklesIcon,
  HeartIcon,
  FireIcon,
  ShieldCheckIcon,
  FaceSmileIcon
} from '@heroicons/react/24/solid';

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  count: number;
}

interface CategoryTabsProps {
  onCategoryChange?: (categoryId: string) => void;
  activeCategory?: string;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  onCategoryChange, 
  activeCategory = 'all' 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(activeCategory);

  const categories: Category[] = [
    {
      id: 'all',
      name: 'Tất cả',
      icon: FilmIcon,
      color: 'from-amber-400 to-amber-600',
      count: 10000
    },
    {
      id: 'action',
      name: 'Hành Động',
      icon: FireIcon,
      color: 'from-red-400 to-red-600',
      count: 2500
    },
    {
      id: 'romance',
      name: 'Lãng Mạn',
      icon: HeartIcon,
      color: 'from-pink-400 to-pink-600',
      count: 1800
    },
    {
      id: 'comedy',
      name: 'Hài Hước',
      icon: FaceSmileIcon,
      color: 'from-yellow-400 to-yellow-600',
      count: 1200
    },
    {
      id: 'drama',
      name: 'Chính Kịch',
      icon: SparklesIcon,
      color: 'from-purple-400 to-purple-600',
      count: 3200
    },
    {
      id: 'thriller',
      name: 'Kinh Dị',
      icon: ShieldCheckIcon,
      color: 'from-gray-400 to-gray-600',
      count: 900
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((category) => {
        const IconComponent = category.icon;
        const isActive = selectedCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              isActive
                ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
            }`}
          >
            <IconComponent className="w-4 h-4" />
            <span>{category.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-slate-600 text-gray-400 group-hover:bg-slate-500'
            }`}>
              {category.count.toLocaleString()}
            </span>
            
            {/* Hover effect */}
            {!isActive && (
              <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300`} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
