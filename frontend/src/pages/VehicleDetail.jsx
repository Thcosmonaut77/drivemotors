import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, Gauge, Fuel, Cog, Star, DollarSign, Send, ArrowLeft, Heart } from 'lucide-react';

export default function VehicleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOffer, setShowOffer] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [purchaseMethod, setPurchaseMethod] = useState('cash');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getVehicle(id).then(d => { setVehicle(d); setSaved(d.isSaved); }).catch(() => toast.error('Vehicle not found')).finally(() => setLoading(false));
  }, [id]);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const handleSave = async () => {
    if (!user) return toast.error('Sign in to save vehicles');
    const res = await api.saveVehicle(id);
    setSaved(res.saved);
    toast.success(res.saved ? 'Saved' : 'Unsaved');
  };

  const handleOffer = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await api.makeOffer({ vehicleId: id, offerAmount: parseFloat(offerAmount), message: offerMessage });
      toast.success('Offer submitted!');
      setShowOffer(false);
      setOfferAmount(''); setOfferMessage('');
    } catch (err) { toast.error(err.message); }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    try {
      await api.submitInquiry({ vehicleId: id, name: user ? `${user.firstName} ${user.lastName}` : 'Guest', email: user?.email || '', message: inquiryMsg });
      toast.success('Inquiry sent!');
      setShowInquiry(false); setInquiryMsg('');
    } catch (err) { toast.error(err.message); }
  };

  const handlePurchase = async () => {
    if (!user) return navigate('/login');
    try {
      await api.createPurchase({ vehicleId: id, paymentMethod: purchaseMethod });
      toast.success('Purchase initiated! We will contact you soon.');
      setShowPurchase(false);
      setVehicle(prev => ({ ...prev, status: 'reserved' }));
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!vehicle) return <div className="text-center py-20 text-zinc-500">Vehicle not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-zinc-400 hover:text-white mb-6"><ArrowLeft className="w-4 h-4" /> Back</button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative rounded-xl overflow-hidden bg-zinc-800 aspect-[4/3]">
          <img src={vehicle.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200'} alt={vehicle.title} className="w-full h-full object-cover" />
          <button onClick={handleSave} className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur rounded-full hover:bg-black/70">
            <Heart className={`w-5 h-5 ${saved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {vehicle.condition && <span className="badge bg-brand-500/20 text-brand-400 capitalize">{vehicle.condition}</span>}
            {vehicle.category_name && <span className="badge bg-zinc-800 text-zinc-400">{vehicle.category_name}</span>}
          </div>
          <h1 className="text-3xl font-bold mb-2">{vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h1>
          <p className="text-3xl font-bold text-brand-500 mb-6">{fmt(vehicle.price)}</p>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-zinc-400 text-sm"><Calendar className="w-4 h-4" /> {vehicle.year}</div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm"><Gauge className="w-4 h-4" /> {vehicle.mileage?.toLocaleString()} miles</div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm"><Fuel className="w-4 h-4" /> {vehicle.fuel_type}</div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm"><Cog className="w-4 h-4" /> {vehicle.transmission}</div>
          </div>

          {/* Additional Info */}
          <div className="bg-zinc-900 rounded-xl p-4 mb-6 space-y-2 text-sm">
            {vehicle.make && <div className="flex justify-between"><span className="text-zinc-500">Make</span><span>{vehicle.make}</span></div>}
            {vehicle.model && <div className="flex justify-between"><span className="text-zinc-500">Model</span><span>{vehicle.model}</span></div>}
            {vehicle.exterior_color && <div className="flex justify-between"><span className="text-zinc-500">Exterior</span><span>{vehicle.exterior_color}</span></div>}
            {vehicle.interior_color && <div className="flex justify-between"><span className="text-zinc-500">Interior</span><span>{vehicle.interior_color}</span></div>}
            {vehicle.drivetrain && <div className="flex justify-between"><span className="text-zinc-500">Drivetrain</span><span className="uppercase">{vehicle.drivetrain}</span></div>}
            {vehicle.engine && <div className="flex justify-between"><span className="text-zinc-500">Engine</span><span>{vehicle.engine}</span></div>}
            {vehicle.vin && <div className="flex justify-between"><span className="text-zinc-500">VIN</span><span className="font-mono text-xs">{vehicle.vin}</span></div>}
          </div>

          {vehicle.description && <p className="text-zinc-400 text-sm mb-6">{vehicle.description}</p>}

          {/* Actions */}
          {vehicle.status === 'available' && (
            <div className="space-y-3">
              <button onClick={() => user ? setShowPurchase(true) : navigate('/login')} className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" /> Buy Now
              </button>
              <button onClick={() => user ? setShowOffer(true) : navigate('/login')} className="btn-outline w-full flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Make an Offer
              </button>
              <button onClick={() => setShowInquiry(true)} className="btn-secondary w-full">Contact About This Vehicle</button>
            </div>
          )}
          {vehicle.status !== 'available' && (
            <div className="bg-zinc-800 rounded-xl p-4 text-center text-zinc-400 capitalize">This vehicle is {vehicle.status}</div>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchase && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowPurchase(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Purchase {vehicle.year} {vehicle.make} {vehicle.model}</h2>
            <p className="text-zinc-400 mb-4">Total: <span className="text-white font-bold">{fmt(vehicle.price)}</span></p>
            <label className="text-sm text-zinc-400 block mb-2">Payment Method</label>
            <select value={purchaseMethod} onChange={e => setPurchaseMethod(e.target.value)} className="input mb-4">
              <option value="cash">Cash / Bank Transfer</option>
              <option value="financing">Financing</option>
              <option value="trade-in">Trade-In + Cash</option>
            </select>
            <div className="flex gap-3">
              <button onClick={handlePurchase} className="btn-primary flex-1">Confirm Purchase</button>
              <button onClick={() => setShowPurchase(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOffer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowOffer(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Make an Offer</h2>
            <p className="text-zinc-500 text-sm mb-4">Listed price: {fmt(vehicle.price)}</p>
            <form onSubmit={handleOffer} className="space-y-4">
              <input type="number" placeholder="Your offer amount" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} className="input" required min="1" />
              <textarea placeholder="Message (optional)" value={offerMessage} onChange={e => setOfferMessage(e.target.value)} className="input h-24 resize-none" />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Submit Offer</button>
                <button type="button" onClick={() => setShowOffer(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowInquiry(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Contact Us</h2>
            <form onSubmit={handleInquiry} className="space-y-4">
              <textarea placeholder="Your message..." value={inquiryMsg} onChange={e => setInquiryMsg(e.target.value)} className="input h-32 resize-none" required />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Send</button>
                <button type="button" onClick={() => setShowInquiry(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reviews */}
      {vehicle.reviews && vehicle.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>
          <div className="space-y-4">
            {vehicle.reviews.map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-700'}`} />)}</div>
                  <span className="text-sm text-zinc-500">{r.first_name} {r.last_name?.[0]}.</span>
                </div>
                {r.title && <h4 className="font-medium mb-1">{r.title}</h4>}
                {r.comment && <p className="text-zinc-400 text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
