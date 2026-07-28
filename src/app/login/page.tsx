'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#1e1e1e] border border-[#333333] rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center font-bold text-black text-2xl mx-auto mb-4">T</div>
        <h1 className="text-2xl font-bold text-white">Master Server Login</h1>
        <p className="text-gray-400 mt-2 text-sm">Sign in to manage TSMS licenses</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
          <input 
            type="email" 
            required
            className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500 transition-colors"
            placeholder="admin@tsms.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
          <input 
            type="password" 
            required
            className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500 transition-colors"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-yellow-500 hover:text-yellow-400 font-medium">
            Forgot Password?
          </Link>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-2.5 rounded-lg font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
