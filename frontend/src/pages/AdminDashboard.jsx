import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Car, ShoppingCart, DollarSign, Users, TrendingUp, Clock, Package } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { icon: Car, label: 'Total Vehicles', value: stats?.totalVehicles, color: 'text-blue-400', bg: 'bg-blue-500/10', link: '/admin/vehicles' },
    { icon: ShoppingCart, label: 'Total Purchases', value: stats?.totalPurchases, color: 'text-green-400', bg: 'bg-green-500/10', link: '/admin/purchases' },
    { icon: DollarSign, label: 'Total Revenue', value: fmt(stats?.totalRevenue || 0), color: 'text-brand-400', bg: 'bg-brand-500/10', link: '/admin/purchases' },
    { icon: Users, label: 'Customers', value: stats?.totalCustomers, color: 'text-purple-400', bg: 'bg-purple-500/10', link: '/admin/users' },
    { icon: Clock, label: 'Pending Offers', value: stats?.pendingOffers, color: 'text-yellow-400', bg: 'bg-yellow-500/10', link: '/admin/offers' },
    { icon: Package, label: 'Sell Submissions', value: stats?.pendingSellSubmissions, color: 'text-orange-400', bg: 'bg-orange-500/10', link: '/admin/sell-submissions' },
  ];

  const links = [
    { to: '/admin/vehicles', label: 'Manage Vehicles', icon: Car },
    { to: '/admin/purchases', label: 'Manage Purchases', icon: ShoppingCart },
    { to: '/admin/offers', label: 'Manage Offers', icon: TrendingUp },
    { to: '/admin/sell-submissions', label: 'Sell Submissions', icon: Package },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link to="/admin/vehicles" className="btn-primary">Add Vehicle</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map(({ icon: Icon, label, value, color, bg, link }) => (
          <Link to={link} key={label} className="card p-4 hover:border-brand-500/30">
            <div className={`w-10 h-10 ${bg} ${color} rounded-lg flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
            <div className="text-2xl font-bold">{value ?? 0}</div>
            <div className="text-zinc-500 text-xs">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map(({ to, label, icon: Icon }) => (
          <Link to={to} key={to} className="card p-6 flex items-center gap-4 hover:border-brand-500/30 group">
            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-brand-500/10 group-hover:text-brand-500 transition-colors"><Icon className="w-6 h-6" /></div>
            <span className="font-semibold">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
