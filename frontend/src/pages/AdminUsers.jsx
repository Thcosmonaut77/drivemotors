import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, User } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.admin.getUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false)); }, []);

  const roleColor = { admin: 'bg-brand-500/20 text-brand-400', customer: 'bg-blue-500/20 text-blue-400' };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Users</h1>
      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
              {u.role === 'admin' ? <Shield className="w-5 h-5 text-brand-400" /> : <User className="w-5 h-5 text-zinc-400" />}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{u.first_name} {u.last_name}</h3>
              <p className="text-zinc-500 text-sm">{u.email} {u.phone && `| ${u.phone}`}</p>
            </div>
            <span className={`badge ${roleColor[u.role] || ''}`}>{u.role}</span>
            <span className="text-zinc-600 text-xs">{new Date(u.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
