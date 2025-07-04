import React from 'react'
import { MapPin, Phone, Clock, Car, Train } from 'lucide-react'
import { Link } from 'react-router-dom'

const CinemaLocations: React.FC = () => {
  const locations = [
    {
      id: 1,
      name: 'CineMax Times Square',
      address: '234 W 42nd Street, New York, NY 10036',
      phone: '(212) 555-0123',
      image: 'https://images.pexels.com/photos/7991229/pexels-photo-7991229.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      features: ['IMAX', 'Dolby Atmos', 'Premium Seating', 'Concessions'],
      hours: 'Daily 10:00 AM - 12:00 AM',
      parking: 'Valet & Self-parking available',
      transit: 'Times Sq-42 St Station'
    },
    {
      id: 2,
      name: 'CineMax Brooklyn Heights',
      address: '106 Court Street, Brooklyn, NY 11201',
      phone: '(718) 555-0456',
      image: 'https://images.pexels.com/photos/7991230/pexels-photo-7991230.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      features: ['4DX', 'VIP Lounges', 'Full Bar', 'Gourmet Dining'],
      hours: 'Daily 11:00 AM - 11:30 PM',
      parking: 'Street parking available',
      transit: 'Borough Hall Station'
    },
    {
      id: 3,
      name: 'CineMax Upper West Side',
      address: '2310 Broadway, New York, NY 10024',
      phone: '(212) 555-0789',
      image: 'https://images.pexels.com/photos/7991231/pexels-photo-7991231.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      features: ['ScreenX', 'Reclining Seats', 'Café', 'Family Friendly'],
      hours: 'Daily 10:30 AM - 11:00 PM',
      parking: 'Garage parking nearby',
      transit: '86th St Station'
    }
  ]

  return (
    <section className="py-16 lg:py-24 bg-dark-900/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Our Locations
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Visit any of our premium cinema locations for the ultimate movie experience
          </p>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {locations.map((location) => (
            <div
              key={location.id}
              className="glass-effect rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
            >
              {/* Location Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" />
              </div>

              <div className="p-6">
                {/* Location Name */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {location.name}
                </h3>

                {/* Address */}
                <div className="flex items-start space-x-3 mb-3">
                  <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white/80 text-sm">
                    {location.address}
                  </span>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-3 mb-3">
                  <Phone className="w-5 h-5 text-primary-400" />
                  <span className="text-white/80 text-sm">
                    {location.phone}
                  </span>
                </div>

                {/* Hours */}
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-5 h-5 text-primary-400" />
                  <span className="text-white/80 text-sm">
                    {location.hours}
                  </span>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-white font-semibold text-sm mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {location.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-600/20 text-primary-300 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Transportation */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center space-x-3">
                    <Car className="w-4 h-4 text-white/60" />
                    <span className="text-white/70 text-xs">
                      {location.parking}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Train className="w-4 h-4 text-white/60" />
                    <span className="text-white/70 text-xs">
                      {location.transit}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button className="flex-1 btn-primary text-sm py-2">
                    Get Directions
                  </button>
                  <Link 
                    to={`/showtimes?cinema=theater${location.id}`} 
                    className="flex-1 btn-secondary text-sm py-2 text-center"
                  >
                    View Showtimes
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CinemaLocations