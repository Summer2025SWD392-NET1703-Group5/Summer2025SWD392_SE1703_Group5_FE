import React from "react";
import Slider from "react-slick";
import "./BannerSlider.css"; // Tạo file này để custom style
import poster1 from "../../assets/images/poster1.png"
import poster2 from "../../assets/images/poster2.png"
const banners = [
  {
    image: poster1,
    alt: "Banner 1",
  },
  {
    image: poster2,
    alt: "Banner 2",
  },
  // Thêm các banner khác ở đây
];

const BannerSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <div className="banner-slider">
      <Slider {...settings}>
        {banners.map((banner, idx) => (
          <div key={idx} className="banner-slide">
            <img src={banner.image} alt={banner.alt} className="banner-image" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BannerSlider;