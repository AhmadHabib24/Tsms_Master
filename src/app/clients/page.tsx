'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, ShieldAlert, ShieldCheck, Key, Copy, Globe, RefreshCcw, Edit, Ban, CheckCircle, Trash2 } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ 
    name: '', 
    email: '',
    domain: '', 
    plan_id: '', 
    duration: '1_month',
    sale_price: 0 
  });

  const [editingClient, setEditingClient] = useState<any>(null);

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
      let expiresAt = null;
      if (newClient.duration === '1_month') expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      else if (newClient.duration === '6_months') expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
      else if (newClient.duration === '12_months') expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const payload = {
        name: newClient.name,
        email: newClient.email,
        domain: newClient.domain,
        plan_id: newClient.plan_id ? parseInt(newClient.plan_id) : null,
        sale_price: newClient.sale_price,
        plan_expires_at: expiresAt ? expiresAt.toISOString() : null,
      };

      if (editingClient) {
        await api.put(`/api/clients/${editingClient.id}`, payload);
      } else {
        // Auto-generate a secure random license key for new clients
        const licenseKey = 'TSMS-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
        await api.post('/api/clients', {
          ...payload,
          license_key: licenseKey,
          is_active: true,
          subscription_status: 'active'
        });
      }
      
      setShowAddModal(false);
      setEditingClient(null);
      setNewClient({ name: '', email: '', domain: '', plan_id: '', duration: '1_month', sale_price: 0 });
      fetchData();
    } catch (error) {
      alert("Failed to save client. Check if domain already exists.");
      console.error(error);
    }
  };

  const openEdit = (client: any) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      email: client.email || '',
      domain: client.domain,
      plan_id: client.plan_id ? client.plan_id.toString() : '',
      duration: '1_month', // Reset duration selection for update
      sale_price: client.sale_price || 0
    });
    setShowAddModal(true);
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.put(`/api/clients/${id}`, {
        is_active: !currentStatus
      });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteClient = async (id: number) => {
    if (confirm('Are you sure you want to permanently delete this client? This action cannot be undone.')) {
      try {
        await api.delete(`/api/clients/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete client', error);
      }
    }
  };

  const wipeClient = async (client: any) => {
    if (confirm(`WARNING: Are you absolutely sure you want to WIPE ${client.name}? This will permanently delete their source code and database files.`)) {
      try {
        await api.post(`/api/clients/${client.id}/wipe`);
        alert(`Wipe command successfully sent to ${client.name}.`);
        fetchData();
      } catch (error) {
        console.error('Failed to wipe client', error);
        alert('Failed to send wipe command.');
      }
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
            onClick={() => {
              setEditingClient(null);
              setNewClient({ name: '', email: '', domain: '', plan_id: '', duration: '1_month', sale_price: 0 });
              setShowAddModal(true);
            }}
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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan & Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price (PKR)</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">License Key</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Active</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
          </thead>
          <tbody className="divide-y divide-[#333333] text-sm">
            {loading ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-500">Loading clients...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-500">No clients found. Add one above.</td></tr>
            ) : clients.map((client) => (
              <tr key={client.id} className="hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4 font-bold text-white">{client.name}</td>
                <td className="px-6 py-4 text-gray-300">{client.email || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Globe size={14} className="text-gray-500" />
                    {client.domain}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {client.plan ? (
                    <div className="flex flex-col gap-1">
                      <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-md border border-yellow-500/20 w-fit">{client.plan.name}</span>
                      {client.plan_expires_at && (
                        <span className="text-xs text-gray-500">Exp: {new Date(client.plan_expires_at).toLocaleDateString()}</span>
                      )}
                    </div>
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
                    <div className="flex items-center justify-end gap-2">
                      <a 
                        href={`/clients/${client.id}/agreement`} 
                        target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] border border-[#333333] rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-yellow-500 hover:border-yellow-500 hover:text-black transition-colors"
                        title="Welcome Card"
                      >
                        Docs
                      </a>
                      <a 
                        href={`/clients/${client.id}/user-guide`} 
                        target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] border border-[#333333] rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-yellow-500 hover:border-yellow-500 hover:text-black transition-colors"
                        title="User Guide"
                      >
                        Guide
                      </a>
                    <button 
                      onClick={() => openEdit(client)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] border border-[#333333] rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[#333333] transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => toggleStatus(client.id, client.is_active)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] border border-[#333333] rounded-lg text-sm font-medium transition-colors ${client.is_active ? 'text-red-400 hover:bg-red-500/10 hover:border-red-500/30' : 'text-green-400 hover:bg-green-500/10 hover:border-green-500/30'}`}
                    >
                      {client.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
                    </button>
                    <button 
                      onClick={() => wipeClient(client)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/20 border border-red-500/30 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      title="WIPE CLIENT SERVER"
                    >
                      <ShieldAlert size={14} /> WIPE
                    </button>
                    <button 
                      onClick={() => deleteClient(client.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] border border-[#333333] rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                      title="Delete Client"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#333333] flex justify-between items-center bg-[#121212] sticky top-0 z-10">
              <h3 className="font-bold text-white">{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Client Email</label>
                <input 
                  type="email" 
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors"
                  placeholder="client@example.com"
                  value={newClient.email}
                  onChange={e => setNewClient({...newClient, email: e.target.value})}
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
                    let price = 0;
                    if (selectedPlan) {
                      if (newClient.duration === '1_month') price = selectedPlan.monthly_price;
                      if (newClient.duration === '6_months') price = selectedPlan.six_months_price;
                      if (newClient.duration === '12_months') price = selectedPlan.twelve_months_price;
                    }
                    setNewClient({
                      ...newClient, 
                      plan_id: e.target.value,
                      sale_price: price
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
                <select 
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors"
                  value={newClient.duration}
                  onChange={e => {
                    const dur = e.target.value;
                    const selectedPlan = plans.find(p => p.id === parseInt(newClient.plan_id));
                    let price = newClient.sale_price;
                    if (selectedPlan) {
                      if (dur === '1_month') price = selectedPlan.monthly_price;
                      if (dur === '6_months') price = selectedPlan.six_months_price;
                      if (dur === '12_months') price = selectedPlan.twelve_months_price;
                    }
                    setNewClient({ ...newClient, duration: dur, sale_price: price });
                  }}
                >
                  <option value="1_month">1 Month</option>
                  <option value="6_months">6 Months</option>
                  <option value="12_months">12 Months</option>
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
                <button type="submit" className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors">
                  {editingClient ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
