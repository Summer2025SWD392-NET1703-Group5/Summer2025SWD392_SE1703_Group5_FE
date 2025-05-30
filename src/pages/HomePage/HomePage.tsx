import React from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import BannerSlider from '../../components/PosterSlider/BannerSlider';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage-root">
      <div className="homepage-content">
        <BannerSlider />
      </div>
    </div>
  );
};

export default HomePage;