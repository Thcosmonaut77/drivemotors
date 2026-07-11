import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import VehicleDetail from './pages/VehicleDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SellCar from './pages/SellCar';
import MyPurchases from './pages/MyPurchases';
import MyOffers from './pages/MyOffers';
import AdminDashboard from './pages/AdminDashboard';
import AdminVehicles from './pages/AdminVehicles';
import AdminPurchases from './pages/AdminPurchases';
import AdminSellSubmissions from './pages/AdminSellSubmissions';
import AdminOffers from './pages/AdminOffers';
import AdminUsers from './pages/AdminUsers';

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <div className="min-h-screen flex items-center justify-center"><p className="text-zinc-400">Access denied</p></div>;
  return children;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:category" element={<Catalog />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sell" element={<SellCar />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
          <Route path="/my-offers" element={<MyOffers />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/vehicles" element={<AdminRoute><AdminVehicles /></AdminRoute>} />
          <Route path="/admin/purchases" element={<AdminRoute><AdminPurchases /></AdminRoute>} />
          <Route path="/admin/sell-submissions" element={<AdminRoute><AdminSellSubmissions /></AdminRoute>} />
          <Route path="/admin/offers" element={<AdminRoute><AdminOffers /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
