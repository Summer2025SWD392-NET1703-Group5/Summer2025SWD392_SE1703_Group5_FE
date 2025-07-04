import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'hero' | 'list';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 animate-pulse">
      <div className="aspect-[2/3] bg-slate-800" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
        <div className="flex space-x-2">
          <div className="h-4 bg-slate-800 rounded w-12" />
          <div className="h-4 bg-slate-800 rounded w-12" />
        </div>
        <div className="flex space-x-1">
          <div className="h-6 bg-slate-800 rounded w-16" />
          <div className="h-6 bg-slate-800 rounded w-16" />
        </div>
        <div className="h-10 bg-slate-800 rounded" />
      </div>
    </div>
  );

  const HeroSkeleton = () => (
    <div className="h-screen bg-slate-900 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700" />
      <div className="relative z-10 flex items-center h-full">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="h-16 bg-slate-700 rounded w-3/4" />
            <div className="flex space-x-4">
              <div className="h-6 bg-slate-700 rounded w-20" />
              <div className="h-6 bg-slate-700 rounded w-24" />
              <div className="h-6 bg-slate-700 rounded w-28" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-700 rounded" />
              <div className="h-4 bg-slate-700 rounded w-5/6" />
              <div className="h-4 bg-slate-700 rounded w-4/6" />
            </div>
            <div className="flex space-x-4">
              <div className="h-12 bg-slate-700 rounded w-32" />
              <div className="h-12 bg-slate-700 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex bg-slate-900 rounded-xl p-4 animate-pulse">
          <div className="w-24 h-36 bg-slate-800 rounded flex-shrink-0" />
          <div className="flex-1 ml-4 space-y-3">
            <div className="h-6 bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-800 rounded w-1/2" />
            <div className="flex space-x-2">
              <div className="h-6 bg-slate-800 rounded w-16" />
              <div className="h-6 bg-slate-800 rounded w-16" />
            </div>
            <div className="h-4 bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-800 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );

  if (type === 'hero') return <HeroSkeleton />;
  if (type === 'list') return <ListSkeleton />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
