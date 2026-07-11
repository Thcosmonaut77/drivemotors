import { Link } from 'react-router-dom';
import { Heart, Fuel, Gauge, Calendar } from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function VehicleCard({ vehicle, onUnsave }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(vehicle.isSaved || false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error('Sign in to save vehicles');
    try {
      const res = await api.saveVehicle(vehicle.id);
      setSaved(res.saved);
      if (!res.saved && onUnsave) onUnsave(vehicle.id);
      toast.success(res.saved ? 'Saved to favorites' : 'Removed from favorites');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const conditionColors = {
    new: 'bg-green-500/20 text-green-400',
    used: 'bg-blue-500/20 text-blue-400',
    certified: 'bg-purple-500/20 text-purple-400'
  };

  return (
    <Link to={`/vehicle/${vehicle.id}`} className="card group">
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-800">
        <img src={vehicle.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'} alt={vehicle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex gap-2">
          {vehicle.condition && <span className={`badge ${conditionColors[vehicle.condition] || ''}`}>{vehicle.condition}</span>}
          {vehicle.featured && <span className="badge bg-brand-500/20 text-brand-400">Featured</span>}
        </div>
        <button onClick={handleSave} className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur rounded-full hover:bg-black/70 transition-colors">
          <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>
        {vehicle.category_name && (
          <div className="absolute bottom-3 left-3">
            <span className="badge bg-black/60 backdrop-blur text-zinc-300">{vehicle.category_name}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors line-clamp-1">{vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h3>
        </div>
        <div className="flex items-center gap-3 text-zinc-500 text-xs mb-3">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {vehicle.year}</span>
          {vehicle.mileage > 0 && <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {vehicle.mileage.toLocaleString()} mi</span>}
          {vehicle.fuel_type && <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> {vehicle.fuel_type}</span>}
        </div>
        {vehicle.description && <p className="text-zinc-500 text-sm line-clamp-2 mb-3">{vehicle.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-white">{fmt(vehicle.price)}</span>
          {vehicle.transmission && <span className="text-xs text-zinc-500 capitalize">{vehicle.transmission}</span>}
        </div>
      </div>
    </Link>
  );
}
