import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function Catalog() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [makes, setMakes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    make: searchParams.get('make') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    year: searchParams.get('year') || '',
    condition: searchParams.get('condition') || '',
    fuel: searchParams.get('fuel') || '',
    transmission: searchParams.get('transmission') || '',
    sort: searchParams.get('sort') || 'newest',
    category: category || searchParams.get('category') || '',
    page: parseInt(searchParams.get('page') || '1')
  });

  useEffect(() => {
    api.getMakes().then(setMakes).catch(() => {});
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    api.getVehicles(params).then(d => { setVehicles(d.vehicles); setPagination(d.pagination); }).catch(() => {}).finally(() => setLoading(false));
  }, [filters]);

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  const clearFilters = () => setFilters({ search: '', make: '', minPrice: '', maxPrice: '', year: '', condition: '', fuel: '', transmission: '', sort: 'newest', category: '', page: 1 });

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input type="text" placeholder="Search by make, model, or keyword..." value={filters.search} onChange={e => updateFilter('search', e.target.value)} className="input pl-10" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} className="input w-auto">
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="year-desc">Year: Newest</option>
          <option value="mileage">Lowest Mileage</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => updateFilter('category', '')} className={`badge px-4 py-2 text-sm whitespace-nowrap cursor-pointer transition-colors ${!filters.category ? 'bg-brand-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>All</button>
        {categories.map(c => (
          <button key={c.slug} onClick={() => updateFilter('category', c.slug)} className={`badge px-4 py-2 text-sm whitespace-nowrap cursor-pointer transition-colors ${filters.category === c.slug ? 'bg-brand-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{c.name}</button>
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Make</label>
            <select value={filters.make} onChange={e => updateFilter('make', e.target.value)} className="input">
              <option value="">All Makes</option>
              {makes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Min Price</label>
            <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className="input" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Max Price</label>
            <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className="input" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Year</label>
            <input type="number" placeholder="Year" value={filters.year} onChange={e => updateFilter('year', e.target.value)} className="input" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Condition</label>
            <select value={filters.condition} onChange={e => updateFilter('condition', e.target.value)} className="input">
              <option value="">Any</option>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="certified">Certified</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Fuel Type</label>
            <select value={filters.fuel} onChange={e => updateFilter('fuel', e.target.value)} className="input">
              <option value="">Any</option>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Transmission</label>
            <select value={filters.transmission} onChange={e => updateFilter('transmission', e.target.value)} className="input">
              <option value="">Any</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={clearFilters} className="btn-secondary w-full flex items-center justify-center gap-1"><X className="w-4 h-4" /> Clear</button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg mb-2">No vehicles found</p>
          <p className="text-zinc-600 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <p className="text-zinc-500 text-sm mb-4">{pagination.total} vehicle{pagination.total !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => updateFilter('page', p)} className={`px-4 py-2 rounded-lg text-sm ${p === filters.page ? 'bg-brand-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
