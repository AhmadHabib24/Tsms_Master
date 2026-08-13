'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    bank_name: '',
    account_title: '',
    account_number: '',
    gemini_api_key: ''
  });
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings');
      setSettings({
        bank_name: res.data.bank_name || '',
        account_title: res.data.account_title || '',
        account_number: res.data.account_number || '',
        gemini_api_key: res.data.gemini_api_key || '',
      });
      if (res.data.qr_image_path) {
        setQrPreview(`${process.env.NEXT_PUBLIC_API_URL || ''}/storage/${res.data.qr_image_path}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('bank_name', settings.bank_name);
      formData.append('account_title', settings.account_title);
      formData.append('account_number', settings.account_number);
      formData.append('gemini_api_key', settings.gemini_api_key);
      if (qrImage) {
        formData.append('qr_image', qrImage);
      }

      await api.post('/api/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Settings saved successfully');
      fetchSettings();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) return <div className="p-8 text-white">Loading settings...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Master Settings</h1>
        <p className="text-gray-400 mt-1">Configure global application settings and payment details.</p>
      </div>

      <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-2">Global API Integrations</h2>
        <p className="text-sm text-gray-400 mb-6 pb-6 border-b border-[#333333]">
          Configure API keys used across the entire master and tenant system.
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Gemini API Key (Google AI)</label>
            <input 
              type="password" 
              name="gemini_api_key"
              className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg px-4, py-3 outline-none focus:border-[var(--color-gold)] transition-colors font-mono"
              placeholder="AIzaSy..."
              value={settings.gemini_api_key}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-2">This key will power all AI Chatbots for the tenants. Ensure billing is enabled in Google Cloud Console.</p>
          </div>
        </div>
      </div>

      <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl overflow-hidden">
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          
          <div>
            <h2 className="text-xl font-bold text-white mb-4 border-b border-[#333333] pb-2">Manual Payment Details (QR & Bank)</h2>
            <p className="text-sm text-gray-400 mb-6">These details will be shown to tenants when they purchase Addon packages manually.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bank / Wallet Name</label>
                  <input
                    type="text"
                    name="bank_name"
                    value={settings.bank_name}
                    onChange={handleChange}
                    placeholder="e.g. Meezan Bank, Easypaisa"
                    className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg p-3 focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Account Title</label>
                  <input
                    type="text"
                    name="account_title"
                    value={settings.account_title}
                    onChange={handleChange}
                    placeholder="e.g. TSMS Solutions"
                    className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg p-3 focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Account Number</label>
                  <input
                    type="text"
                    name="account_number"
                    value={settings.account_number}
                    onChange={handleChange}
                    placeholder="e.g. 01234567891234"
                    className="w-full bg-[#121212] border border-[#333333] text-white rounded-lg p-3 focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">QR Code Image</label>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#333333] border-dashed rounded-xl cursor-pointer hover:bg-[#252525] transition-colors relative overflow-hidden group">
                  {qrImage ? (
                    <img src={URL.createObjectURL(qrImage)} alt="Preview" className="w-full h-full object-contain" />
                  ) : qrPreview ? (
                    <img src={qrPreview} alt="Current QR" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload size={24} className="text-gray-500 mb-2 group-hover:text-[var(--color-gold)] transition-colors" />
                      <p className="text-sm text-gray-400"><span className="font-semibold">Click to upload</span></p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-bold text-sm">Change Image</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setQrImage(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#333333]">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--color-gold)] text-black px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
