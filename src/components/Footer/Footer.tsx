import React from 'react';
import './Footer.css';
import logo from '../../assets/images/Logo.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__left">
          <img src={logo} alt="Logo" className="footer__logo" />
          <div>
            <div className="footer__logo-title">Galaxy</div>
            <div className="footer__desc">Phim hay cả vũ trụ</div>
          </div>
        </div>
        <div className="footer__nav">
          <a href="#">Hỏi-Đáp</a>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Điều khoản sử dụng</a>
          <a href="#">Giới thiệu</a>
          <a href="#">Liên hệ</a>
        </div>
        <div className="footer__socials">
          <a href="#" className="footer__icon">🌐</a>
          <a href="#" className="footer__icon">📘</a>
          <a href="#" className="footer__icon">🐦</a>
          <a href="#" className="footer__icon">📸</a>
          <a href="#" className="footer__icon">🎵</a>
          <a href="#" className="footer__icon">▶️</a>
        </div>
      </div>
      <div className="footer__links">
        <a href="#">Dongphim</a>
        <a href="#">Ghienphim</a>
        <a href="#">Motphim</a>
        <a href="#">Subnhanh</a>
      </div>
      <div className="footer__desc2">
        Galaxy – Phim hay cá vũ trụ- Trang xem phim online chất lượng cao miễn phí! Vietsub, thuyết minh, lồng tiếng full HD. Kho phim mới không lồ, phim chiếu rạp, phim bộ, phim lẻ từ nhiều quốc gia như Việt Nam, Hàn Quốc, Trung Quốc, Thái Lan, Nhật Bản, Âu Mỹ... đa dạng thể loại. Khám phá nền tảng phim trực tuyến hay nhất 2024 chất lượng 4K!
      </div>
      <div className="footer__copyright">
        © 2024 Galaxy
      </div>
      <button className="footer__scrolltop" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
        ĐẦU TRANG
      </button>
    </footer>
  );
};

export default Footer; 