import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.admin.getPurchases().then(setPurchases).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.admin.updatePurchase(id, { status });
      setPurchases(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      toast.success('Updated');
    } catch (err) { toast.error(err.message); }
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const statusColor = { pending: 'bg-yellow-500/20 text-yellow-400', confirmed: 'bg-blue-500/20 text-blue-400', financing: 'bg-purple-500/20 text-purple-400', completed: 'bg-green-500/20 text-green-400', cancelled: 'bg-red-500/20 text-red-400' };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Purchases</h1>
      <div className="space-y-3">
        {purchases.map(p => (
          <div key={p.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{p.title || `${p.year} ${p.make} ${p.model}`}</h3>
                <p className="text-zinc-500 text-sm">{p.first_name} {p.last_name} ({p.email}) - {fmt(p.total_amount)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${statusColor[p.status] || ''}`}>{p.status}</span>
                <select value={p.status} onChange={e => handleStatus(p.id, e.target.value)} className="input w-auto text-sm py-1">
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="financing">Financing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        {purchases.length === 0 && <p className="text-zinc-500 text-center py-10">No purchases yet</p>}
      </div>
    </div>
  );
}
