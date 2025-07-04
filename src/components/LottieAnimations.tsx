import React from 'react';

// Floating decoration icons
export const FloatingIcon: React.FC<{ type: 'popcorn' | 'cinema' | 'star'; delay?: number }> = ({ type, delay = 0 }) => {
  // Sử dụng emoji thay vì Lottie để tránh lỗi 403
  const icons = {
    popcorn: '🍿',
    cinema: '🎬',
    star: '⭐'
  };

  return (
    <div 
      className="floating-icon absolute animate-float"
      style={{
        animationDelay: `${delay}s`,
        fontSize: '3rem'
      }}
    >
      {icons[type]}
    </div>
  );
};

// Cinema-themed loading animation
export const CinemaLoading: React.FC = () => {
  // Simple CSS loading spinner instead of Lottie
  return (
    <div className="cinema-loading">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-3 h-3 bg-[#FFD875] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-[#FFD875] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-[#FFD875] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

// Success animation for booking confirmation
export const SuccessAnimation: React.FC = () => {
  // Simple checkmark animation
  return (
    <div className="success-animation">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
};

// Movie ticket animation
export const MovieTicketAnimation: React.FC = () => {
  return (
    <div className="movie-ticket-animation">
      <div className="ticket-wrapper relative w-48 h-32 animate-wiggle">
        <div className="ticket bg-[#FFD875] rounded-lg p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-black font-bold text-lg">TICKET</span>
            <span className="text-black text-2xl">🎬</span>
          </div>
          <div className="mt-2 border-t-2 border-dashed border-black pt-2">
            <div className="text-black text-xs">ADMIT ONE</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Star rating animation
export const StarRatingAnimation: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="star-rating flex space-x-1">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={`text-2xl transition-all duration-300 ${
            index < Math.floor(rating) 
              ? 'text-[#FFD875] animate-pulse' 
              : 'text-gray-400'
          }`}
        >
          ⭐
        </span>
      ))}
    </div>
  );
};

// NEW: Film reel animation
export const FilmReelAnimation: React.FC = () => {
  return (
    <div className="film-reel-container">
      <div className="film-reel animate-spin-slow">
        <div className="reel-center w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
        </div>
        <div className="reel-holes">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="hole absolute w-2 h-2 bg-gray-900 rounded-full"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-28px)`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// NEW: Curtain animation
export const CurtainAnimation: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  return (
    <div className="curtain-container fixed inset-0 pointer-events-none z-50">
      <div className={`curtain-left absolute left-0 top-0 w-1/2 h-full bg-red-900 transition-transform duration-1000 ${
        isOpen ? '-translate-x-full' : 'translate-x-0'
      }`}>
        <div className="curtain-texture opacity-30"></div>
      </div>
      <div className={`curtain-right absolute right-0 top-0 w-1/2 h-full bg-red-900 transition-transform duration-1000 ${
        isOpen ? 'translate-x-full' : 'translate-x-0'
      }`}>
        <div className="curtain-texture opacity-30"></div>
      </div>
    </div>
  );
};

// NEW: Popcorn box animation
export const PopcornBoxAnimation: React.FC = () => {
  return (
    <div className="popcorn-box-container">
      <div className="popcorn-box relative w-32 h-40 animate-shake">
        <div className="box bg-red-600 rounded-t-xl rounded-b-sm p-4">
          <div className="stripes">
            <div className="stripe bg-white h-full w-3 absolute left-4"></div>
            <div className="stripe bg-white h-full w-3 absolute right-4"></div>
          </div>
          <div className="popcorn-pieces absolute -top-4 left-1/2 transform -translate-x-1/2">
            {['🍿', '🍿', '🍿'].map((_, i) => (
              <span 
                key={i} 
                className="absolute text-2xl animate-float"
                style={{
                  left: `${(i - 1) * 20}px`,
                  animationDelay: `${i * 0.2}s`
                }}
              >
                🍿
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// NEW: Cinema seat animation
export const CinemaSeatAnimation: React.FC<{ isOccupied?: boolean }> = ({ isOccupied = false }) => {
  return (
    <div className={`cinema-seat-container ${isOccupied ? 'occupied' : ''}`}>
      <div className={`
        seat w-12 h-12 rounded-t-xl rounded-b-sm transition-all duration-300
        ${isOccupied 
          ? 'bg-red-500 cursor-not-allowed' 
          : 'bg-gray-600 hover:bg-[#FFD875] cursor-pointer hover:scale-110'
        }
      `}>
        <div className="seat-back h-3 bg-gray-700 rounded-t-xl"></div>
      </div>
    </div>
  );
};

// NEW: Countdown timer animation
export const CountdownAnimation: React.FC<{ seconds: number }> = ({ seconds }) => {
  const [count, setCount] = React.useState(seconds);

  React.useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <div className="countdown-container">
      <div className={`
        countdown-number text-6xl font-bold text-[#FFD875]
        ${count <= 3 ? 'animate-pulse-fast' : ''}
        ${count === 0 ? 'animate-explode' : 'animate-scale-bounce'}
      `}>
        {count || '🎬'}
      </div>
    </div>
  );
};

// CSS animations
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-20px) rotate(5deg); }
    75% { transform: translateY(-10px) rotate(-5deg); }
  }

  @keyframes scale-in {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(3deg); }
    75% { transform: rotate(-3deg); }
  }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  @keyframes scale-bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes pulse-fast {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.95); }
  }

  @keyframes explode {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(3); opacity: 0; }
  }

  .animate-float {
    animation: float 4s ease-in-out infinite;
  }

  .animate-scale-in {
    animation: scale-in 0.5s ease-out;
  }

  .animate-wiggle {
    animation: wiggle 2s ease-in-out infinite;
  }

  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }

  .animate-shake {
    animation: shake 1s ease-in-out infinite;
  }

  .animate-scale-bounce {
    animation: scale-bounce 1s ease-in-out;
  }

  .animate-pulse-fast {
    animation: pulse-fast 0.5s ease-in-out infinite;
  }

  .animate-explode {
    animation: explode 0.5s ease-out forwards;
  }

  .curtain-texture {
    background-image: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 10px,
      rgba(0,0,0,0.1) 10px,
      rgba(0,0,0,0.1) 20px
    );
  }

  .film-reel-container {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .reel-holes {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 