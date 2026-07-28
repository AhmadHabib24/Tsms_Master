'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    try {
      const res = await api.post('/api/forgot-password', { email });
      setMsg(res.data.message || 'Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#1e1e1e] border border-[#333333] rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <p className="text-gray-400 mt-2 text-sm">Enter your email to receive a reset link</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
          {error}
        </div>
      )}
      {msg && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg text-sm mb-6 text-center">
          {msg}
        </div>
      )}

      <form onSubmit={handleForgot} className="space-y-5">
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

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-2.5 rounded-lg font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
}
