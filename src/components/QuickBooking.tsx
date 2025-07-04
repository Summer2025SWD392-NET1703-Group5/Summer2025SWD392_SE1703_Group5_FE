import React, { useState } from 'react'
import { Search, Calendar, MapPin, Film } from 'lucide-react'

const QuickBooking: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState('')
  const [selectedCinema, setSelectedCinema] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  return (
    <section className="relative -mt-20 z-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="glass-effect rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto animate-slide-up">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Quick Booking
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Movie Selection */}
            <div className="space-y-2">
              <label className="block text-white/80 text-sm font-medium">
                <Film className="w-4 h-4 inline mr-2" />
                Movie
              </label>
              <select
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Movie</option>
                <option value="quantum-nexus">Quantum Nexus</option>
                <option value="last-symphony">The Last Symphony</option>
                <option value="neon-nights">Neon Nights</option>
                <option value="wildfire-heart">Wildfire Heart</option>
              </select>
            </div>

            {/* Cinema Selection */}
            <div className="space-y-2">
              <label className="block text-white/80 text-sm font-medium">
                <MapPin className="w-4 h-4 inline mr-2" />
                Cinema
              </label>
              <select
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Cinema</option>
                <option value="times-square">CineMax Times Square</option>
                <option value="brooklyn">CineMax Brooklyn</option>
                <option value="manhattan">CineMax Manhattan</option>
                <option value="queens">CineMax Queens</option>
              </select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="block text-white/80 text-sm font-medium">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Search Button */}
            <div className="space-y-2">
              <label className="block text-transparent text-sm font-medium">
                Search
              </label>
              <button className="w-full btn-primary flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Find Shows</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuickBooking