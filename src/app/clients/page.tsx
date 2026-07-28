'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, ShieldAlert, ShieldCheck, Key, Copy, Globe, RefreshCcw } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', domain: '', plan_id: '', sale_price: 0 });

  const fetchData = async () => {
    try {
      const [clientsRes, plansRes] = await Promise.all([
        api.get('/api/clients'),
        api.get('/api/plans')
      ]);
      setClients(clientsRes.data);
      setPlans(plansRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Auto-generate a secure random license key
      const licenseKey = 'TSMS-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      
      await api.post('/api/clients', {
        name: newClient.name,
        domain: newClient.domain,
        license_key: licenseKey,
        is_active: true,
        plan_id: newClient.plan_id ? parseInt(newClient.plan_id) : null,
        sale_price: newClient.sale_price
      });
      
      setShowAddModal(false);
      setNewClient({ name: '', domain: '', plan_id: '', sale_price: 0 });
      fetchData();
    } catch (error) {
      alert("Failed to add client. Check if domain already exists.");
      console.error(error);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.put(`/api/clients/${id}`, {
        is_active: !currentStatus
      });
      fetchClients();
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Client Management</h1>
          <p className="text-gray-400 mt-1">Manage TSMS installations and license keys.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 bg-[#1e1e1e] border border-[#333333] px-4 py-2 rounded-lg hover:bg-[#2a2a2a] text-yellow-500 text-sm font-medium transition-colors">
            <RefreshCcw size={16} /> <span className="hidden sm:inline">Refresh</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-bold text-sm"
          >
            <Plus size={18} /> Add Client
          </button>
        </div>
      </div>

      <div className="bg-[#1e1e1e] border border-[#333333] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#121212] border-b border-[#333333]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price (PKR)</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">License Key</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
          </thead>
          <tbody className="divide-y divide-[#333333] text-sm">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading clients...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No clients found. Add one above.</td></tr>
            ) : clients.map((client) => (
              <tr key={client.id} className="hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4 font-bold text-white">{client.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Globe size={14} className="text-gray-500" />
                    {client.domain}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {client.plan ? (
                    <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-md border border-yellow-500/20">{client.plan.name}</span>
                  ) : (
                    <span className="text-gray-500">None</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-300 font-medium">
                  Rs {Number(client.sale_price).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-mono text-gray-300 bg-[#121212] px-2 py-1 rounded inline-flex text-xs border border-[#333333]">
                    <Key size={12} className="text-gray-500" />
                    {client.license_key}
                    <button 
                      onClick={() => navigator.clipboard.writeText(client.license_key)} 
                      className="ml-2 text-gray-500 hover:text-yellow-500"
                      title="Copy Key"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    client.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {client.is_active ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    {client.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => toggleStatus(client.id, client.is_active)}
                    className={`text-sm font-bold ${client.is_active ? 'text-red-500 hover:text-red-400' : 'text-green-500 hover:text-green-400'}`}
                  >
                    {client.is_active ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#333333] flex justify-between items-center bg-[#121212]">
              <h3 className="font-bold text-white">Add New Client</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-300">&times;</button>
            </div>
            <form onSubmit={handleAddClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Business Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors"
                  placeholder="e.g. Playboy Salon"
                  value={newClient.name}
                  onChange={e => setNewClient({...newClient, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Domain URL</label>
                <input 
                  type="url" 
                  required
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors"
                  placeholder="https://client-domain.com"
                  value={newClient.domain}
                  onChange={e => setNewClient({...newClient, domain: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-2">The license key will be automatically generated.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Assigned Plan</label>
                <select 
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors"
                  value={newClient.plan_id}
                  onChange={e => {
                    const selectedPlan = plans.find(p => p.id === parseInt(e.target.value));
                    setNewClient({
                      ...newClient, 
                      plan_id: e.target.value,
                      sale_price: selectedPlan ? selectedPlan.price : newClient.sale_price
                    });
                  }}
                >
                  <option value="">No Plan</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Sale Price (PKR)</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors"
                  placeholder="0"
                  value={newClient.sale_price}
                  onChange={e => setNewClient({...newClient, sale_price: Number(e.target.value)})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors">Create Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
