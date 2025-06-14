import React, { useState, useEffect } from 'react';
import { Heart, Plus, Share2, MessageCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../config/axios';

// Styles object moved to the top level
const styles = {
  // Main container - tone màu RoPhim
  container: {
    backgroundColor: '#1a1d29',
    minHeight: '100vh',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // Hero section với background rõ nét hơn
  heroSection: {
    position: 'relative' as const,
    height: '60vh',
    minHeight: '400px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '0 0 40px 0'
  },
  
  // Hero content - layout như RoPhim
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    width: '100%',
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-end'
  },
  
  // Poster trong hero
  heroPoster: {
    width: '200px',
    height: '280px',
    borderRadius: '12px',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
  },
  
  heroPosterImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  
  // Movie info bên cạnh poster
  heroMovieInfo: {
    flex: 1,
    paddingBottom: '20px'
  },
  
  movieTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#ffffff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
  },
  
  movieOriginalTitle: {
    fontSize: '16px',
    color: '#cbd5e0',
    marginBottom: '15px',
    fontStyle: 'italic'
  },
  
  movieMeta: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    marginBottom: '20px'
  },
  
  metaItem: {
    background: 'rgba(255,255,255,0.15)',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    color: '#e2e8f0',
    backdropFilter: 'blur(10px)'
  },
  
  rating: {
    background: '#4299e1',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '16px',
    fontWeight: 'bold',
    fontSize: '13px'
  },
  
  // Action buttons - giống RoPhim
  actionButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
    marginTop: '15px'
  },
  
  // Nút Mua Vé - giống hệt ảnh với play icon
  buyTicketButton: {
    background: 'linear-gradient(135deg, #f6d55c 0%, #ed8936 100%)',
    color: '#1a1d29',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(246,213,92,0.3)'
  },
  
  // Play icon trong nút
  playIcon: {
    width: '0',
    height: '0',
    borderLeft: '8px solid #1a1d29',
    borderTop: '5px solid transparent',
    borderBottom: '5px solid transparent',
    marginLeft: '2px'
  },
  
  // Các nút khác với icon từ thư viện
  secondaryButton: {
    background: 'rgba(255,255,255,0.1)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '12px 20px',
    borderRadius: '25px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  // Rating badge ở góc phải
  ratingBadge: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    background: '#4299e1',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  
  // Main content area
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  
  // Tabs section - tone màu RoPhim
  tabsSection: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '30px',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  
  tabsHeader: {
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.08)'
  },
  
  tab: {
    padding: '16px 24px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    borderBottom: '3px solid transparent',
    fontWeight: '500'
  },
  
  tabActive: {
    color: '#f6d55c',
    borderBottomColor: '#f6d55c',
    background: 'rgba(246,213,92,0.1)'
  },
  
  tabContent: {
    padding: '30px'
  },
  
  // Schedule section
  scheduleSection: {
    marginBottom: '30px'
  },
  
  sectionTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#ffffff'
  },
  
  dateSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap' as const
  },
  
  dateTab: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '12px 18px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '90px',
    textAlign: 'center' as const,
    color: '#cbd5e0'
  },
  
  dateTabActive: {
    background: 'linear-gradient(135deg, #f6d55c 0%, #ed8936 100%)',
    borderColor: '#f6d55c',
    color: '#1a1d29',
    fontWeight: 'bold'
  },
  
  dateDay: {
    fontSize: '11px',
    opacity: 0.8,
    marginBottom: '4px'
  },
  
  dateNumber: {
    fontSize: '15px',
    fontWeight: 'bold'
  },
  
  // Cinema grid
  cinemaGrid: {
    display: 'grid',
    gap: '20px'
  },
  
  cinemaCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '24px',
    transition: 'all 0.3s ease'
  },
  
  cinemaName: {
    fontSize: '17px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#f6d55c'
  },
  
  showtimes: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px'
  },
  
  showtimeButton: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#e2e8f0',
    padding: '10px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500'
  },
  
  // Cast section
  castSection: {
    marginTop: '30px'
  },
  
  castGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  
  castItem: {
    textAlign: 'center' as const,
    background: 'rgba(255,255,255,0.03)',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  
  castName: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff'
  }
};

interface Room {
  Cinema_Room_ID: number;
  Room_Name: string;
  Room_Type: string;
}

interface Showtime {
  Showtime_ID: number;
  Start_Time: string;
  End_Time: string;
  Capacity_Available: number;
  Room: Room;
}

interface ShowtimesByDate {
  Show_Date: string;
  Showtimes: Showtime[];
}

interface Cinema {
  Cinema_ID: number;
  Cinema_Name: string;
  Address: string;
  ShowtimesByDate: ShowtimesByDate[];
}

interface MovieDetails {
  Movie_ID: number;
  Movie_Name: string;
  Duration: number;
  Poster_URL: string;
  Cinemas: Cinema[];
}

interface ShowtimesByType {
  [key: string]: Showtime[];
}

const formatShowtime = (timeString: string) => {
  // The timeString is already in "HH:MM:SS" format
  // Just return the hours and minutes part
  return timeString.substring(0, 5); // Returns "HH:MM"
};

const ShowtimesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('movieId');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('schedule');
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredElements, setHoveredElements] = useState<{[key: string]: boolean}>({});
  const [expandedCinema, setExpandedCinema] = useState<number | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        console.log('Fetching movie details for ID:', movieId);
        setLoading(true);
        const response = await api.get(`/movies/${movieId}/cinemas`);
        console.log('API Response:', response.data);
        
        // Set initial selected date from first available showtime
        if (response.data.data.Cinemas && response.data.data.Cinemas.length > 0) {
          const firstCinema = response.data.data.Cinemas[0];
          if (firstCinema.ShowtimesByDate && firstCinema.ShowtimesByDate.length > 0) {
            const firstDate = new Date(firstCinema.ShowtimesByDate[0].Show_Date);
            const formattedDate = `${firstDate.getDate()}/${firstDate.getMonth() + 1}`;
            setSelectedDate(formattedDate);
          }
        }
        
        setMovie(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error details:', err);
        setError('Failed to fetch movie details');
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    } else {
      console.log('No movieId found in URL');
      setError('Movie ID is required');
      setLoading(false);
    }
  }, [movieId]);

  const handleDateSelect = (date: string): void => {
    console.log('Selected date:', date);
    setSelectedDate(date);
  };

  const handleBookTicket = (cinemaId: string, time: string): void => {
    alert(`Đặt vé cho:\nRạp: ${cinemaId}\nGiờ chiếu: ${time}`);
  };

  const handleMouseEnter = (elementId: string) => {
    setHoveredElements(prev => ({ ...prev, [elementId]: true }));
  };

  const handleMouseLeave = (elementId: string) => {
    setHoveredElements(prev => ({ ...prev, [elementId]: false }));
  };

  const groupShowtimesByType = (showtimes: Showtime[]): ShowtimesByType => {
    return showtimes.reduce((acc: ShowtimesByType, showtime) => {
      const type = showtime.Room.Room_Type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(showtime);
      return acc;
    }, {});
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        {error || 'Movie not found'}
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .hero-poster {
            width: 150px !important;
            height: 210px !important;
          }
          .movie-title {
            font-size: 24px !important;
          }
          .action-buttons {
            justify-content: center !important;
          }
        }
      `}</style>

      <div style={{...styles.container, display: 'block', minHeight: '100vh'}}>
        {/* Hero Section với layout RoPhim */}
        <div style={{
          ...styles.heroSection,
          background: `linear-gradient(rgba(26,29,41,0.3), rgba(26,29,41,0.7)), url('${movie.Poster_URL}')`
        }}>
          {/* Hero Content */}
          <div style={styles.heroContent} className="hero-content">
            {/* Poster */}
            <div style={styles.heroPoster} className="hero-poster">
              <img 
                src={movie.Poster_URL} 
                alt={movie.Movie_Name}
                style={styles.heroPosterImage}
              />
            </div>

            {/* Movie Info */}
            <div style={styles.heroMovieInfo}>
              <h1 style={styles.movieTitle} className="movie-title">
                {movie.Movie_Name}
              </h1>
              
              <div style={styles.movieMeta}>
                <div style={styles.metaItem}>⏱️ {movie.Duration} phút</div>
                {movie.Cinemas.map((cinema) => (
                  <div key={cinema.Cinema_ID} style={styles.metaItem}>🏢 {cinema.Cinema_Name}</div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div style={styles.actionButtons} className="action-buttons">
                {/* Nút Mua Vé với play icon giống ảnh */}
                <button 
                  style={{
                    ...styles.buyTicketButton,
                    ...(hoveredElements['buy-ticket'] ? {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 25px rgba(246,213,92,0.5)'
                    } : {})
                  }}
                  onMouseEnter={() => handleMouseEnter('buy-ticket')}
                  onMouseLeave={() => handleMouseLeave('buy-ticket')}
                >
                  <div style={styles.playIcon}></div>
                  Xem Ngay
                </button>

                {/* Nút Yêu thích với icon từ thư viện */}
                <button 
                  style={{
                    ...styles.secondaryButton,
                    ...(hoveredElements['favorite'] ? {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.05)'
                    } : {})
                  }}
                  onMouseEnter={() => handleMouseEnter('favorite')}
                  onMouseLeave={() => handleMouseLeave('favorite')}
                >
                  <Heart size={16} />
                  Yêu thích
                </button>

                {/* Nút Thêm vào với icon từ thư viện */}
                <button 
                  style={{
                    ...styles.secondaryButton,
                    ...(hoveredElements['add'] ? {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.05)'
                    } : {})
                  }}
                  onMouseEnter={() => handleMouseEnter('add')}
                  onMouseLeave={() => handleMouseLeave('add')}
                >
                  <Plus size={16} />
                  Thêm vào
                </button>

                {/* Nút Chia sẻ với icon từ thư viện */}
                <button 
                  style={{
                    ...styles.secondaryButton,
                    ...(hoveredElements['share'] ? {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.05)'
                    } : {})
                  }}
                  onMouseEnter={() => handleMouseEnter('share')}
                  onMouseLeave={() => handleMouseLeave('share')}
                >
                  <Share2 size={16} />
                  Chia sẻ
                </button>

                {/* Nút Bình luận với icon từ thư viện */}
                <button 
                  style={{
                    ...styles.secondaryButton,
                    ...(hoveredElements['comment'] ? {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.05)'
                    } : {})
                  }}
                  onMouseEnter={() => handleMouseEnter('comment')}
                  onMouseLeave={() => handleMouseLeave('comment')}
                >
                  <MessageCircle size={16} />
                  Bình luận
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Tabs Section */}
          <div style={styles.tabsSection}>
            <div style={styles.tabsHeader}>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'schedule' ? styles.tabActive : {})
                }}
                onClick={() => setActiveTab('schedule')}
              >
                Lịch Chiếu
              </button>
            </div>

            <div style={styles.tabContent}>
              <div style={styles.scheduleSection}>
                <h2 style={styles.sectionTitle}>Chọn Suất Chiếu</h2>
                
                {/* Date Selector */}
                <div style={styles.dateSelector}>
                  {movie.Cinemas.map((cinema) => 
                    cinema.ShowtimesByDate.map((dateGroup) => {
                      const date = new Date(dateGroup.Show_Date);
                      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
                      const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                      const dayName = dayNames[date.getDay()];

                      return (
                        <div
                          key={dateGroup.Show_Date}
                          style={{
                            ...styles.dateTab,
                            ...(selectedDate === formattedDate ? styles.dateTabActive : {}),
                            ...(hoveredElements[`date-${formattedDate}`] && selectedDate !== formattedDate ? {
                              background: 'rgba(246,213,92,0.2)',
                              borderColor: '#f6d55c',
                              transform: 'translateY(-2px)'
                            } : {})
                          }}
                          onClick={() => handleDateSelect(formattedDate)}
                          onMouseEnter={() => handleMouseEnter(`date-${formattedDate}`)}
                          onMouseLeave={() => handleMouseLeave(`date-${formattedDate}`)}
                        >
                          <div style={styles.dateDay}>{dayName}</div>
                          <div style={styles.dateNumber}>{formattedDate}</div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Cinema Grid */}
                <div style={styles.cinemaGrid}>
                  {movie.Cinemas.map((cinema) => {
                    const isExpanded = expandedCinema === cinema.Cinema_ID;
                    
                    return cinema.ShowtimesByDate.map((dateGroup) => {
                      const formattedDate = new Date(dateGroup.Show_Date).getDate() + '/' + (new Date(dateGroup.Show_Date).getMonth() + 1);
                      if (selectedDate === formattedDate) {
                        const showtimesByType = groupShowtimesByType(dateGroup.Showtimes);

                        return (
                          <div
                            key={`${cinema.Cinema_ID}-${dateGroup.Show_Date}`}
                            style={{
                              ...styles.cinemaCard,
                              ...(hoveredElements[`cinema-${cinema.Cinema_ID}`] ? {
                                background: 'rgba(255,255,255,0.08)',
                                borderColor: 'rgba(246,213,92,0.3)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                              } : {})
                            }}
                          >
                            <div 
                              style={{
                                ...styles.cinemaName,
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                              onClick={() => setExpandedCinema(isExpanded ? null : cinema.Cinema_ID)}
                              onMouseEnter={() => handleMouseEnter(`cinema-${cinema.Cinema_ID}`)}
                              onMouseLeave={() => handleMouseLeave(`cinema-${cinema.Cinema_ID}`)}
                            >
                              <span>{cinema.Cinema_Name}</span>
                              <span style={{ fontSize: '12px', color: '#cbd5e0' }}>
                                {isExpanded ? '▼' : '▶'}
                              </span>
                            </div>

                            {isExpanded && (
                              <div style={{ marginTop: '15px' }}>
                                {Object.entries(showtimesByType).map(([roomType, showtimes]) => (
                                  <div key={roomType} style={{ marginBottom: '15px' }}>
                                    <div style={{
                                      fontSize: '14px',
                                      color: '#f6d55c',
                                      marginBottom: '10px',
                                      fontWeight: 500
                                    }}>
                                      {roomType}
                                    </div>
                                    <div style={styles.showtimes}>
                                      {showtimes.map((showtime) => (
                                        <button
                                          key={showtime.Showtime_ID}
                                          style={{
                                            ...styles.showtimeButton,
                                            ...(hoveredElements[`showtime-${showtime.Showtime_ID}`] ? {
                                              background: 'linear-gradient(135deg, #f6d55c 0%, #ed8936 100%)',
                                              borderColor: '#f6d55c',
                                              color: '#1a1d29',
                                              transform: 'scale(1.05)',
                                              fontWeight: 'bold'
                                            } : {})
                                          }}
                                          onClick={() => handleBookTicket(cinema.Cinema_Name, formatShowtime(showtime.Start_Time))}
                                          onMouseEnter={() => handleMouseEnter(`showtime-${showtime.Showtime_ID}`)}
                                          onMouseLeave={() => handleMouseLeave(`showtime-${showtime.Showtime_ID}`)}
                                        >
                                          {formatShowtime(showtime.Start_Time)}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    });
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShowtimesPage;
