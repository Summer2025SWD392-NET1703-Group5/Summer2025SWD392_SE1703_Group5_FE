// pages/PrivacyPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon, EyeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const PrivacyPage: React.FC = () => {
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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="w-8 h-8 text-black" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Chính sách bảo mật
            </h1>
            <p className="text-gray-400">
              Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn
            </p>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-8">
            {/* Section 1 */}
            <section>
              <div className="flex items-center mb-4">
                <EyeIcon className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-xl font-semibold text-yellow-400">
                  1. Thông tin chúng tôi thu thập
                </h2>
              </div>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">1.1 Thông tin cá nhân:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Họ tên, ngày sinh, giới tính</li>
                  <li>Số điện thoại và địa chỉ email</li>
                  <li>Địa chỉ nhà và thông tin liên lạc</li>
                  <li>Thông tin thanh toán (được mã hóa và bảo mật)</li>
                </ul>

                <p className="mt-4">
                  <strong className="text-white">1.2 Thông tin tự động:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Địa chỉ IP và thông tin thiết bị</li>
                  <li>Dữ liệu cookie và session</li>
                  <li>Lịch sử duyệt web và tương tác</li>
                  <li>Thông tin vị trí (nếu được cho phép)</li>
                </ul>

                <p className="mt-4">
                  <strong className="text-white">1.3 Thông tin giao dịch:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Lịch sử đặt vé và thanh toán</li>
                  <li>Phim đã xem và sở thích</li>
                  <li>Đánh giá và bình luận</li>
                  <li>Thông tin khuyến mãi đã sử dụng</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center mb-4">
                <LockClosedIcon className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-xl font-semibold text-yellow-400">
                  2. Cách chúng tôi sử dụng thông tin
                </h2>
              </div>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">2.1 Cung cấp dịch vụ:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Xử lý đặt vé và thanh toán</li>
                  <li>Gửi xác nhận và vé điện tử</li>
                  <li>Cung cấp hỗ trợ khách hàng</li>
                  <li>Quản lý tài khoản người dùng</li>
                </ul>

                <p className="mt-4">
                  <strong className="text-white">2.2 Cải thiện dịch vụ:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Phân tích hành vi người dùng</li>
                  <li>Tối ưu hóa trải nghiệm website</li>
                  <li>Phát triển tính năng mới</li>
                  <li>Đề xuất phim phù hợp</li>
                </ul>

                <p className="mt-4">
                  <strong className="text-white">2.3 Marketing và quảng cáo:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Gửi thông tin khuyến mãi (nếu đồng ý)</li>
                  <li>Quảng cáo phim mới và sự kiện</li>
                  <li>Chương trình thành viên và ưu đãi</li>
                  <li>Khảo sát ý kiến khách hàng</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                3. Bảo vệ thông tin
              </h2>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">3.1 Biện pháp kỹ thuật:</strong>
                </p>
                <div className="bg-slate-700 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-2">
                    <li>Mã hóa SSL/TLS cho tất cả giao dịch</li>
                    <li>Firewall và hệ thống phát hiện xâm nhập</li>
                    <li>Backup dữ liệu định kỳ</li>
                    <li>Kiểm tra bảo mật thường xuyên</li>
                  </ul>
                </div>

                <p className="mt-4">
                  <strong className="text-white">3.2 Biện pháp quản lý:</strong>
                </p>
                <div className="bg-slate-700 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-2">
                    <li>Giới hạn quyền truy cập theo vai trò</li>
                    <li>Đào tạo nhân viên về bảo mật</li>
                    <li>Chính sách mật khẩu mạnh</li>
                    <li>Giám sát hoạt động hệ thống</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                4. Chia sẻ thông tin
              </h2>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">4.1 Đối tác tin cậy:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Rạp chiếu phim và nhà phân phối</li>
                  <li>Nhà cung cấp dịch vụ thanh toán</li>
                  <li>Dịch vụ gửi email và SMS</li>
                  <li>Nhà cung cấp dịch vụ cloud</li>
                </ul>

                <p className="mt-4">
                  <strong className="text-white">4.2 Yêu cầu pháp lý:</strong>
                </p>
                <p>
                  Chúng tôi có thể tiết lộ thông tin khi được yêu cầu bởi cơ quan pháp luật 
                  hoặc để bảo vệ quyền lợi hợp pháp của chúng tôi và người dùng.
                </p>

                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mt-4">
                  <p className="text-red-300">
                    <strong>Lưu ý:</strong> Chúng tôi KHÔNG bán, cho thuê hoặc trao đổi 
                    thông tin cá nhân của bạn với bên thứ ba vì mục đích thương mại.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                5. Quyền của người dùng
              </h2>
              
              <div className="text-gray-300 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Quyền truy cập</h3>
                    <p className="text-sm">Xem thông tin cá nhân chúng tôi đang lưu trữ</p>
                  </div>
                  
                  <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Quyền chỉnh sửa</h3>
                    <p className="text-sm">Cập nhật hoặc sửa đổi thông tin cá nhân</p>
                  </div>
                  
                  <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Quyền xóa</h3>
                    <p className="text-sm">Yêu cầu xóa tài khoản và dữ liệu cá nhân</p>
                  </div>
                  
                  <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Quyền từ chối</h3>
                    <p className="text-sm">Từ chối nhận email marketing và quảng cáo</p>
                  </div>
                </div>

                <p className="mt-4">
                  Để thực hiện các quyền trên, vui lòng liên hệ với chúng tôi qua email 
                  <span className="text-yellow-400"> privacy@cinema.com</span> hoặc 
                  sử dụng tính năng trong tài khoản cá nhân.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                6. Cookie và công nghệ theo dõi
              </h2>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">6.1 Loại cookie chúng tôi sử dụng:</strong>
                </p>
                <div className="space-y-3">
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <p><strong className="text-white">Cookie cần thiết:</strong> Đảm bảo website hoạt động bình thường</p>
                  </div>
                  <div className="border-l-4 border-blue-400 pl-4">
                    <p><strong className="text-white">Cookie phân tích:</strong> Hiểu cách người dùng sử dụng website</p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-4">
                    <p><strong className="text-white">Cookie marketing:</strong> Cung cấp quảng cáo phù hợp</p>
                  </div>
                </div>

                <p className="mt-4">
                  <strong className="text-white">6.2 Quản lý cookie:</strong> 
                  Bạn có thể quản lý hoặc vô hiệu hóa cookie thông qua cài đặt trình duyệt. 
                  Tuy nhiên, việc này có thể ảnh hưởng đến trải nghiệm sử dụng website.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                7. Lưu trữ và xóa dữ liệu
              </h2>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">7.1 Thời gian lưu trữ:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Thông tin tài khoản: Cho đến khi bạn yêu cầu xóa</li>
                  <li>Lịch sử giao dịch: 5 năm (theo quy định pháp luật)</li>
                  <li>Dữ liệu phân tích: 2 năm</li>
                  <li>Logs hệ thống: 1 năm</li>
                </ul>

                <p className="mt-4">
                  <strong className="text-white">7.2 Xóa dữ liệu:</strong> 
                  Khi bạn yêu cầu xóa tài khoản, chúng tôi sẽ xóa thông tin cá nhân 
                  trong vòng 30 ngày, trừ dữ liệu cần thiết cho mục đích pháp lý.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                8. Chuyển giao dữ liệu quốc tế
              </h2>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  Dữ liệu của bạn có thể được lưu trữ và xử lý tại các máy chủ 
                  ở Việt Nam và các quốc gia khác. Chúng tôi đảm bảo áp dụng 
                  các biện pháp bảo mật phù hợp theo tiêu chuẩn quốc tế.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                9. Cập nhật chính sách
              </h2>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  Chúng tôi có thể cập nhật chính sách bảo mật này định kỳ. 
                  Các thay đổi quan trọng sẽ được thông báo qua email hoặc 
                  thông báo trên website trước khi có hiệu lực.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                10. Liên hệ về bảo mật
              </h2>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc khiếu nại nào về 
                  chính sách bảo mật này, vui lòng liên hệ với chúng tôi:
                </p>
                
                <div className="bg-slate-700 rounded-lg p-6 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-white font-semibold mb-3">Thông tin liên hệ</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-white">Email bảo mật:</strong> privacy@cinema.com</p>
                        <p><strong className="text-white">Email hỗ trợ:</strong> support@cinema.com</p>
                        <p><strong className="text-white">Hotline:</strong> 1900-1234</p>
                        <p><strong className="text-white">Fax:</strong> (84-28) 1234-5678</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-semibold mb-3">Địa chỉ văn phòng</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-white">Địa chỉ:</strong></p>
                        <p>Tầng 10, Tòa nhà ABC</p>
                        <p>123 Đường Nguyễn Huệ</p>
                        <p>Quận 1, TP. Hồ Chí Minh</p>
                        <p>Việt Nam</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-600">
                    <p className="text-sm">
                      <strong className="text-white">Giờ làm việc:</strong> 
                      Thứ 2 - Thứ 6: 8:00 - 18:00 | Thứ 7 - Chủ nhật: 9:00 - 17:00
                    </p>
                    <p className="text-sm mt-1">
                      <strong className="text-white">Thời gian phản hồi:</strong> 
                      Trong vòng 24-48 giờ làm việc
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Protection Officer */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                11. Cán bộ bảo vệ dữ liệu (DPO)
              </h2>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  Chúng tôi đã chỉ định Cán bộ Bảo vệ Dữ liệu để giám sát việc 
                  tuân thủ các quy định về bảo vệ dữ liệu cá nhân:
                </p>
                
                <div className="bg-slate-700 rounded-lg p-4">
                  <p><strong className="text-white">Email DPO:</strong> dpo@cinema.com</p>
                  <p><strong className="text-white">Điện thoại:</strong> (84-28) 1234-5679</p>
                  <p className="text-sm mt-2">
                    Bạn có thể liên hệ trực tiếp với DPO về các vấn đề liên quan 
                    đến quyền riêng tư và bảo vệ dữ liệu cá nhân.
                  </p>
                </div>
              </div>
            </section>

            {/* Incident Response */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                12. Ứng phó sự cố bảo mật
              </h2>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">12.1 Phát hiện sự cố:</strong> 
                  Chúng tôi có hệ thống giám sát 24/7 để phát hiện sớm các sự cố bảo mật.
                </p>
                
                <p>
                  <strong className="text-white">12.2 Thông báo sự cố:</strong> 
                  Trong trường hợp xảy ra vi phạm dữ liệu nghiêm trọng, chúng tôi sẽ:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Thông báo cho cơ quan quản lý trong vòng 72 giờ</li>
                  <li>Thông báo cho người dùng bị ảnh hưởng trong vòng 7 ngày</li>
                  <li>Cung cấp hướng dẫn bảo vệ tài khoản</li>
                  <li>Thực hiện các biện pháp khắc phục</li>
                </ul>
                
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 mt-4">
                  <p className="text-orange-300">
                    <strong>Nếu bạn nghi ngờ tài khoản bị xâm phám:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm">
                    <li>Đổi mật khẩu ngay lập tức</li>
                    <li>Liên hệ hotline: 1900-1234</li>
                    <li>Email khẩn cấp: security@cinema.com</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Compliance */}
            <section>
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">
                13. Tuân thủ pháp luật
              </h2>
              
              <div className="text-gray-300 space-y-4">
                <p>
                  Chính sách bảo mật này tuân thủ các quy định pháp luật hiện hành:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Pháp luật Việt Nam</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Luật An toàn thông tin mạng 2015</li>
                      <li>• Nghị định 13/2023/NĐ-CP</li>
                      <li>• Thông tư 47/2020/TT-BTTTT</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Tiêu chuẩn quốc tế</h3>
                    <ul className="text-sm space-y-1">
                      <li>• ISO 27001:2013</li>
                      <li>• GDPR (EU)</li>
                      <li>• PCI DSS</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Last updated and effective date */}
            <div className="border-t border-slate-700 pt-8 mt-8">
              <div className="bg-slate-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4 text-center">
                  Thông tin phiên bản
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-400">Phiên bản hiện tại</p>
                    <p className="text-white font-semibold">v2.1</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Có hiệu lực từ</p>
                    <p className="text-white font-semibold">01/01/2024</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Cập nhật lần cuối</p>
                    <p className="text-white font-semibold">15/06/2024</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-600 text-center">
                  <p className="text-sm text-gray-400">
                    Chính sách này được xem xét và cập nhật định kỳ để đảm bảo 
                    tuân thủ các quy định pháp luật mới nhất và bảo vệ tốt nhất 
                    quyền lợi của người dùng.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-6 mt-8">
              <h3 className="text-white font-semibold mb-4 text-center">
                Hành động nhanh
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  to="/profile/privacy-settings"
                  className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 text-center transition-colors group"
                >
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-yellow-400 transition-colors">
                    <LockClosedIcon className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-white font-medium">Cài đặt riêng tư</p>
                  <p className="text-sm text-gray-400 mt-1">Quản lý quyền riêng tư</p>
                </Link>
                
                <a
                  href="mailto:privacy@cinema.com"
                  className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 text-center transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-400 transition-colors">
                    <EyeIcon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-medium">Yêu cầu dữ liệu</p>
                  <p className="text-sm text-gray-400 mt-1">Xem dữ liệu của bạn</p>
                </a>
                
                <Link
                  to="/profile/delete-account"
                  className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 text-center transition-colors group"
                >
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-red-400 transition-colors">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-medium">Xóa tài khoản</p>
                  <p className="text-sm text-gray-400 mt-1">Xóa dữ liệu vĩnh viễn</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

