// pages/TermsPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại trang chủ
          </Link>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Điều khoản sử dụng
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                1. Chấp nhận điều khoản
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Bằng việc truy cập và sử dụng website Cinema Booking, bạn đồng ý tuân thủ 
                và bị ràng buộc bởi các điều khoản và điều kiện được nêu trong tài liệu này. 
                Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, 
                vui lòng không sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                2. Định nghĩa dịch vụ
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Cinema Booking cung cấp nền tảng trực tuyến cho phép người dùng:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Xem thông tin về các bộ phim đang chiếu và sắp chiếu</li>
                <li>Tìm kiếm rạp chiếu phim và lịch chiếu</li>
                <li>Đặt vé xem phim trực tuyến</li>
                <li>Thanh toán và nhận vé điện tử</li>
                <li>Quản lý tài khoản và lịch sử đặt vé</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                3. Tài khoản người dùng
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">3.1 Đăng ký tài khoản:</strong> 
                  Để sử dụng đầy đủ các tính năng, bạn cần tạo tài khoản với thông tin chính xác và đầy đủ.
                </p>
                <p>
                  <strong className="text-white">3.2 Bảo mật tài khoản:</strong> 
                  Bạn có trách nhiệm bảo mật thông tin đăng nhập và thông báo ngay cho chúng tôi 
                  nếu phát hiện có hoạt động bất thường trong tài khoản.
                </p>
                <p>
                  <strong className="text-white">3.3 Độ tuổi:</strong> 
                  Bạn phải đủ 16 tuổi trở lên để tạo tài khoản. Người dưới 16 tuổi cần có 
                  sự đồng ý của phụ huynh hoặc người giám hộ.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                4. Đặt vé và thanh toán
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">4.1 Quy trình đặt vé:</strong> 
                  Việc đặt vé được thực hiện thông qua website với các bước: chọn phim, 
                  chọn suất chiếu, chọn ghế, thanh toán và nhận vé điện tử.
                </p>
                <p>
                  <strong className="text-white">4.2 Phương thức thanh toán:</strong> 
                  Chúng tôi chấp nhận thanh toán qua thẻ tín dụng, thẻ ghi nợ, 
                  ví điện tử và chuyển khoản ngân hàng.
                </p>
                <p>
                  <strong className="text-white">4.3 Xác nhận đặt vé:</strong> 
                  Sau khi thanh toán thành công, bạn sẽ nhận được email xác nhận 
                  và mã QR để sử dụng tại rạp.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                5. Chính sách hoàn tiền
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">5.1 Hủy vé:</strong> 
                  Vé có thể được hủy trước giờ chiếu ít nhất 2 giờ với phí hủy 10% giá vé.
                </p>
                <p>
                  <strong className="text-white">5.2 Hoàn tiền:</strong> 
                  Tiền hoàn sẽ được chuyển về tài khoản thanh toán gốc trong vòng 5-7 ngày làm việc.
                </p>
                <p>
                  <strong className="text-white">5.3 Trường hợp đặc biệt:</strong> 
                  Trong trường hợp rạp hủy suất chiếu, chúng tôi sẽ hoàn tiền 100% 
                  hoặc hỗ trợ đổi sang suất chiếu khác.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                6. Quy định sử dụng
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>Bạn cam kết không sử dụng dịch vụ để:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Vi phạm pháp luật hoặc quyền của bên thứ ba</li>
                  <li>Truyền tải nội dung có hại, bất hợp pháp hoặc không phù hợp</li>
                  <li>Can thiệp vào hoạt động của hệ thống</li>
                  <li>Sử dụng robot, bot hoặc công cụ tự động khác</li>
                  <li>Bán lại vé với giá cao hơn giá gốc</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                7. Trách nhiệm và giới hạn
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">7.1 Trách nhiệm của chúng tôi:</strong> 
                  Chúng tôi cam kết cung cấp dịch vụ đáng tin cậy nhưng không đảm bảo 
                  dịch vụ hoạt động liên tục không bị gián đoạn.
                </p>
                <p>
                  <strong className="text-white">7.2 Giới hạn trách nhiệm:</strong> 
                  Chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp, 
                  ngẫu nhiên hoặc do hậu quả phát sinh từ việc sử dụng dịch vụ.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                8. Thay đổi điều khoản
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Chúng tôi có quyền cập nhật các điều khoản này bất kỳ lúc nào. 
                Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website. 
                Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là 
                bạn chấp nhận các điều khoản mới.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                9. Liên hệ
              </h2>
              <div className="text-gray-300 space-y-2">
                <p>
                  Nếu có bất kỳ câu hỏi nào về điều khoản sử dụng, 
                  vui lòng liên hệ với chúng tôi:
                </p>
                <div className="bg-slate-700 rounded-lg p-4 mt-4">
                  <p><strong className="text-white">Email:</strong> support@cinema.com</p>
                  <p><strong className="text-white">Hotline:</strong> 1900-1234</p>
                  <p><strong className="text-white">Địa chỉ:</strong> 123 Đường ABC, Quận 1, TP.HCM</p>
                  <p><strong className="text-white">Giờ làm việc:</strong> 8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
                </div>
              </div>
            </section>

            {/* Last updated */}
            <div className="border-t border-slate-700 pt-6 mt-8">
              <p className="text-sm text-gray-400 text-center">
                Điều khoản này có hiệu lực từ ngày 01/01/2024 và được cập nhật lần cuối vào ngày 15/06/2024.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
