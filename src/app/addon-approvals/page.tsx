'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Check, X, RefreshCcw, Eye, Blocks, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddonApprovalsPage() {
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{id: number, action: 'approve' | 'reject' | 'revoke'} | null>(null);

  const fetchAddons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/client-addons');
      setAddons(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'revoke') => {
    try {
      await api.post(`/api/client-addons/${id}/${action}`);
      toast.success(`Addon ${action}d successfully`);
      fetchAddons();
      setConfirmDialog(null);
    } catch (error) {
      toast.error(`Failed to ${action} addon.`);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Addon Approvals</h1>
          <p className="text-gray-400 mt-1">Review and approve tenant addon purchases.</p>
        </div>
        <button onClick={fetchAddons} className="bg-[#1e1e1e] border border-[#333333] p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors w-fit">
          <RefreshCcw size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#121212] text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 border-b border-[#333333]">Client</th>
                <th className="p-4 border-b border-[#333333]">Addon</th>
                <th className="p-4 border-b border-[#333333]">Interval / Price</th>
                <th className="p-4 border-b border-[#333333]">Payment Method</th>
                <th className="p-4 border-b border-[#333333]">Proof</th>
                <th className="p-4 border-b border-[#333333]">Status</th>
                <th className="p-4 border-b border-[#333333] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : addons.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No addon purchases found.</td></tr>
              ) : addons.map((addon) => (
                <tr key={addon.id} className="hover:bg-[#252525] transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white">{addon.client?.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{addon.client?.domain}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-yellow-500/10 rounded flex items-center justify-center text-yellow-500">
                        <Blocks size={16} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{addon.addon_plan?.name}</p>
                        <p className="text-xs text-gray-500">{addon.addon_plan?.identifier}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-white capitalize">{addon.interval ? addon.interval.replace('_', ' ') : '-'}</p>
                    <p className="text-sm text-yellow-500 font-bold">Rs {Number(addon.price_paid || 0).toLocaleString()}</p>
                  </td>
                  <td className="p-4 text-gray-300 capitalize">
                    {addon.payment_method ? addon.payment_method.replace('_', ' ') : '-'}
                  </td>
                  <td className="p-4">
                    {addon.payment_proof_path ? (
                      <button 
                        onClick={() => setSelectedProof(`${process.env.NEXT_PUBLIC_API_URL || ''}/storage/${addon.payment_proof_path}`)}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye size={16} /> View
                      </button>
                    ) : (
                      <span className="text-gray-600 text-sm italic">No proof</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      addon.status === 'active' ? 'bg-green-500/20 text-green-500' :
                      addon.status === 'pending_approval' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {addon.status ? addon.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {addon.status === 'pending_approval' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setConfirmDialog({ id: addon.id, action: 'approve' })} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors" title="Approve">
                          <Check size={18} />
                        </button>
                        <button onClick={() => setConfirmDialog({ id: addon.id, action: 'reject' })} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors" title="Reject">
                          <X size={18} />
                        </button>
                      </div>
                    ) : addon.status === 'active' ? (
                      <button onClick={() => setConfirmDialog({ id: addon.id, action: 'revoke' })} className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-bold">
                        Revoke
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProof && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedProof(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProof(null)} className="absolute -top-12 right-0 text-white hover:text-gray-300">
              <X size={32} />
            </button>
            <img src={selectedProof} alt="Payment Proof" className="w-full h-full object-contain rounded-lg" />
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 space-y-6">
            <div className="mx-auto w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2 capitalize">Confirm {confirmDialog.action}</h3>
              <p className="text-sm text-gray-400">Are you sure you want to {confirmDialog.action} this addon? This action cannot be easily undone.</p>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setConfirmDialog(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white bg-[#2a2a2a] hover:bg-[#333333] transition-colors">
                Cancel
              </button>
              <button onClick={() => handleAction(confirmDialog.id, confirmDialog.action)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
