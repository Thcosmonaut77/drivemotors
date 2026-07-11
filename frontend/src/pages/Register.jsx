import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password });
      toast.success('Account created!');
      navigate('/');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-zinc-500 text-center mb-8">Join DriveX Motors today</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">First Name</label>
              <input type="text" value={form.firstName} onChange={e => update('firstName', e.target.value)} className="input" required />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Last Name</label>
              <input type="text" value={form.lastName} onChange={e => update('lastName', e.target.value)} className="input" required />
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input" required />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="input" />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Password</label>
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)} className="input" required minLength={6} />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Confirm Password</label>
            <input type="password" value={form.confirm} onChange={e => update('confirm', e.target.value)} className="input" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="text-center text-zinc-500 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-brand-500 hover:text-brand-400">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
