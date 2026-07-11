import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MyPurchases() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate('/login');
    api.getMyPurchases().then(setPurchases).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this purchase?')) return;
    try {
      await api.cancelPurchase(id);
      setPurchases(prev => prev.map(p => p.id === id ? { ...p, status: 'cancelled' } : p));
      toast.success('Purchase cancelled');
    } catch (err) { toast.error(err.message); }
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const statusColor = { pending: 'bg-yellow-500/20 text-yellow-400', confirmed: 'bg-blue-500/20 text-blue-400', financing: 'bg-purple-500/20 text-purple-400', completed: 'bg-green-500/20 text-green-400', cancelled: 'bg-red-500/20 text-red-400' };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Purchases</h1>
      {purchases.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 mb-4">No purchases yet</p>
          <Link to="/catalog" className="btn-primary">Browse Inventory</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map(p => (
            <div key={p.id} className="card p-4 flex gap-4">
              <img src={p.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'} alt={p.title} className="w-32 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{p.title || `${p.year} ${p.make} ${p.model}`}</h3>
                    <p className="text-zinc-500 text-sm">VIN: {p.vin}</p>
                  </div>
                  <span className={`badge ${statusColor[p.status] || ''}`}>{p.status}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-brand-500">{fmt(p.total_amount)}</span>
                  {['pending', 'confirmed'].includes(p.status) && (
                    <button onClick={() => handleCancel(p.id)} className="text-red-400 hover:text-red-300 text-sm">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
