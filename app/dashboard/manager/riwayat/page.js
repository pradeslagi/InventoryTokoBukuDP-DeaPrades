'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { History, Search, Calendar } from 'lucide-react';

export default function RiwayatAktivitas() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'manager') {
      router.push('/login');
      return;
    }
    fetchActivities();
  }, [router]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/activity-log');
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} userRole="manager" />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Riwayat Aktivitas</h1>
            <p className="text-gray-600 mt-2">Log aktivitas pengguna sistem</p>
          </div>

          {/* Filter Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Activity List */}
          <div className="bg-white rounded-lg shadow-sm">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Memuat data...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {activities.map((activity, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-pink-100 rounded-full">
                        <History className="w-5 h-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-900">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="font-medium text-gray-900">{activity.target}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada aktivitas yang tercatat</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}