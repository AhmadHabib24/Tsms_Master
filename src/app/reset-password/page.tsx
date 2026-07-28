'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link.');
    }
  }, [token, email]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) return;
    
    setLoading(true);
    setError('');
    setMsg('');

    try {
      const res = await api.post('/api/reset-password', { 
        token, 
        email, 
        password, 
        password_confirmation: passwordConfirmation 
      });
      setMsg('Password has been successfully reset. You can now login.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#1e1e1e] border border-[#333333] rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">New Password</h1>
        <p className="text-gray-400 mt-2 text-sm">Enter your new secure password</p>
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

      <form onSubmit={handleReset} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
          <input 
            type="password" 
            required
            className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500 transition-colors"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
          <input 
            type="password" 
            required
            className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-4 py-2.5 outline-none focus:border-yellow-500 transition-colors"
            placeholder="••••••••"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !token || !email}
          className="w-full bg-yellow-500 text-black py-2.5 rounded-lg font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
