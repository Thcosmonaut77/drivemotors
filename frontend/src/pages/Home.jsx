import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import { Car, Shield, DollarSign, Headphones, ArrowRight, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getVehicles({ featured: 'true', limit: 6 }).then(d => setFeatured(d.vehicles)).catch(() => {});
    api.getStats().then(setStats).catch(() => {});
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920" alt="Luxury car" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl">
            <p className="text-brand-500 font-semibold mb-4 tracking-wider uppercase">Premium Vehicle Marketplace</p>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">Find Your <span className="text-brand-500">Dream</span> Ride</h1>
            <p className="text-zinc-400 text-lg mb-8 max-w-lg">Browse our curated collection of premium vehicles. Buy with confidence or sell your car hassle-free.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalog" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                Browse Inventory <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/sell" className="btn-outline text-lg px-8 py-4">Sell Your Car</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-12 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-500">{stats.available}+</div>
              <div className="text-zinc-500 text-sm">Vehicles Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-500">{stats.sold}+</div>
              <div className="text-zinc-500 text-sm">Cars Sold</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-500">{stats.customers}+</div>
              <div className="text-zinc-500 text-sm">Happy Customers</div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Vehicles */}
      {featured.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Vehicles</h2>
                <p className="text-zinc-500">Hand-picked premium selections</p>
              </div>
              <Link to="/catalog" className="text-brand-500 hover:text-brand-400 flex items-center gap-1 text-sm font-medium">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(v => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose DriveX</h2>
          <p className="text-zinc-500 text-center mb-12 max-w-lg mx-auto">Everything you need for a seamless vehicle buying and selling experience</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Verified Vehicles', desc: 'Every vehicle undergoes rigorous inspection and verification before listing.' },
              { icon: DollarSign, title: 'Best Prices', desc: 'Competitive pricing with transparent negotiations and fair offers.' },
              { icon: Headphones, title: '24/7 Support', desc: 'Our team is always available to assist you with any questions.' },
              { icon: Car, title: 'Easy Process', desc: 'Streamlined buying and selling process from start to finish.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <div className="w-12 h-12 bg-brand-500/10 text-brand-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-zinc-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Sell Your Car?</h2>
          <p className="text-zinc-500 mb-8 max-w-lg mx-auto">Get a fair offer for your vehicle. Submit your car details and our team will get back to you within 24 hours.</p>
          <Link to="/sell" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
