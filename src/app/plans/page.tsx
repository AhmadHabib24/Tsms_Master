'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Package, Plus, Edit, Trash2, RefreshCcw } from 'lucide-react';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  const defaultFeatures = {
    billing: true,
    customers: true,
    services: true,
    employees: true,
    inventory: false,
    users: false,
    roles: false,
    reports: true,
    finance: false,
    settings: true,
    report_pnl: true,
    report_sales: true,
    report_inventory: false,
    report_staff: false,
    report_bills: true,
    report_discounts: false,
    report_udhar: false,
    packages: false,
    deals: false,
    promo_codes: false,
    groom_customers: false,
  };

  const defaultFormData = { 
    name: '', 
    description: '', 
    monthly_price: 0, 
    monthly_discount: 0,
    six_months_price: 0, 
    six_months_discount: 0,
    twelve_months_price: 0, 
    twelve_months_discount: 0,
    max_branches: 1, 
    max_staff_accounts: 5, 
    features: defaultFeatures 
  };

  const [formData, setFormData] = useState(defaultFormData);
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
      setFormData(defaultFormData);
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
    
    const cleanedFeatures: Record<string, boolean> = { ...defaultFeatures };
    if (plan.features) {
      Object.keys(defaultFeatures).forEach(key => {
        if (plan.features[key] !== undefined) {
          cleanedFeatures[key] = !!plan.features[key];
        }
      });
    }

    setFormData({ 
      name: plan.name, 
      description: plan.description || '', 
      monthly_price: plan.monthly_price || 0,
      monthly_discount: plan.monthly_discount || 0,
      six_months_price: plan.six_months_price || 0,
      six_months_discount: plan.six_months_discount || 0,
      twelve_months_price: plan.twelve_months_price || 0,
      twelve_months_discount: plan.twelve_months_discount || 0,
      max_branches: plan.max_branches || 1,
      max_staff_accounts: plan.max_staff_accounts || 5,
      features: cleanedFeatures as typeof defaultFeatures
    });
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
              setFormData(defaultFormData);
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
                <span className="text-gray-500">Limits</span>
                <span className="text-gray-400">{plan.max_branches === -1 ? 'Unlimited' : plan.max_branches} Branches / {plan.max_staff_accounts === -1 ? 'Unlimited' : plan.max_staff_accounts} Staff</span>
              </div>
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Description (Features)</label>
                <textarea 
                  className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors resize-none"
                  placeholder="List of features included..."
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">1 Month Price</label>
                  <input type="number" required min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors" value={formData.monthly_price} onChange={e => setFormData({...formData, monthly_price: Number(e.target.value)})} />
                  <label className="block text-xs font-medium text-gray-500 mt-2 mb-1">1 Month Discount</label>
                  <input type="number" min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-1.5 outline-none focus:border-yellow-500 transition-colors text-sm" value={formData.monthly_discount} onChange={e => setFormData({...formData, monthly_discount: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">6 Months Price</label>
                  <input type="number" required min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors" value={formData.six_months_price} onChange={e => setFormData({...formData, six_months_price: Number(e.target.value)})} />
                  <label className="block text-xs font-medium text-gray-500 mt-2 mb-1">6 Months Discount</label>
                  <input type="number" min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-1.5 outline-none focus:border-yellow-500 transition-colors text-sm" value={formData.six_months_discount} onChange={e => setFormData({...formData, six_months_discount: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">12 Months Price</label>
                  <input type="number" required min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors" value={formData.twelve_months_price} onChange={e => setFormData({...formData, twelve_months_price: Number(e.target.value)})} />
                  <label className="block text-xs font-medium text-gray-500 mt-2 mb-1">12 Months Discount</label>
                  <input type="number" min="0" className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-1.5 outline-none focus:border-yellow-500 transition-colors text-sm" value={formData.twelve_months_discount} onChange={e => setFormData({...formData, twelve_months_discount: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Max Branches (-1 for unlimited)</label>
                  <input type="number" required className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors" value={formData.max_branches} onChange={e => setFormData({...formData, max_branches: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Max Staff (-1 for unlimited)</label>
                  <input type="number" required className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-3 py-2 outline-none focus:border-yellow-500 transition-colors" value={formData.max_staff_accounts} onChange={e => setFormData({...formData, max_staff_accounts: Number(e.target.value)})} />
                </div>
              </div>

              <div className="border-t border-[#333333] pt-4">
                <h4 className="text-white font-bold mb-2">Feature Flags</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  {Object.keys(defaultFeatures).map((key) => (
                    <label key={key} className="flex items-center gap-2">
                      <input type="checkbox" checked={!!(formData.features as any)[key]} onChange={(e) => setFormData({...formData, features: {...formData.features, [key]: e.target.checked}})} className="rounded border-[#333333] bg-[#121212]" />
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-[#1e1e1e] pb-2">
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
