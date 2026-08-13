'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Edit, Trash2, RefreshCcw, Blocks, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddonPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);
  
  const defaultFormData = { 
    name: '', 
    identifier: '',
    description: '', 
    monthly_price: 0, 
    monthly_discount: 0,
    six_months_price: 0, 
    six_months_discount: 0,
    twelve_months_price: 0, 
    twelve_months_discount: 0,
    status: true
  };

  const [formData, setFormData] = useState(defaultFormData);
  
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/addon-plans');
      setPlans(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.put(`/api/addon-plans/${editingPlan.id}`, formData);
      } else {
        await api.post('/api/addon-plans', formData);
      }
      setShowAddModal(false);
      setEditingPlan(null);
      setFormData(defaultFormData);
      fetchPlans();
      toast.success('Addon package saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save addon plan.");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/addon-plans/${id}`);
      fetchPlans();
      setDeleteDialog(null);
      toast.success('Addon package deleted successfully');
    } catch (error) {
      toast.error("Failed to delete addon plan. It might be in use by clients.");
    }
  };

  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({ 
      name: plan.name,
      identifier: plan.identifier,
      description: plan.description || '', 
      monthly_price: plan.monthly_price || 0,
      monthly_discount: plan.monthly_discount || 0,
      six_months_price: plan.six_months_price || 0,
      six_months_discount: plan.six_months_discount || 0,
      twelve_months_price: plan.twelve_months_price || 0,
      twelve_months_discount: plan.twelve_months_discount || 0,
      status: plan.status !== undefined ? plan.status : true
    });
    setShowAddModal(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Addon Packages</h1>
          <p className="text-gray-400 mt-1">Manage extra features like Booking Pages, AI Chatbots, etc.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchPlans} className="bg-[#1e1e1e] border border-[#333333] p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors">
            <RefreshCcw size={20} className="text-gray-400" />
          </button>
          <button 
            onClick={() => {
              setEditingPlan(null);
              setFormData(defaultFormData);
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-bold text-sm w-full sm:w-auto"
          >
            <Plus size={18} /> Add Package
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading addon plans...</div>
        ) : plans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No addon packages found. Add one above.</div>
        ) : plans.map((plan) => (
          <div key={plan.id} className="bg-[#1e1e1e] border border-[#333333] rounded-2xl p-6 flex flex-col relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(plan)} className="p-1.5 bg-[#2a2a2a] rounded text-gray-400 hover:text-white"><Edit size={14} /></button>
              <button onClick={() => setDeleteDialog(plan.id)} className="p-1.5 bg-[#2a2a2a] rounded text-red-500 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
            
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 mb-4">
              <Blocks size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-xs text-gray-500 font-mono mb-2">ID: {plan.identifier}</p>
            <p className="text-sm text-gray-400 mb-6 flex-1">{plan.description}</p>
            
            <div className="pt-4 border-t border-[#333333] space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Monthly</span>
                <span className="font-bold text-yellow-500">Rs {Number(plan.monthly_price).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">6 Months</span>
                <div className="flex items-center gap-2">
                  {plan.monthly_price > 0 && plan.six_months_price < (plan.monthly_price * 6) && (
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">
                      {Math.round((1 - plan.six_months_price / (plan.monthly_price * 6)) * 100)}% Off
                    </span>
                  )}
                  <span className="font-bold text-yellow-500">Rs {Number(plan.six_months_price).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">12 Months</span>
                <div className="flex items-center gap-2">
                  {plan.monthly_price > 0 && plan.twelve_months_price < (plan.monthly_price * 12) && (
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">
                      {Math.round((1 - plan.twelve_months_price / (plan.monthly_price * 12)) * 100)}% Off
                    </span>
                  )}
                  <span className="font-bold text-yellow-500">Rs {Number(plan.twelve_months_price).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-[#333333]/50">
                <span className="text-gray-500">Status</span>
                <span className={`font-bold ${plan.status ? 'text-green-500' : 'text-red-500'}`}>{plan.status ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#333333] flex justify-between items-center bg-[#121212]">
              <h3 className="font-bold text-white">{editingPlan ? 'Edit Addon Package' : 'Add New Addon Package'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-300">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Package Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors"
                  placeholder="e.g. AI Chatbot"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Identifier (used in code)</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors font-mono text-sm"
                  placeholder="e.g. ai_chatbot"
                  value={formData.identifier}
                  onChange={e => setFormData({...formData, identifier: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Must be unique, lowercase, no spaces (use underscores).</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea 
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors resize-none"
                  placeholder="Describe this addon..."
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">1 Month Price</label>
                  <input type="number" required min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors" value={formData.monthly_price} onChange={e => setFormData({...formData, monthly_price: Number(e.target.value)})} />
                  <label className="block text-xs font-medium text-gray-500 mt-2 mb-1">Discount</label>
                  <input type="number" min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-1.5 outline-none focus:border-yellow-500 transition-colors text-sm" value={formData.monthly_discount} onChange={e => setFormData({...formData, monthly_discount: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">6 Months Price</label>
                  <input type="number" required min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors" value={formData.six_months_price} onChange={e => setFormData({...formData, six_months_price: Number(e.target.value)})} />
                  <label className="block text-xs font-medium text-gray-500 mt-2 mb-1">Discount</label>
                  <input type="number" min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-1.5 outline-none focus:border-yellow-500 transition-colors text-sm" value={formData.six_months_discount} onChange={e => setFormData({...formData, six_months_discount: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">12 Months Price</label>
                  <input type="number" required min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors" value={formData.twelve_months_price} onChange={e => setFormData({...formData, twelve_months_price: Number(e.target.value)})} />
                  <label className="block text-xs font-medium text-gray-500 mt-2 mb-1">Discount</label>
                  <input type="number" min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-1.5 outline-none focus:border-yellow-500 transition-colors text-sm" value={formData.twelve_months_discount} onChange={e => setFormData({...formData, twelve_months_discount: Number(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mt-4 text-sm font-medium text-gray-400">
                  <input 
                    type="checkbox" 
                    checked={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.checked})} 
                    className="rounded border-[#333333] bg-[#121212] accent-yellow-500"
                  />
                  Active (visible to customers)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-[#1e1e1e] pb-2 mt-4 border-t border-[#333333]">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors">
                  {editingPlan ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Package</h3>
              <p className="text-sm text-gray-400">Are you sure you want to delete this addon package? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setDeleteDialog(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white bg-[#2a2a2a] hover:bg-[#333333] transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteDialog)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
