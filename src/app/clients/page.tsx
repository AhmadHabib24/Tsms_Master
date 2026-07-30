'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, ShieldAlert, ShieldCheck, Key, Copy, Globe, RefreshCcw, Edit, Ban, CheckCircle, Trash2, Database, FileText, Book } from 'lucide-react';

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
  
  const [showResetModal, setShowResetModal] = useState(false);
  const [resettingClient, setResettingClient] = useState<any>(null);
  const [superAdminPassword, setSuperAdminPassword] = useState('');

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

  const handleResetData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingClient || !superAdminPassword) return;
    
    try {
      await api.post(`/api/clients/${resettingClient.id}/reset-data`, {
        password: superAdminPassword
      });
      alert(`Data reset successfully for ${resettingClient.name}.`);
      setShowResetModal(false);
      setResettingClient(null);
      setSuperAdminPassword('');
    } catch (error: any) {
      console.error('Failed to reset data', error);
      alert(error.response?.data?.error || 'Failed to verify password or reset data.');
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-gray-500 bg-[#1e1e1e] rounded-2xl border border-[#333333]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 bg-[#1e1e1e] rounded-2xl border border-[#333333]">
            No clients found. Add one above.
          </div>
        ) : clients.map((client) => (
          <div key={client.id} className="bg-[#1e1e1e] border border-[#333333] rounded-2xl shadow-lg hover:border-yellow-500/30 transition-all duration-300 flex flex-col group overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#333333] flex justify-between items-start bg-gradient-to-br from-[#222] to-[#1a1a1a]">
              <div>
                <h3 className="font-bold text-lg text-white group-hover:text-yellow-500 transition-colors">{client.name}</h3>
                {client.plan ? (
                  <span className="inline-block mt-1.5 bg-yellow-500/10 text-yellow-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">{client.plan.name}</span>
                ) : (
                  <span className="inline-block mt-1.5 text-xs text-gray-500 uppercase tracking-wider">No Plan</span>
                )}
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                client.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {client.is_active ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                {client.is_active ? 'Active' : 'Suspended'}
              </span>
            </div>
            
            {/* Body */}
            <div className="p-5 space-y-4 text-sm flex-grow">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 rounded bg-[#2a2a2a] flex items-center justify-center text-gray-500 shrink-0">
                    <Globe size={12} />
                  </div>
                  <a href={client.domain} target="_blank" className="truncate hover:text-yellow-500 transition-colors font-medium">{client.domain}</a>
                </div>
                {client.email && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-6 h-6 rounded bg-[#2a2a2a] flex items-center justify-center text-gray-500 shrink-0 font-bold text-[10px]">
                      @
                    </div>
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <div className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">License Key</div>
                <div className="flex items-center justify-between bg-[#121212] px-3 py-2.5 rounded-xl border border-[#333333]">
                  <span className="font-mono text-gray-300 text-xs truncate mr-2 select-all">{client.license_key}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(client.license_key)} 
                    className="text-gray-500 hover:text-yellow-500 shrink-0 bg-[#222] hover:bg-[#333] p-1.5 rounded-md transition-colors"
                    title="Copy Key"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
              
              <div className="pt-2 border-t border-[#333333] grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Sale Price</div>
                  <div className="text-gray-300 font-bold">Rs {Number(client.sale_price).toLocaleString()}</div>
                </div>
                {client.plan_expires_at && (
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Expires On</div>
                    <div className="text-gray-300 font-medium">{new Date(client.plan_expires_at).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-[#333333] bg-black/40 flex flex-wrap gap-2 justify-center">
              <a 
                href={`/clients/${client.id}/agreement`} 
                target="_blank"
                className="flex items-center justify-center w-8 h-8 bg-[#2a2a2a] border border-[#333333] rounded-lg text-gray-400 hover:text-black hover:bg-yellow-500 hover:border-yellow-500 transition-all hover:-translate-y-0.5"
                title="Welcome Card (Docs)"
              >
                <FileText size={14} />
              </a>
              <a 
                href={`/clients/${client.id}/user-guide`} 
                target="_blank"
                className="flex items-center justify-center w-8 h-8 bg-[#2a2a2a] border border-[#333333] rounded-lg text-gray-400 hover:text-black hover:bg-yellow-500 hover:border-yellow-500 transition-all hover:-translate-y-0.5"
                title="User Guide"
              >
                <Book size={14} />
              </a>
              <div className="w-px h-8 bg-[#333] mx-1"></div>
              <button 
                onClick={() => openEdit(client)}
                className="flex items-center justify-center w-8 h-8 bg-[#2a2a2a] border border-[#333333] rounded-lg text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all hover:-translate-y-0.5"
                title="Edit Client"
              >
                <Edit size={14} />
              </button>
              <button 
                onClick={() => toggleStatus(client.id, client.is_active)}
                className={`flex items-center justify-center w-8 h-8 bg-[#2a2a2a] border border-[#333333] rounded-lg transition-all hover:-translate-y-0.5 ${client.is_active ? 'text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500' : 'text-green-400 hover:bg-green-500 hover:text-white hover:border-green-500'}`}
                title={client.is_active ? "Suspend Client" : "Activate Client"}
              >
                {client.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
              </button>
              <div className="w-px h-8 bg-[#333] mx-1"></div>
              <button 
                onClick={() => {
                  setResettingClient(client);
                  setSuperAdminPassword('');
                  setShowResetModal(true);
                }}
                className="flex items-center justify-center w-8 h-8 bg-[#2a2a2a] border border-[#333333] rounded-lg text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all hover:-translate-y-0.5"
                title="Reset Client Data"
              >
                <Database size={14} />
              </button>
              <button 
                onClick={() => wipeClient(client)}
                className="flex items-center justify-center w-8 h-8 bg-[#2a2a2a] border border-[#333333] rounded-lg text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all hover:-translate-y-0.5"
                title="WIPE CLIENT SERVER"
              >
                <ShieldAlert size={14} />
              </button>
              <button 
                onClick={() => deleteClient(client.id)}
                className="flex items-center justify-center w-8 h-8 bg-[#2a2a2a] border border-[#333333] rounded-lg text-red-900 hover:bg-red-900 hover:text-white hover:border-red-900 transition-all hover:-translate-y-0.5"
                title="Delete Client"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
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

      {showResetModal && resettingClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-red-500/30 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#333333] flex justify-between items-center bg-red-900/10">
              <h3 className="font-bold text-red-500 flex items-center gap-2">
                <ShieldAlert size={20} /> Reset Client Data
              </h3>
              <button onClick={() => setShowResetModal(false)} className="text-gray-500 hover:text-gray-300">&times;</button>
            </div>
            <form onSubmit={handleResetData} className="p-6 space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                <p className="text-sm text-red-400">
                  <strong className="text-red-500 uppercase tracking-wider block mb-1">Warning: Irreversible Action</strong>
                  You are about to permanently delete all transactional data (customers, employees, bills, services, inventory, etc.) for <strong className="text-white">{resettingClient.name}</strong>. Only the primary admin user and core settings will be retained.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Super Admin Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-red-500 transition-colors"
                  placeholder="Enter your password to confirm"
                  value={superAdminPassword}
                  onChange={e => setSuperAdminPassword(e.target.value)}
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowResetModal(false)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">
                  Confirm & Reset Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
