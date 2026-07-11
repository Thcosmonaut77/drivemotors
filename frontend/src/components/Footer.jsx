import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Car className="w-6 h-6 text-brand-500" />
              <span className="text-lg font-bold">Drive<span className="text-brand-500">X</span></span>
            </Link>
            <p className="text-zinc-500 text-sm">Your trusted premium vehicle marketplace. Buy, sell, and trade with confidence.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/catalog" className="block text-zinc-500 hover:text-white text-sm transition-colors">Browse Inventory</Link>
              <Link to="/sell" className="block text-zinc-500 hover:text-white text-sm transition-colors">Sell Your Car</Link>
              <Link to="/register" className="block text-zinc-500 hover:text-white text-sm transition-colors">Create Account</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              <Link to="/catalog?category=sedan" className="block text-zinc-500 hover:text-white text-sm transition-colors">Sedans</Link>
              <Link to="/catalog?category=suv" className="block text-zinc-500 hover:text-white text-sm transition-colors">SUVs</Link>
              <Link to="/catalog?category=coupe" className="block text-zinc-500 hover:text-white text-sm transition-colors">Coupes</Link>
              <Link to="/catalog?category=electric" className="block text-zinc-500 hover:text-white text-sm transition-colors">Electric</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-zinc-500 text-sm"><Phone className="w-4 h-4" /> (555) 123-4567</div>
              <div className="flex items-center gap-2 text-zinc-500 text-sm"><Mail className="w-4 h-4" /> info@drivex.com</div>
              <div className="flex items-center gap-2 text-zinc-500 text-sm"><MapPin className="w-4 h-4" /> 123 Motor Ave, Auto City</div>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-800 mt-8 pt-6 text-center text-zinc-600 text-sm">
          &copy; {new Date().getFullYear()} DriveX Motors. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
