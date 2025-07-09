import React from 'react'
import { Calendar, Star } from 'lucide-react'

const ComingSoon: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 bg-dark-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Coming Soon
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Get ready for the most anticipated movies of the year. Book your tickets in advance!
          </p>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {comingSoonMovies.map((movie) => (
            <div key={movie.id} className="movie-card group">
              <div className="relative overflow-hidden rounded-t-xl">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Release Date Badge */}
                <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {new Date(movie.releaseDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="btn-primary">
                    Notify Me
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {movie.title}
                </h3>
                
                <div className="flex items-center space-x-4 text-sm text-white/70 mb-3">
                  <span className="px-2 py-1 bg-white/10 rounded">
                    {movie.rating}
                  </span>
                  <span>{movie.duration} min</span>
                </div>

                <p className="text-white/80 text-sm mb-4 line-clamp-2">
                  {movie.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-primary-400" />
                    <span className="text-sm text-white/70">
                      {new Date(movie.releaseDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-white/70">
                    {movie.genre.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ComingSoon