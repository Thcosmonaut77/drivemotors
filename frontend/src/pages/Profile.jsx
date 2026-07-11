import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [tab, setTab] = useState('profile');

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile(form);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.message); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    try {
      await api.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('profile')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'profile' ? 'bg-brand-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Profile</button>
        <button onClick={() => setTab('password')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'password' ? 'bg-brand-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Password</button>
      </div>

      {tab === 'profile' && (
        <form onSubmit={updateProfile} className="space-y-4 card p-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm text-zinc-400 mb-1 block"><User className="w-4 h-4 inline mr-1" />First Name</label><input type="text" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="input" /></div>
            <div><label className="text-sm text-zinc-400 mb-1 block"><User className="w-4 h-4 inline mr-1" />Last Name</label><input type="text" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="input" /></div>
          </div>
          <div><label className="text-sm text-zinc-400 mb-1 block"><Mail className="w-4 h-4 inline mr-1" />Email</label><input type="email" value={user?.email} className="input bg-zinc-800" disabled /></div>
          <div><label className="text-sm text-zinc-400 mb-1 block"><Phone className="w-4 h-4 inline mr-1" />Phone</label><input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input" placeholder="Your phone number" /></div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={changePassword} className="space-y-4 card p-6">
          <div><label className="text-sm text-zinc-400 mb-1 block"><Lock className="w-4 h-4 inline mr-1" />Current Password</label><input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} className="input" required /></div>
          <div><label className="text-sm text-zinc-400 mb-1 block"><Lock className="w-4 h-4 inline mr-1" />New Password</label><input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} className="input" required minLength={6} /></div>
          <div><label className="text-sm text-zinc-400 mb-1 block"><Lock className="w-4 h-4 inline mr-1" />Confirm New Password</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} className="input" required /></div>
          <button type="submit" className="btn-primary">Change Password</button>
        </form>
      )}
    </div>
  );
}
