import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.admin.getOffers().then(setOffers).catch(() => {}).finally(() => setLoading(false)); }, []);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const statusColor = { pending: 'bg-yellow-500/20 text-yellow-400', countered: 'bg-blue-500/20 text-blue-400', accepted: 'bg-green-500/20 text-green-400', rejected: 'bg-red-500/20 text-red-400', expired: 'bg-zinc-500/20 text-zinc-400' };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Offers</h1>
      <div className="space-y-3">
        {offers.map(o => (
          <div key={o.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{o.title || `${o.year} ${o.make} ${o.model}`}</h3>
                <p className="text-zinc-500 text-sm">{o.first_name} {o.last_name} ({o.email}) offered {fmt(o.offer_amount)} on listed price {fmt(o.listed_price)}</p>
                {o.message && <p className="text-zinc-400 text-sm italic mt-1">"{o.message}"</p>}
              </div>
              <span className={`badge ${statusColor[o.status] || ''}`}>{o.status}</span>
            </div>
          </div>
        ))}
        {offers.length === 0 && <p className="text-zinc-500 text-center py-10">No offers yet</p>}
      </div>
    </div>
  );
}
