import React, { createContext, useState, useContext, ReactNode } from 'react';
import FullScreenLoader from '../components/FullScreenLoader';

interface LoadingContextType {
  showLoading: (text?: string) => void;
  hideLoading: () => void;
  showInlineLoading: (text?: string, size?: 'small' | 'medium' | 'large') => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined);
  const [isInline, setIsInline] = useState(false);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');

  const showLoading = (text?: string) => {
    setLoadingText(text);
    setIsInline(false);
    setLoading(true);
  };

  const showInlineLoading = (text?: string, inlineSize: 'small' | 'medium' | 'large' = 'medium') => {
    setLoadingText(text);
    setSize(inlineSize);
    setIsInline(true);
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, showInlineLoading }}>
      {loading && <FullScreenLoader variant={isInline ? 'inline' : 'fullscreen'} text={loadingText} size={size} />}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  
  return context;
};

export default LoadingProvider; 