import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Car, User, LogOut, Shield, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  return (
    <nav className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Car className="w-7 h-7 text-brand-500" />
            <span className="text-xl font-bold">Drive<span className="text-brand-500">X</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/catalog" className="text-zinc-400 hover:text-white transition-colors">Inventory</Link>
            <Link to="/sell" className="text-zinc-400 hover:text-white transition-colors">Sell Your Car</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-brand-500/20 text-brand-500 rounded-full flex items-center justify-center text-sm font-semibold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-zinc-800">
                      <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link to="/my-purchases" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                      <Car className="w-4 h-4" /> My Purchases
                    </Link>
                    <Link to="/my-offers" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                      <Car className="w-4 h-4" /> My Offers
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-400 hover:bg-zinc-800">
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <hr className="border-zinc-800 my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 w-full">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-zinc-400 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-zinc-400">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/catalog" onClick={() => setOpen(false)} className="block px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg">Inventory</Link>
            <Link to="/sell" onClick={() => setOpen(false)} className="block px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg">Sell Your Car</Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="block px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg">Profile</Link>
                <Link to="/my-purchases" onClick={() => setOpen(false)} className="block px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg">My Purchases</Link>
                <Link to="/my-offers" onClick={() => setOpen(false)} className="block px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg">My Offers</Link>
                {user.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)} className="block px-3 py-2 text-brand-400 hover:bg-zinc-800 rounded-lg">Admin</Link>}
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-400 hover:bg-zinc-800 rounded-lg">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 text-zinc-300 hover:bg-zinc-800 rounded-lg">Sign In</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2 text-brand-500 font-semibold">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
