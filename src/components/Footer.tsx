import React from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CineMax</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Experience premium cinema with state-of-the-art technology, comfortable seating, and the latest blockbusters.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-primary-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-primary-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-primary-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/movies" className="block text-white/70 hover:text-primary-400 transition-colors text-sm">
                Now Showing
              </Link>
              <Link to="/coming-soon" className="block text-white/70 hover:text-primary-400 transition-colors text-sm">
                Coming Soon
              </Link>
              <Link to="/cinemas" className="block text-white/70 hover:text-primary-400 transition-colors text-sm">
                Our Cinemas
              </Link>
              <Link to="/promotions" className="block text-white/70 hover:text-primary-400 transition-colors text-sm">
                Promotions
              </Link>
              <Link to="/gift-cards" className="block text-white/70 hover:text-primary-400 transition-colors text-sm">
                Gift Cards
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Support</h3>
            <div className="space-y-2">
              <Link to="/help" className="block text-white/70 hover:text-primary-400 transition-colors text-sm">
                Help Center
              </Link>
              <Link to="/contact" className="block text-white/70 hover:text-primary-400 transition-colors text-sm">
                Contact Us
              </Link>
              <Link to="/terms" className="block text-white/70 hover:text-primary-400 transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/privacy" className="block text-white/70 hover:text-primary-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/accessibility" className="block text-white/70 hover:text-primary-400 transition-colors text-sm">
                Accessibility
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-400" />
                <span className="text-white/70 text-sm">1-800-CINEMAX</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-400" />
                <span className="text-white/70 text-sm">info@cinemax.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5" />
                <span className="text-white/70 text-sm">
                  123 Cinema Street<br />
                  Entertainment District<br />
                  New York, NY 10001
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/50 text-sm">
              © 2025 CineMax. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-white/50 hover:text-primary-400 transition-colors text-sm">
                Terms
              </Link>
              <Link to="/privacy" className="text-white/50 hover:text-primary-400 transition-colors text-sm">
                Privacy
              </Link>
              <Link to="/cookies" className="text-white/50 hover:text-primary-400 transition-colors text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer