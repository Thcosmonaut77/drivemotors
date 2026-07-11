import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminSellSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.admin.getSellSubmissions().then(setSubmissions).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleUpdate = async (id, status, offeredPrice, adminNotes) => {
    try {
      await api.admin.updateSellSubmission(id, { status, offeredPrice: offeredPrice || null, adminNotes: adminNotes || null });
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, offered_price: offeredPrice, admin_notes: adminNotes } : s));
      toast.success('Updated');
    } catch (err) { toast.error(err.message); }
  };

  const fmt = (n) => n ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) : '-';
  const statusColor = { pending: 'bg-yellow-500/20 text-yellow-400', reviewed: 'bg-blue-500/20 text-blue-400', accepted: 'bg-green-500/20 text-green-400', rejected: 'bg-red-500/20 text-red-400' };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sell Submissions</h1>
      <div className="space-y-4">
        {submissions.map(s => (
          <div key={s.id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium">{s.year} {s.make} {s.model}</h3>
                <p className="text-zinc-500 text-sm">Mileage: {s.mileage?.toLocaleString()} | Condition: {s.condition} | VIN: {s.vin || 'N/A'}</p>
                <p className="text-zinc-500 text-sm">{s.first_name} {s.last_name} ({s.email}) | Asking: {fmt(s.asking_price)}</p>
                {s.additional_info && <p className="text-zinc-400 text-sm mt-1">{s.additional_info}</p>}
              </div>
              <span className={`badge ${statusColor[s.status] || ''}`}>{s.status}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <input type="number" placeholder="Offer price" defaultValue={s.offered_price || ''} id={`price-${s.id}`} className="input w-36 text-sm py-2" />
              <input type="text" placeholder="Admin notes" defaultValue={s.admin_notes || ''} id={`notes-${s.id}`} className="input flex-1 text-sm py-2" />
              <button onClick={() => handleUpdate(s.id, 'reviewed', document.getElementById(`price-${s.id}`).value, document.getElementById(`notes-${s.id}`).value)} className="btn-secondary text-sm py-2 px-3">Review</button>
              <button onClick={() => handleUpdate(s.id, 'accepted', document.getElementById(`price-${s.id}`).value, document.getElementById(`notes-${s.id}`).value)} className="btn-primary text-sm py-2 px-3">Accept</button>
              <button onClick={() => handleUpdate(s.id, 'rejected', null, document.getElementById(`notes-${s.id}`).value)} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm py-2 px-3 rounded-lg">Reject</button>
            </div>
          </div>
        ))}
        {submissions.length === 0 && <p className="text-zinc-500 text-center py-10">No submissions yet</p>}
      </div>
    </div>
  );
}
