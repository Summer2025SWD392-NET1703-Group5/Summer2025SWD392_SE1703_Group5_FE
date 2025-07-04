import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import type { BreadcrumbItem } from '../types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, showHome = true }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {showHome && (
        <>
          <Link to="/" className="flex items-center hover:text-[#ffd875] transition-colors">
            <HomeIcon className="w-4 h-4 mr-1" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
        </>
      )}
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.path ? (
            <Link 
              to={item.path} 
              className="hover:text-[#ffd875] transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#ffd875] whitespace-nowrap">{item.label}</span>
          )}
          
          {index < items.length - 1 && (
            <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
