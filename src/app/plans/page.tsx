'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Package, Plus, Edit, Trash2, RefreshCcw } from 'lucide-react';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', price: 0 });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/plans');
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
        await api.put(`/api/plans/${editingPlan.id}`, formData);
      } else {
        await api.post('/api/plans', formData);
      }
      setShowAddModal(false);
      setEditingPlan(null);
      setFormData({ name: '', description: '', price: 0 });
      fetchPlans();
    } catch (error) {
      alert("Failed to save plan.");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await api.delete(`/api/plans/${id}`);
      fetchPlans();
    } catch (error) {
      alert("Failed to delete plan. It might be in use by clients.");
    }
  };

  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({ name: plan.name, description: plan.description || '', price: plan.price });
    setShowAddModal(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Subscription Plans</h1>
          <p className="text-gray-400 mt-1">Manage pricing tiers and module access limits.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchPlans} className="bg-[#1e1e1e] border border-[#333333] p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors">
            <RefreshCcw size={20} className="text-gray-400" />
          </button>
          <button 
            onClick={() => {
              setEditingPlan(null);
              setFormData({ name: '', description: '', price: 0 });
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-bold text-sm w-full sm:w-auto"
          >
            <Plus size={18} /> Add Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No plans found. Add one above.</div>
        ) : plans.map((plan) => (
          <div key={plan.id} className="bg-[#1e1e1e] border border-[#333333] rounded-2xl p-6 flex flex-col relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(plan)} className="p-1.5 bg-[#2a2a2a] rounded text-gray-400 hover:text-white"><Edit size={14} /></button>
              <button onClick={() => handleDelete(plan.id)} className="p-1.5 bg-[#2a2a2a] rounded text-red-500 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
            
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 mb-4">
              <Package size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-sm text-gray-400 mb-6 flex-1">{plan.description}</p>
            
            <div className="pt-4 border-t border-[#333333]">
              <p className="text-sm text-gray-500">Suggested Price</p>
              <p className="text-2xl font-bold text-yellow-500">Rs {Number(plan.price).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#333333] flex justify-between items-center bg-[#121212]">
              <h3 className="font-bold text-white">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-300">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Plan Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors"
                  placeholder="e.g. Enterprise"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Suggested Price (PKR)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors"
                  placeholder="0"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description (Features)</label>
                <textarea 
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors resize-none"
                  placeholder="List of features included..."
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
