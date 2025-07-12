import React, { useState, useEffect } from "react";
import { XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import api from "../config/api";
import QRCode from "qrcode";

interface PayOSQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onPaymentSuccess?: (transactionId: string) => void;
  amount?: number;
  ticketInfo?: string;
  skipConfirmation?: boolean;
  isStaff?: boolean;
}

const PayOSQRModal: React.FC<PayOSQRModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  onPaymentSuccess,
  amount = 0,
  ticketInfo = "",
  skipConfirmation = false,
  isStaff = false,
}) => {
  const [paymentQrUrl, setPaymentQrUrl] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInterval, setCheckInterval] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(amount);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Tạo QR code từ API phù hợp với loại user (staff/customer)
  useEffect(() => {
    // Chỉ chạy khi modal mở
    if (!isOpen) return;

    const fetchPaymentQR = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // Sử dụng amount từ props trực tiếp
        if (amount > 0) {
          setPaymentAmount(amount);
        }

        let response;
        let responseData;

        // Sử dụng API khác nhau cho staff và customer
        if (isStaff && bookingId) {
          // API dành cho staff - yêu cầu bookingId
          response = await api.post(`/payos/staff/create-payment-link/${bookingId}`);
        } else {
          // API thông thường cho khách hàng
          response = await api.get("/payos/pending-payment-url");
        }

        responseData = response.data?.data || response.data;

        console.log("=== PayOS API Response Debug ===");
        console.log("Full response:", response);
        console.log("Response data:", responseData);

        // Lấy QR code từ response theo structure thực tế
        let qrData = null;
        let orderCode = null;
        let paymentAmount = null;

        // Kiểm tra structure: data.payment.qrCode
        if (responseData?.payment?.qrCode) {
          qrData = responseData.payment.qrCode;
          orderCode = responseData.payment.orderCode;
          paymentAmount = responseData.payment.amount;
          console.log("Found QR in data.payment.qrCode");
        }
        // Fallback: kiểm tra các structure khác
        else if (responseData?.qrCode) {
          qrData = responseData.qrCode;
          orderCode = responseData.orderCode;
          paymentAmount = responseData.amount;
          console.log("Found QR in data.qrCode");
        }

        console.log("Extracted QR Data:", qrData);
        console.log("Extracted Order Code:", orderCode);
        console.log("Extracted Amount:", paymentAmount);

        if (qrData) {
          try {
            // Tạo QR code từ QR data sử dụng thư viện local
            const qrDataUrl = await QRCode.toDataURL(qrData, {
              width: 250,
              margin: 2,
              color: {
                dark: "#000000",
                light: "#FFFFFF",
              },
            });

            console.log("Generated QR DataURL successfully");

            // Cập nhật state
            setPaymentQrUrl(qrDataUrl);
            setOrderCode(orderCode);

            if (paymentAmount) {
              setPaymentAmount(paymentAmount);
            }

            // Bắt đầu kiểm tra trạng thái thanh toán
            if (orderCode) {
              startCheckPaymentStatus(orderCode);
            }

            console.log("QR Modal state updated successfully");
          } catch (qrError) {
            console.error("Lỗi khi tạo QR code:", qrError);
            setErrorMessage("Không thể tạo mã QR thanh toán - Vui lòng thử lại");
          }
        } else {
          console.error("Không tìm thấy QR code trong response");
          console.error("Response structure:", Object.keys(responseData || {}));
          setErrorMessage("Không thể tạo mã QR thanh toán - Vui lòng thử lại");
        }
      } catch (error: any) {
        console.error("PayOS QR error:", error);
        setErrorMessage(error.response?.data?.message || error.message || "Lỗi khi tạo mã QR thanh toán");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentQR();

    // Cleanup interval khi component unmount
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [isOpen, bookingId, isStaff, amount]);

  // Theo dõi trạng thái thanh toán - giữ nguyên vì cần thiết
  const startCheckPaymentStatus = (orderCode: string) => {
    if (checkInterval) {
      clearInterval(checkInterval);
    }

    const intervalId = window.setInterval(async () => {
      if (!orderCode) return;

      try {
        const response = await api.get(`/payos/check-status/${orderCode}`);
        const status = response.data?.data?.status || response.data?.status;

        if (status === "PAID" || status === "COMPLETED" || status === "SUCCESS") {
          clearInterval(intervalId);
          setCheckInterval(null);

          if (onPaymentSuccess) {
            const transactionId = response.data?.data?.transactionId || orderCode;
            onPaymentSuccess(transactionId);
          }
        }
      } catch (error) {
        // Xử lý lỗi im lặng
      }
    }, 3000);

    setCheckInterval(intervalId);
  };

  // Hàm xử lý đóng modal có xác nhận
  const handleCloseRequest = () => {
    if (skipConfirmation) {
      handleConfirmClose();
    } else {
      setShowConfirmClose(true);
    }
  };

  // Hàm đóng modal mà không cần xác nhận
  const handleConfirmClose = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
    setShowConfirmClose(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full border-2 border-[#FFD875]/60 shadow-lg shadow-[#FFD875]/10 m-4 relative">
        <button onClick={handleCloseRequest} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <XCircleIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-[#FFD875]">Thanh toán PayOS</h2>

        {/* Hiển thị số tiền thanh toán */}
        <div className="mb-4 text-center">
          <p className="text-2xl font-bold text-[#FFD875] drop-shadow-[0_0_10px_rgba(255,216,117,0.5)]">
            {paymentAmount ? paymentAmount.toLocaleString("vi-VN") : 0} đ
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 border-4 border-[#FFD875] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white">Đang tạo mã QR...</p>
          </div>
        ) : errorMessage ? (
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-center">
            <p className="text-red-400">{errorMessage}</p>
            <button
              onClick={handleCloseRequest}
              className="mt-4 bg-[#FFD875] text-black px-4 py-2 rounded-lg hover:bg-[#FFD875]/80 transition-colors"
            >
              Đóng
            </button>
          </div>
        ) : paymentQrUrl ? (
          <>
            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="flex justify-center">
                <img
                  src={paymentQrUrl}
                  alt="QR Code thanh toán"
                  className="max-w-full h-auto"
                  onError={(e) => {
                    console.error("QR Image load error:", e);
                    console.error("QR URL:", paymentQrUrl);
                    setErrorMessage("Không thể tải mã QR");
                  }}
                  onLoad={() => console.log("QR Image loaded successfully")}
                />
              </div>
            </div>

            <p className="text-center text-sm text-gray-300 mb-6">Quét mã QR bằng ứng dụng ngân hàng để thanh toán</p>

            <div className="text-center">
              <a
                href={paymentQrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-[#FFD875] to-[#E6B840] text-slate-900 py-3 px-8 rounded-lg font-medium hover:shadow-[0_0_15px_rgba(255,216,117,0.4)] transition-all duration-300 shadow-md hover:-translate-y-0.5"
              >
                Mở liên kết thanh toán
              </a>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-300">Không thể tạo mã QR thanh toán</p>
          </div>
        )}
      </div>

      {/* Modal xác nhận đóng - chỉ hiển thị khi showConfirmClose = true */}
      {showConfirmClose && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-xl max-w-md w-full border border-gray-700/50 shadow-lg m-4 relative">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-[#FFD875]" />
              <h3 className="text-xl font-medium text-white">Xác nhận hủy thanh toán</h3>
            </div>

            <p className="text-gray-300 mb-6">
              Bạn có chắc chắn muốn hủy quá trình thanh toán này? Vé của bạn sẽ không được xác nhận nếu không hoàn tất
              thanh toán.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Tiếp tục thanh toán
              </button>
              <button
                onClick={handleConfirmClose}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Hủy thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayOSQRModal;