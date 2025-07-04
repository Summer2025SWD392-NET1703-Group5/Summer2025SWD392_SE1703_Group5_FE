import React from 'react'
import { Gift, Percent, Users, Calendar } from 'lucide-react'

const Promotions: React.FC = () => {
  const promotions = [
    {
      id: 1,
      title: 'Student Discount',
      description: 'Get 25% off on all movie tickets with valid student ID',
      discount: '25% OFF',
      icon: <Users className="w-8 h-8" />,
      color: 'from-blue-500 to-purple-600',
      validUntil: '2025-03-31'
    },
    {
      id: 2,
      title: 'Weekend Special',
      description: 'Buy 2 tickets and get 1 free on weekends',
      discount: 'Buy 2 Get 1',
      icon: <Gift className="w-8 h-8" />,
      color: 'from-green-500 to-teal-600',
      validUntil: '2025-02-28'
    },
    {
      id: 3,
      title: 'Family Pack',
      description: 'Special pricing for families of 4 or more',
      discount: '30% OFF',
      icon: <Percent className="w-8 h-8" />,
      color: 'from-orange-500 to-red-600',
      validUntil: '2025-04-15'
    },
    {
      id: 4,
      title: 'Early Bird',
      description: 'Book tickets 7 days in advance and save',
      discount: '20% OFF',
      icon: <Calendar className="w-8 h-8" />,
      color: 'from-pink-500 to-rose-600',
      validUntil: '2025-12-31'
    }
  ]

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Special Offers
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Don't miss out on these amazing deals and save on your next movie experience
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 group"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${promo.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
              
              <div className="relative p-6">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${promo.color} flex items-center justify-center text-white mb-4`}>
                  {promo.icon}
                </div>

                {/* Discount Badge */}
                <div className="inline-block px-3 py-1 bg-primary-600 text-white text-sm font-bold rounded-full mb-3">
                  {promo.discount}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2">
                  {promo.title}
                </h3>
                <p className="text-white/80 text-sm mb-4 leading-relaxed">
                  {promo.description}
                </p>

                {/* Valid Until */}
                <div className="text-xs text-white/60 mb-4">
                  Valid until {new Date(promo.validUntil).toLocaleDateString()}
                </div>

                {/* CTA Button */}
                <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 border border-white/20">
                  Claim Offer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 text-center">
          <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Never Miss a Deal
            </h3>
            <p className="text-white/70 mb-6">
              Subscribe to our newsletter and be the first to know about exclusive offers and promotions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Promotions