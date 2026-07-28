'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Users, CheckCircle, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 flex items-center gap-3"><RefreshCcw className="animate-spin" /> Loading Master Dashboard...</div>;
  if (!stats) return <div className="p-8 text-red-500">Failed to load dashboard. Is the Master Backend running?</div>;

  const barChartData = {
    labels: stats.clients.map((c: any) => c.name),
    datasets: [
      {
        label: 'Profit',
        data: stats.clients.map((c: any) => c.total_profit),
        backgroundColor: '#10B981',
        borderRadius: 4,
      },
      {
        label: 'Loss',
        data: stats.clients.map((c: any) => c.total_loss),
        backgroundColor: '#EF4444',
        borderRadius: 4,
      }
    ]
  };

  const pieChartData = {
    labels: stats.plan_chart_data?.labels || [],
    datasets: [
      {
        data: stats.plan_chart_data?.data || [],
        backgroundColor: [
          'rgba(234, 179, 8, 0.8)', // yellow-500
          'rgba(59, 130, 246, 0.8)', // blue-500
          'rgba(16, 185, 129, 0.8)', // emerald-500
          'rgba(239, 68, 68, 0.8)',  // red-500
          'rgba(168, 85, 247, 0.8)'  // purple-500
        ],
        borderColor: '#1e1e1e',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9CA3AF' }
      },
    },
    scales: {
      y: {
        grid: { color: '#333333' },
        ticks: { color: '#9CA3AF' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF' }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: '#9CA3AF' }
      },
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">System Overview</h1>
          <p className="text-gray-400 mt-1">Aggregated telemetry data from all client installations.</p>
        </div>
        <button onClick={fetchStats} className="flex justify-center items-center gap-2 bg-[#1e1e1e] border border-[#333333] px-4 py-2 rounded-lg hover:bg-[#2a2a2a] text-yellow-500 text-sm font-medium transition-colors w-full sm:w-auto">
          <RefreshCcw size={16} /> Sync Now
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-[#333333] flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total Clients</p>
            <p className="text-2xl font-bold text-white">{stats.overview.total_clients}</p>
          </div>
        </div>
        <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-[#333333] flex items-center gap-4">
          <div className="p-3 bg-green-500/20 text-green-500 rounded-xl"><CheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Active Licenses</p>
            <p className="text-2xl font-bold text-white">{stats.overview.active_clients}</p>
          </div>
        </div>
        <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-[#333333] flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Global Profit (PKR)</p>
            <p className="text-2xl font-bold text-white">{Number(stats.overview.total_profit).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-[#333333] flex items-center gap-4">
          <div className="p-3 bg-red-500/20 text-red-500 rounded-xl"><TrendingDown size={24} /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Global Loss (PKR)</p>
            <p className="text-2xl font-bold text-white">{Number(stats.overview.total_loss).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Charts */}
        <div className="bg-[#1e1e1e] rounded-2xl shadow-sm border border-[#333333] p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Profit & Loss by Client</h2>
          <div className="h-80 relative">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-[#1e1e1e] rounded-2xl shadow-sm border border-[#333333] p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Clients by Subscription Plan</h2>
          <div className="h-80 relative flex justify-center">
            {stats.plan_chart_data?.labels?.length > 0 ? (
              <Pie data={pieChartData} options={pieOptions} />
            ) : (
              <p className="text-gray-500 flex items-center h-full">No plan data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-3 bg-[#1e1e1e] rounded-2xl shadow-sm border border-[#333333] p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {stats.recent_activity.length === 0 && <p className="text-gray-400 text-sm">No activity recorded yet.</p>}
            {stats.recent_activity.map((log: any) => (
              <div key={log.id} className="flex gap-4 relative group">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0 z-10 group-hover:scale-150 transition-transform" />
                <div className="absolute top-3 bottom-[-24px] left-[3px] w-[2px] bg-[#333333] last:hidden" />
                <div>
                  <p className="text-sm font-medium text-white">{log.client?.name}</p>
                  <p className="text-sm text-gray-400">{log.action}</p>
                  <p className="text-xs text-yellow-500/70 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
