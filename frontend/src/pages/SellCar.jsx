import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Car, Upload } from 'lucide-react';

export default function SellCar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ make: '', model: '', year: '', mileage: '', condition: 'good', vin: '', askingPrice: '', imageUrl: '', additionalInfo: '' });
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitSellCar(form);
      toast.success('Submission received! We will review your car and get back to you.');
      navigate('/');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Car className="w-8 h-8" /></div>
        <h1 className="text-3xl font-bold mb-2">Sell Your Car</h1>
        <p className="text-zinc-500">Submit your vehicle details and we will get back to you with a competitive offer.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 card p-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-zinc-400 mb-1 block">Make *</label><input type="text" value={form.make} onChange={e => update('make', e.target.value)} className="input" placeholder="e.g. Toyota" required /></div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Model *</label><input type="text" value={form.model} onChange={e => update('model', e.target.value)} className="input" placeholder="e.g. Camry" required /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-zinc-400 mb-1 block">Year *</label><input type="number" value={form.year} onChange={e => update('year', e.target.value)} className="input" placeholder="e.g. 2020" min="1900" max="2100" required /></div>
          <div><label className="text-sm text-zinc-400 mb-1 block">Mileage</label><input type="number" value={form.mileage} onChange={e => update('mileage', e.target.value)} className="input" placeholder="e.g. 35000" min="0" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm text-zinc-400 mb-1 block">Condition</label>
            <select value={form.condition} onChange={e => update('condition', e.target.value)} className="input">
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          <div><label className="text-sm text-zinc-400 mb-1 block">VIN</label><input type="text" value={form.vin} onChange={e => update('vin', e.target.value)} className="input" placeholder="17-character VIN" maxLength="17" /></div>
        </div>
        <div><label className="text-sm text-zinc-400 mb-1 block">Asking Price ($)</label><input type="number" value={form.askingPrice} onChange={e => update('askingPrice', e.target.value)} className="input" placeholder="Your expected price" min="0" /></div>
        <div><label className="text-sm text-zinc-400 mb-1 block">Image URL</label><input type="url" value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)} className="input" placeholder="https://..." /></div>
        <div><label className="text-sm text-zinc-400 mb-1 block">Additional Information</label><textarea value={form.additionalInfo} onChange={e => update('additionalInfo', e.target.value)} className="input h-24 resize-none" placeholder="Any additional details about your vehicle..." /></div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Vehicle'}
        </button>
      </form>
    </div>
  );
}
