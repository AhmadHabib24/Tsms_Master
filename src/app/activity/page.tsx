'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Activity, RefreshCcw, Clock } from 'lucide-react';

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      // Re-using the dashboard endpoint for simplicity, but ideally we'd have a paginated /api/activity endpoint.
      const res = await api.get('/api/dashboard/stats');
      setLogs(res.data.recent_activity);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Activity Logs</h1>
          <p className="text-gray-400 mt-1">Real-time telemetry and audit trail from all connected TSMS instances.</p>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-2 bg-[#1e1e1e] border border-[#333333] px-4 py-2 rounded-lg hover:bg-[#2a2a2a] text-yellow-500 text-sm font-medium transition-colors w-full sm:w-auto justify-center">
          <RefreshCcw size={16} /> <span className="hidden sm:inline">Refresh Logs</span>
          <span className="sm:hidden">Refresh</span>
        </button>
      </div>

      <div className="bg-[#1e1e1e] border border-[#333333] rounded-xl shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading activity feed...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center">
            <Activity size={32} className="mb-3 opacity-50" />
            No telemetry data has been received yet.
          </div>
        ) : (
          <div className="space-y-8">
            {logs.map((log: any) => (
              <div key={log.id} className="flex gap-4 relative group">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0 z-10 outline outline-4 outline-[#1e1e1e] group-hover:scale-125 transition-transform" />
                <div className="absolute top-4 bottom-[-32px] left-[5px] w-[2px] bg-[#333333] last:hidden" />
                <div className="bg-[#121212] border border-[#333333] rounded-xl p-4 flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-white">{log.client?.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1e1e1e] px-2 py-1 rounded border border-[#333333]">
                      <Clock size={12} />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{log.action}</p>
                  {log.description && <p className="text-gray-500 text-sm mt-2 pt-2 border-t border-[#333333]">{log.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
