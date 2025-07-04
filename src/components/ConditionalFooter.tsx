import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';

const ConditionalFooter: React.FC = () => {
  const location = useLocation();
  
  // Routes that should not show footer
  const noFooterRoutes = [
    '/admin',
    '/staff/scanner'
  ];
  
  // Check if current route should hide footer
  const shouldHideFooter = noFooterRoutes.some(route => 
    location.pathname.startsWith(route)
  );
  
  // Don't render footer on admin pages or standalone staff pages
  if (shouldHideFooter) {
    return null;
  }
  
  return <Footer />;
};

export default ConditionalFooter; 