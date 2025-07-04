import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Vui lòng nhập email hợp lệ');
      return;
    }

    setStatus('loading');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus('success');
      setMessage('Đăng ký thành công! Cảm ơn bạn đã đăng ký.');
      setEmail('');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
      
    } catch (error) {
      setStatus('error');
      setMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95" />
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(234, 179, 8, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(234, 179, 8, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full mb-8 backdrop-blur-sm border border-yellow-500/20">
          <Mail className="w-10 h-10 text-yellow-400" />
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Đăng ký nhận thông tin phim mới
        </h2>
        
        {/* Subtitle */}
        <p className="text-gray-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Nhận thông báo về phim mới, khuyến mãi và sự kiện đặc biệt
        </p>
        
        {/* Form Container */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 p-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50">
              {/* Email Input */}
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className={`w-full px-6 py-4 bg-transparent text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-0 text-lg ${
                    status === 'error' ? 'text-red-400' : 
                    status === 'success' ? 'text-green-400' : 'text-white'
                  }`}
                  disabled={status === 'loading'}
                />
                
                {/* Status Icons */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {status === 'loading' && (
                    <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                  )}
                  {status === 'success' && (
                    <Check className="w-5 h-5 text-green-400" />
                  )}
                  {status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 text-black disabled:text-gray-400 font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 hover:shadow-lg hover:shadow-yellow-500/25 whitespace-nowrap text-lg min-w-[140px]"
              >
                {status === 'loading' ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  'Đăng Ký'
                )}
              </button>
            </div>
          </form>

          {/* Status Message */}
          {message && (
            <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-medium mb-6 backdrop-blur-sm ${
              status === 'success' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              status === 'error' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                ''
            }`}>
              {status === 'success' && <Check className="w-5 h-5" />}
              {status === 'error' && <AlertCircle className="w-5 h-5" />}
              <span>{message}</span>
            </div>
          )}
          
          {/* Privacy Notice */}
          <p className="text-gray-400 text-sm leading-relaxed">
            Chúng tôi tôn trọng quyền riêng tư của bạn. 
            <a 
              href="/privacy" 
              className="text-yellow-400 hover:text-yellow-300 underline ml-1 transition-colors duration-200"
            >
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
