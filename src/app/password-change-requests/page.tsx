'use client';
import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function PasswordChangeRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/api/password-change-requests');
      setRequests(res.data);
    } catch (e) {
      toast.error('Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResolve = async (id: number) => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      await api.post(`/api/password-change-requests/${id}/resolve`, {
        new_password: newPassword
      });
      toast.success('Password updated successfully on client server');
      setResolvingId(null);
      setNewPassword('');
      fetchRequests();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to resolve request');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-[#333333] pb-4">
        <ShieldAlert className="text-yellow-500" size={32} />
        <h1 className="text-3xl font-bold">Password Change Requests</h1>
      </div>

      <div className="bg-[#1e1e1e] border border-[#333333] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No pending password change requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#121212] border-b border-[#333333]">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400">Client / Salon</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400">User Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400">Date Requested</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#252525] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{req.client?.name}</div>
                      <div className="text-xs text-gray-500">{req.client?.domain}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{req.user_email}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(req.created_at).toLocaleDateString()} {new Date(req.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      {req.status === 'pending' ? (
                        <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full text-xs font-bold w-fit">
                          <Clock size={12} /> Pending
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-xs font-bold w-fit">
                          <CheckCircle size={12} /> Resolved
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' ? (
                        resolvingId === req.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="text"
                              placeholder="New Password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="bg-[#121212] border border-[#333333] rounded px-3 py-1.5 text-sm outline-none focus:border-yellow-500 w-40 text-white"
                            />
                            <button
                              onClick={() => handleResolve(req.id)}
                              className="bg-yellow-500 text-black px-3 py-1.5 rounded font-bold text-sm hover:bg-yellow-600 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => {
                                setResolvingId(null);
                                setNewPassword('');
                              }}
                              className="bg-gray-700 text-white px-3 py-1.5 rounded font-bold text-sm hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setResolvingId(req.id)}
                            className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-yellow-500 hover:text-black transition-colors"
                          >
                            Resolve
                          </button>
                        )
                      ) : (
                        <span className="text-sm text-gray-500">
                          {new Date(req.resolved_at).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
