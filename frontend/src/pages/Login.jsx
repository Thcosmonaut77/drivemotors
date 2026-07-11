import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-zinc-500 text-center mb-8">Sign in to your DriveX account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p className="text-center text-zinc-500 text-sm mt-6">
          Don't have an account? <Link to="/register" className="text-brand-500 hover:text-brand-400">Create one</Link>
        </p>
        <div className="mt-6 p-4 bg-zinc-900 rounded-xl text-sm text-zinc-500">
          <p className="font-medium text-zinc-400 mb-1">Demo Accounts:</p>
          <p>Admin: admin@drivex.com</p>
          <p>Customer: customer@example.com</p>
          <p className="text-xs mt-1">(Run seed script to create demo users with passwords)</p>
        </div>
      </div>
    </div>
  );
}
