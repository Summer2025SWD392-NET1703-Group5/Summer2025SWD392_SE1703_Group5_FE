import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../../config/axios";
import jsQR from "jsqr";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import "./QRCodeScan.css";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

interface TicketInfo {
  ticket_id: number;
  ticket_code: string;
  checked_in_time: string;
  seat_info: string;
  customer_name: string;
  movie_name: string;
  show_date: string;
  show_time: string;
  room_name: string;
}

interface TicketResponse {
  success: boolean;
  message: string;
  ticket_info: TicketInfo;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Main component
const QRCodeScanner = () => {
  const [scanning, setScanning] = useState<boolean>(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = useState<string | null>(null);
  const [mirrorImage, setMirrorImage] = useState<boolean>(true);
  const [ticketResponse, setTicketResponse] = useState<TicketResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [manualTicketCode, setManualTicketCode] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerIntervalRef = useRef<number | null>(null);

  const navigate = useNavigate();

  const successSound = new Audio("/sounds/success.mp3");
  const errorSound = useRef(new Audio("/sounds/error.mp3")).current;

  // Function to check role
  const checkUserRole = () => {
    const role = localStorage.getItem("role") || sessionStorage.getItem("role");
    return role;
  };

  useEffect(() => {
    const role = checkUserRole();
    if (role !== "Staff") {
      toast.error("Bạn không có quyền truy cập trang này.");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setCameras(videoDevices);

        if (videoDevices.length > 0) {
          setCurrentCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting cameras:", error);
        toast.error("Không thể truy cập camera. Vui lòng cấp quyền và thử lại.");
      }
    };

    getCameras();

    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (scannerIntervalRef.current) {
        clearInterval(scannerIntervalRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          deviceId: currentCamera ? { exact: currentCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setScanning(true);
      startScanning();

      toast.info("Camera đã sẵn sàng. Vui lòng đưa mã QR vào khung quét.");
    } catch (error) {
      console.error("Error starting camera:", error);
      toast.error("Không thể truy cập camera. Vui lòng cấp quyền và thử lại.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
      scannerIntervalRef.current = null;
    }

    setScanning(false);
  };

  const startScanning = () => {
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
    }

    scannerIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        
        if (context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            processQRCode(code.data);
          }
        }
      }
    }, 100);
  };

  const processQRCode = async (qrData: string) => {
    stopCamera();

    try {
      setLoading(true);

      console.log("QR Data:", qrData);

      let ticketCode = qrData;

      try {
        const parsedData = JSON.parse(qrData);
        if (parsedData.code) {
          ticketCode = parsedData.code;
        } else if (parsedData.ticketCode) {
          ticketCode = parsedData.ticketCode;
        }
      } catch (jsonError) {
        // Dữ liệu QR không phải JSON, giữ nguyên
        console.log("Not a JSON QR code, using raw data", jsonError);
      }

      await scanTicket(ticketCode);
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast.error("Không thể xác thực vé. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const scanTicket = async (ticketCode: string, suppressToast = false) => {
    try {
      const response = await api.post(`/ticket/scan/${ticketCode}`, {});

      // Nếu success: false, ném lỗi với thông điệp từ API
      if (!response.data.success) {
        throw new Error(response.data.message || "Vé không hợp lệ");
      }

      // Xử lý khi vé hợp lệ
      setTicketResponse(response.data);

      try {
        successSound.play();
        if (!suppressToast) {
          toast.success("Check-in vé thành công!");
        }
      } catch (error) {
        console.log("Audio play error:", error);
      }

      setLoading(false);
    } catch (error: unknown) {
      console.error("Error scanning ticket:", error);
      const apiError = error as ApiError;

      // Đặt loading thành false trước khi xử lý lỗi để tránh trạng thái loading vô hạn
      setLoading(false);

      // Xử lý lỗi 401 (hết hạn phiên đăng nhập)
      if (apiError.response && apiError.response.status === 401) {
        if (!suppressToast) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        }
        navigate("/login");
        return; // Thêm return để ngăn thực hiện code phía dưới
      }
      // Xử lý lỗi 404 (Not Found)
      else if (apiError.response && apiError.response.status === 404) {
        const errorMessage =
          apiError.response.data?.message || "Không tìm thấy vé với mã này";
        if (!suppressToast) {
          toast.error(errorMessage);
        }
        
        // Phát âm thanh lỗi
        try {
          errorSound.play();
        } catch (soundError) {
          console.log("Error sound play error:", soundError);
        }
        
        throw new Error(errorMessage);
      }
      // Xử lý lỗi 400 (Bad Request)
      else if (apiError.response && apiError.response.status === 400) {
        const errorMessage = apiError.response.data?.message || "Vé không hợp lệ";
        if (!suppressToast) {
          toast.error(errorMessage);
        }
        
        // Phát âm thanh lỗi
        try {
          errorSound.play();
        } catch (soundError) {
          console.log("Error sound play error:", soundError);
        }
        
        throw new Error(errorMessage);
      }
      // Các lỗi khác
      else {
        const errorMessage =
          apiError.message || "Không thể xác thực vé. Vui lòng thử lại.";
        if (!suppressToast) {
          toast.error(errorMessage);
        }
        
        // Phát âm thanh lỗi
        try {
          errorSound.play();
        } catch (soundError) {
          console.log("Error sound play error:", soundError);
        }
        
        throw apiError;
      }
    }
  };

  const resetScanner = () => {
    setTicketResponse(null);
    setScanning(false);
  };

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualTicketCode.trim()) {
      toast.warning("Vui lòng nhập mã vé");
      return;
    }

    try {
      setLoading(true);
      await scanTicket(manualTicketCode.trim(), true);
      setManualTicketCode("");
    } catch (error: unknown) {
      console.error("Error fetching ticket:", error);
      const apiError = error as ApiError;
      toast.error(apiError.message || "Không thể xác thực vé. Vui lòng thử lại.");
      setLoading(false);
      setTicketResponse(null);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // Hàm mới để tải file PDF
  const downloadTicketPDF = async () => {
    if (
      !ticketResponse ||
      !ticketResponse.ticket_info ||
      !ticketResponse.ticket_info.ticket_id
    ) {
      toast.error("Không có thông tin vé để tải PDF.");
      return;
    }

    try {
      const ticketId = ticketResponse.ticket_info.ticket_id;
      
      const response = await api.get(`/ticket/${ticketId}/download`, {
        responseType: 'blob'
      });

      // Tạo URL từ blob và tải file
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;

      // Lấy tên file từ header content-disposition nếu có, hoặc đặt mặc định
      const contentDisposition = response.headers["content-disposition"];
      let fileName = `Ticket_${ticketId}.pdf`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Tải file PDF thành công!");
    } catch (error: unknown) {
      console.error("Error downloading PDF:", error);
      const apiError = error as ApiError;
      if (apiError.response && apiError.response.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else {
        toast.error("Không thể tải file PDF. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="QRCode-page-wrapper">
      <div className="QRCode-scanner-container">
        <motion.div className="QRCode-page-header" initial="hidden" animate="visible" variants={fadeIn}>
          <div className="QRCode-header-icon">
            <i className="fas fa-qrcode"></i>
          </div>
          <div className="QRCode-header-title">
            <h1>Kiểm tra vé</h1>
            <p>Quét mã QR hoặc nhập mã vé để xác thực và check-in</p>
          </div>
        </motion.div>

        <motion.div className="QRCode-content-grid" initial="hidden" animate="visible" variants={fadeIn}>
          <motion.div className="QRCode-card" initial="hidden" animate="visible" variants={slideUp}>
            <div className="QRCode-card-header">
              <div className="QRCode-card-title">
                <div className="QRCode-icon">
                  <i className="fas fa-camera"></i>
                </div>
                <h2>Quét mã QR</h2>
              </div>
            </div>

            <div className="QRCode-card-body">
              <div className={`QRCode-camera-container ${mirrorImage ? 'QRCode-mirror' : ''}`}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  onCanPlay={() => videoRef.current?.play()}
                />
                <canvas ref={canvasRef} />
                {scanning && (
                  <div className="QRCode-scan-overlay">
                    <div className="QRCode-scanner-frame">
                      <div className="QRCode-corner QRCode-corner-top-left"></div>
                      <div className="QRCode-corner QRCode-corner-top-right"></div>
                      <div className="QRCode-corner QRCode-corner-bottom-left"></div>
                      <div className="QRCode-corner QRCode-corner-bottom-right"></div>
                      <div className="QRCode-scanner-line"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="QRCode-control-panel">
                {!scanning ? (
                  <button className="QRCode-primary-button" onClick={startCamera} disabled={loading}>
                    <i className="fas fa-play"></i>
                    Bắt đầu quét
                  </button>
                ) : (
                  <button className="QRCode-secondary-button" onClick={stopCamera}>
                    <i className="fas fa-stop"></i>
                    Dừng quét
                  </button>
                )}

                {cameras.length > 1 && (
                  <button
                    className="QRCode-secondary-button"
                    onClick={() => {
                      const currentIndex = cameras.findIndex(
                        (cam) => cam.deviceId === currentCamera
                      );
                      const nextIndex = (currentIndex + 1) % cameras.length;
                      setCurrentCamera(cameras[nextIndex].deviceId);
                      if (scanning) {
                        stopCamera();
                        setTimeout(startCamera, 300);
                      }
                    }}
                  >
                    <i className="fas fa-sync"></i>
                    Đổi camera
                  </button>
                )}

                <button className="QRCode-secondary-button" onClick={() => setMirrorImage(!mirrorImage)}>
                  <i className="fas fa-exchange-alt"></i>
                  {mirrorImage ? "Tắt" : "Bật"} đảo ảnh
                </button>
              </div>

              <div className="QRCode-manual-entry-section">
                <h3>
                  <i className="fas fa-keyboard"></i>
                  Nhập mã vé thủ công
                </h3>
                <form onSubmit={handleManualEntry}>
                  <div className="QRCode-input-group">
                    <input
                      type="text"
                      placeholder="Nhập mã vé "
                      value={manualTicketCode}
                      onChange={(e) => setManualTicketCode(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      className="QRCode-primary-button"
                      type="submit"
                      disabled={loading || !manualTicketCode.trim()}
                    >
                      <i className="fas fa-search"></i>
                      Kiểm tra
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>

          <motion.div className="QRCode-card" initial="hidden" animate="visible" variants={slideUp}>
            <div className="QRCode-card-header">
              <div className="QRCode-card-title">
                <div className="QRCode-icon">
                  <i className="fas fa-ticket-alt"></i>
                </div>
                <h2>Thông tin vé</h2>
              </div>
            </div>

            <div className="QRCode-card-body">
              {loading ? (
                <div className="QRCode-loading-indicator">
                  <div className="QRCode-spinner"></div>
                  <p>Đang xác thực thông tin vé...</p>
                </div>
              ) : ticketResponse ? (
                <div className="QRCode-ticket-card">
                  <div className={`QRCode-ticket-header ${ticketResponse.success ? 'QRCode-success' : 'QRCode-error'}`}>
                    <div className="QRCode-status-badge">
                      {ticketResponse.success ? "ĐÃ CHECK-IN" : "KHÔNG HỢP LỆ"}
                    </div>
                    <h3>{ticketResponse.ticket_info.movie_name}</h3>
                    <div className="QRCode-check-in-time">
                      <i
                        className={
                          ticketResponse.success
                            ? "fas fa-check-circle"
                            : "fas fa-times-circle"
                        }
                      ></i>
                      {ticketResponse.success && ticketResponse.ticket_info.checked_in_time
                        ? `Đã check-in lúc ${formatDateTime(
                            ticketResponse.ticket_info.checked_in_time
                          )}`
                        : "Vé không hợp lệ hoặc đã được sử dụng"}
                    </div>
                    <div className={`QRCode-status-icon ${ticketResponse.success ? 'QRCode-success' : 'QRCode-error'}`}>
                      <i
                        className={
                          ticketResponse.success
                            ? "fas fa-check"
                            : "fas fa-times"
                        }
                      ></i>
                    </div>
                  </div>

                  <div className="QRCode-ticket-info">
                    <div className="QRCode-ticket-property">
                      <div className="QRCode-label">Mã vé:</div>
                      <div className="QRCode-value">
                        {ticketResponse.ticket_info.ticket_code}
                      </div>
                    </div>
                    <div className="QRCode-ticket-property">
                      <div className="QRCode-label">Ghế:</div>
                      <div className="QRCode-value">
                        {ticketResponse.ticket_info.seat_info}
                      </div>
                    </div>
                    <div className="QRCode-ticket-property">
                      <div className="QRCode-label">Phòng chiếu:</div>
                      <div className="QRCode-value">
                        {ticketResponse.ticket_info.room_name}
                      </div>
                    </div>
                    <div className="QRCode-ticket-property">
                      <div className="QRCode-label">Ngày chiếu:</div>
                      <div className="QRCode-value">
                        {new Date(ticketResponse.ticket_info.show_date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="QRCode-ticket-property">
                      <div className="QRCode-label">Giờ chiếu:</div>
                      <div className="QRCode-value">
                        {new Date(ticketResponse.ticket_info.show_time).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {ticketResponse.ticket_info.customer_name && (
                      <div className="QRCode-ticket-property">
                        <div className="QRCode-label">Khách hàng:</div>
                        <div className="QRCode-value">
                          {ticketResponse.ticket_info.customer_name}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="QRCode-ticket-actions">
                    <button className="QRCode-secondary-button" onClick={resetScanner}>
                      <i className="fas fa-redo"></i>
                      Quét vé mới
                    </button>
                    <button className="QRCode-primary-button" onClick={downloadTicketPDF}>
                      <i className="fas fa-download"></i>
                      Tải vé PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="QRCode-ticket-placeholder">
                  <i className="fas fa-ticket-alt QRCode-icon"></i>
                  <h3>Chưa có thông tin vé</h3>
                  <p>
                    Quét mã QR hoặc nhập mã vé để xem thông tin và xác thực vé
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999, marginTop: "80px" }}
        toastStyle={{
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
        }}
      />
    </div>
  );
};

export default QRCodeScanner;