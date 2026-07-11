import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MyOffers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate('/login');
    api.getMyOffers().then(setOffers).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const statusColor = { pending: 'bg-yellow-500/20 text-yellow-400', countered: 'bg-blue-500/20 text-blue-400', accepted: 'bg-green-500/20 text-green-400', rejected: 'bg-red-500/20 text-red-400', expired: 'bg-zinc-500/20 text-zinc-400' };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Offers</h1>
      {offers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 mb-4">No offers yet</p>
          <Link to="/catalog" className="btn-primary">Browse & Make an Offer</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map(o => (
            <div key={o.id} className="card p-4">
              <div className="flex gap-4">
                <img src={o.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'} alt={o.title} className="w-24 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/vehicle/${o.vehicle_id}`} className="font-semibold hover:text-brand-400">{o.title || `${o.year} ${o.make} ${o.model}`}</Link>
                      <p className="text-zinc-500 text-sm">Listed: {fmt(o.listed_price)}</p>
                    </div>
                    <span className={`badge ${statusColor[o.status] || ''}`}>{o.status}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-zinc-500">Your Offer:</span> <span className="font-bold text-brand-500">{fmt(o.offer_amount)}</span></div>
                    {o.counter_amount && <div><span className="text-zinc-500">Counter:</span> <span className="font-bold text-yellow-400">{fmt(o.counter_amount)}</span></div>}
                  </div>
                  {o.message && <p className="text-zinc-500 text-sm mt-2">"{o.message}"</p>}
                  {o.counter_message && <p className="text-blue-400 text-sm mt-1">Counter: "{o.counter_message}"</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
