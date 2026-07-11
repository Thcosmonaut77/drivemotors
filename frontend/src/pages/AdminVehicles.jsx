import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', make: '', model: '', year: '', price: '', mileage: '', exteriorColor: '', interiorColor: '', transmission: 'automatic', fuelType: 'gasoline', engine: '', drivetrain: 'rwd', vin: '', imageUrl: '', condition: 'new', featured: false, status: 'available' });

  const load = () => api.admin.getVehicles().then(d => setVehicles(d.vehicles)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editVehicle) {
        await api.admin.updateVehicle(editVehicle.id, form);
        toast.success('Vehicle updated');
      } else {
        await api.admin.addVehicle(form);
        toast.success('Vehicle added');
      }
      setShowForm(false); setEditVehicle(null);
      setForm({ title: '', description: '', make: '', model: '', year: '', price: '', mileage: '', exteriorColor: '', interiorColor: '', transmission: 'automatic', fuelType: 'gasoline', engine: '', drivetrain: 'rwd', vin: '', imageUrl: '', condition: 'new', featured: false, status: 'available' });
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleEdit = (v) => {
    setEditVehicle(v);
    setForm({ title: v.title || '', description: v.description || '', make: v.make, model: v.model, year: v.year, price: v.price, mileage: v.mileage || '', exteriorColor: v.exterior_color || '', interiorColor: v.interior_color || '', transmission: v.transmission || 'automatic', fuelType: v.fuel_type || 'gasoline', engine: v.engine || '', drivetrain: v.drivetrain || 'rwd', vin: v.vin || '', imageUrl: v.image_url || '', condition: v.condition || 'new', featured: v.featured || false, status: v.status || 'available' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    try { await api.admin.deleteVehicle(id); toast.success('Deleted'); load(); } catch (err) { toast.error(err.message); }
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const statusColor = { available: 'bg-green-500/20 text-green-400', reserved: 'bg-yellow-500/20 text-yellow-400', sold: 'bg-red-500/20 text-red-400', pending: 'bg-blue-500/20 text-blue-400' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Vehicles</h1>
        <button onClick={() => { setShowForm(!showForm); setEditVehicle(null); setForm({ title: '', description: '', make: '', model: '', year: '', price: '', mileage: '', exteriorColor: '', interiorColor: '', transmission: 'automatic', fuelType: 'gasoline', engine: '', drivetrain: 'rwd', vin: '', imageUrl: '', condition: 'new', featured: false, status: 'available' }); }} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Vehicle</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-8 space-y-4">
          <h2 className="text-xl font-bold">{editVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input type="text" placeholder="Title" value={form.title} onChange={e => update('title', e.target.value)} className="input" required />
            <input type="text" placeholder="Make" value={form.make} onChange={e => update('make', e.target.value)} className="input" required />
            <input type="text" placeholder="Model" value={form.model} onChange={e => update('model', e.target.value)} className="input" required />
            <input type="number" placeholder="Year" value={form.year} onChange={e => update('year', e.target.value)} className="input" required />
            <input type="number" placeholder="Price" value={form.price} onChange={e => update('price', e.target.value)} className="input" required />
            <input type="number" placeholder="Mileage" value={form.mileage} onChange={e => update('mileage', e.target.value)} className="input" />
            <input type="text" placeholder="Exterior Color" value={form.exteriorColor} onChange={e => update('exteriorColor', e.target.value)} className="input" />
            <input type="text" placeholder="Interior Color" value={form.interiorColor} onChange={e => update('interiorColor', e.target.value)} className="input" />
            <select value={form.transmission} onChange={e => update('transmission', e.target.value)} className="input"><option value="automatic">Automatic</option><option value="manual">Manual</option></select>
            <select value={form.fuelType} onChange={e => update('fuelType', e.target.value)} className="input"><option value="gasoline">Gasoline</option><option value="diesel">Diesel</option><option value="electric">Electric</option><option value="hybrid">Hybrid</option></select>
            <select value={form.drivetrain} onChange={e => update('drivetrain', e.target.value)} className="input"><option value="rwd">RWD</option><option value="fwd">FWD</option><option value="awd">AWD</option><option value="4wd">4WD</option></select>
            <select value={form.condition} onChange={e => update('condition', e.target.value)} className="input"><option value="new">New</option><option value="used">Used</option><option value="certified">Certified</option></select>
          </div>
          <input type="text" placeholder="Engine" value={form.engine} onChange={e => update('engine', e.target.value)} className="input" />
          <input type="text" placeholder="VIN" value={form.vin} onChange={e => update('vin', e.target.value)} className="input" maxLength="17" />
          <input type="url" placeholder="Image URL" value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)} className="input" />
          <textarea placeholder="Description" value={form.description} onChange={e => update('description', e.target.value)} className="input h-20 resize-none" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={e => update('featured', e.target.checked)} className="rounded" /> Featured</label>
            <select value={form.status} onChange={e => update('status', e.target.value)} className="input w-auto"><option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option><option value="pending">Pending</option></select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editVehicle ? 'Update' : 'Add'} Vehicle</button>
            <button type="button" onClick={() => { setShowForm(false); setEditVehicle(null); }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div> : (
        <div className="space-y-3">
          {vehicles.map(v => (
            <div key={v.id} className="card p-4 flex items-center gap-4">
              <img src={v.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200'} alt="" className="w-20 h-14 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{v.title || `${v.year} ${v.make} ${v.model}`}</h3>
                <p className="text-zinc-500 text-sm">{fmt(v.price)}</p>
              </div>
              <span className={`badge ${statusColor[v.status] || ''}`}>{v.status}</span>
              <button onClick={() => handleEdit(v)} className="p-2 hover:bg-zinc-800 rounded-lg"><Edit className="w-4 h-4 text-zinc-400" /></button>
              <button onClick={() => handleDelete(v.id)} className="p-2 hover:bg-zinc-800 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
