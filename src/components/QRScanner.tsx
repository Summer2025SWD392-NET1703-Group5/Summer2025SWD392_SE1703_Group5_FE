import React, { useRef, useEffect, useState } from 'react';
import { CameraIcon, XMarkIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import jsQR from 'jsqr';

interface QRScannerProps {
    onScan: (result: string) => void;
    onError?: (error: string) => void;
    isActive: boolean;
    onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError, isActive, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [scanning, setScanning] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [mirrored, setMirrored] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isScanningRef = useRef<boolean>(false);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isActive]);

    const startCamera = async () => {
        try {
            console.log('🎥 Khởi động camera...');
            
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 60 }
                }
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.setAttribute('playsinline', 'true');
                
                videoRef.current.onloadedmetadata = () => {
                    console.log('📹 Camera sẵn sàng');
                    setCameraReady(true);
                    
                    const tryPlay = async () => {
                        try {
                            if (videoRef.current) {
                                await videoRef.current.play();
                                console.log('🔍 Bắt đầu quét QR...');
                                
                                setTimeout(() => {
                                    if (isActive && videoRef.current) {
                                        startScanning();
                                    }
                                }, 800);
                            }
                        } catch (playError) {
                            console.log('⚠️ Lỗi phát video:', playError);
                            setTimeout(() => {
                                if (isActive) startScanning();
                            }, 1000);
                        }
                    };
                    
                    tryPlay();
                };
            }
        } catch (error) {
            console.error('❌ Không thể truy cập camera:', error);
            setCameraReady(false);
            onError?.('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập hoặc sử dụng tính năng nhập thủ công.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        isScanningRef.current = false;
        setScanning(false);
        setCameraReady(false);
        setScanProgress(0);
        
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const startScanning = () => {
        if (isScanningRef.current) return;

        isScanningRef.current = true;
        setScanning(true);
        setScanProgress(0);

        // Progress animation
        progressIntervalRef.current = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) return 0;
                return prev + 2;
            });
        }, 50);

        scanIntervalRef.current = setInterval(() => {
            captureAndAnalyze();
        }, 150);
    };

    const captureAndAnalyze = () => {
        if (!isActive || !isScanningRef.current) {
            return;
        }
        
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) {
            return;
        }

        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            return;
        }

        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        if (videoWidth === 0 || videoHeight === 0) {
            return;
        }

        const scale = Math.min(1, 800 / Math.max(videoWidth, videoHeight));
        canvas.width = videoWidth * scale;
        canvas.height = videoHeight * scale;

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (mirrored) {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }

        context.imageSmoothingEnabled = false;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (mirrored) {
            context.setTransform(1, 0, 0, 1, 0, 0);
        }

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        analyzeImageData(imageData);
    };

    const analyzeImageData = (imageData: ImageData) => {
        if (!imageData || !imageData.data) {
            return;
        }
        
        try {
            const attempts = [
                { inversionAttempts: "attemptBoth" as const },
                { inversionAttempts: "dontInvert" as const },
                { inversionAttempts: "onlyInvert" as const }
            ];

            for (const attempt of attempts) {
                const code = jsQR(imageData.data, imageData.width, imageData.height, attempt);
                
                if (code && code.data) {
                    if (!isActive || !isScanningRef.current) {
                        return;
                    }
                    
                    console.log('🎯 QR Code phát hiện:', code.data);
                    handleQRDetected(code.data);
                    return;
                }
            }
        } catch (error) {
            // Ignore jsQR errors
        }
    };

    const handleQRDetected = (qrData: string) => {
        if (!isActive || !isScanningRef.current) {
            return;
        }
        
        console.log('✅ QR Scanner: Xử lý mã vé:', qrData);
        
        // Success animation
        setScanProgress(100);
        
        setTimeout(() => {
            onScan(qrData);
            isScanningRef.current = false;
            setScanning(false);
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        }, 300);
    };

    const handleManualInput = () => {
        if (!isActive) {
            return;
        }
        
        const code = prompt('Nhập mã vé thủ công:');
        if (code && code.trim()) {
            handleQRDetected(code.trim());
        }
    };

    const toggleMirror = () => {
        setMirrored(!mirrored);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-amber-500/20">
                <div className="absolute inset-0 bg-amber-500/5"></div>
                <div className="relative p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                            <QrCodeIcon className="w-7 h-7 text-black" />
                        </div>
                        <div>
                            <h2 className="text-white text-xl font-bold">Quét mã QR vé</h2>
                            <p className="text-amber-200 text-sm">Galaxy Cinema - Staff Scanner</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/10"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Scanner Area */}
            <div className="flex-1 relative overflow-hidden">
                {/* Background Video */}
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}
                    playsInline
                    muted
                />

                {/* Dark Overlay with Spotlight */}
                <div className="absolute inset-0">
                    <div 
                        className="w-full h-full"
                        style={{
                            background: `
                                radial-gradient(ellipse 300px 300px at center, 
                                transparent 35%, 
                                rgba(0,0,0,0.1) 45%, 
                                rgba(0,0,0,0.3) 55%,
                                rgba(0,0,0,0.6) 70%,
                                rgba(0,0,0,0.85) 100%)
                            `
                        }}
                    />
                </div>

                {/* Scanning Frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                        {/* Main Frame */}
                        <div className="w-80 h-80 relative">
                            {/* Corner Frames */}
                            <div className="absolute -top-2 -left-2 w-12 h-12">
                                <div className="w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>
                                <div className="w-1 h-full bg-gradient-to-b from-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>
                            </div>
                            <div className="absolute -top-2 -right-2 w-12 h-12">
                                <div className="w-full h-1 bg-gradient-to-l from-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>
                                <div className="w-1 h-full bg-gradient-to-b from-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/50 ml-auto"></div>
                            </div>
                            <div className="absolute -bottom-2 -left-2 w-12 h-12">
                                <div className="w-1 h-full bg-gradient-to-t from-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>
                                <div className="w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/50 mt-auto"></div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12">
                                <div className="w-1 h-full bg-gradient-to-t from-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/50 ml-auto"></div>
                                <div className="w-full h-1 bg-gradient-to-l from-amber-400 to-amber-500 rounded-full shadow-lg shadow-amber-500/50 mt-auto"></div>
                            </div>

                            {/* Scanning Animation */}
                            {scanning && (
                                <>
                                    {/* Scanning Line */}
                                    <div 
                                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full shadow-xl shadow-amber-500/50"
                                        style={{
                                            top: `${scanProgress * 3}px`,
                                            animation: scanProgress >= 100 ? 'none' : 'scanLine 2s ease-in-out infinite'
                                        }}
                                    />
                                    
                                    {/* Pulse Effect */}
                                    <div className="absolute inset-0 border-2 border-amber-400/30 rounded-3xl animate-pulse"></div>
                                    
                                    {/* Active Corners */}
                                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg animate-pulse"></div>
                                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg animate-pulse"></div>
                                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg animate-pulse"></div>
                                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg animate-pulse"></div>
                                </>
                            )}

                            {/* Success Effect */}
                            {scanProgress >= 100 && (
                                <div className="absolute inset-0 bg-emerald-400/20 rounded-3xl border-2 border-emerald-400 animate-ping"></div>
                            )}
                        </div>

                        {/* Status Text */}
                        <div className="mt-8 text-center space-y-3">
                            <h3 className="text-white text-xl font-semibold">
                                {!cameraReady ? 'Đang khởi động camera...' : 
                                 scanning ? 'Đang quét mã QR...' : 'Camera sẵn sàng'}
                            </h3>
                            
                            {cameraReady && (
                                <div className="space-y-2">
                                    <p className="text-amber-200 text-sm">
                                        Đặt mã QR vào khung vàng
                                    </p>
                                    
                                    {scanning && (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    )}
                                    
                                    {!scanning && (
                                        <p className="text-white/60 text-xs">
                                            Giữ điện thoại ổn định để quét tốt nhất
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="absolute top-6 right-6">
                    <button
                        onClick={toggleMirror}
                        className="w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-xl transition-all duration-300 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg"
                        title="Lật camera"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                    </button>
                </div>

                {/* Error State */}
                {!cameraReady && !stream && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                        <div className="text-center text-white p-8 max-w-md">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/25">
                                <CameraIcon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Không thể truy cập camera</h3>
                            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                                Vui lòng cho phép quyền truy cập camera hoặc sử dụng tính năng nhập thủ công
                            </p>
                            <button
                                onClick={handleManualInput}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/25"
                            >
                                Nhập mã thủ công
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-6 bg-gradient-to-t from-black via-slate-900/95 to-transparent backdrop-blur-xl">
                <button
                    onClick={handleManualInput}
                    className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-medium rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 border border-slate-500/20 shadow-lg"
                >
                    <QrCodeIcon className="w-5 h-5" />
                    Nhập mã vé thủ công
                </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes scanLine {
                        0% { transform: translateY(-100%) scaleY(0.5); opacity: 0; }
                        50% { opacity: 1; transform: translateY(0%) scaleY(1); }
                        100% { transform: translateY(300px) scaleY(0.5); opacity: 0; }
                    }
                    
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `
            }} />
        </div>
    );
};

export default QRScanner; 