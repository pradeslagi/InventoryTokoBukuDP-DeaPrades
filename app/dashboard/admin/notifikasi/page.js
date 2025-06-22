'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { AlertTriangle, Bell } from 'lucide-react';

export default function NotifikasiPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const STOCK_THRESHOLD = 10; // Batas minimum stok

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bukuRes, stokMasukRes, stokKeluarRes] = await Promise.all([
                fetch('/api/buku'),
                fetch('/api/stok-masuk'),
                fetch('/api/stok-keluar')
            ]);

            const [bukuData, stokMasukData, stokKeluarData] = await Promise.all([
                bukuRes.json(),
                stokMasukRes.json(),
                stokKeluarRes.json()
            ]);

            // Hitung stok per buku
            const stockMap = {};
            if (stokMasukData?.riwayat) {
                stokMasukData.riwayat.forEach(item => {
                    stockMap[item.judul] = (stockMap[item.judul] || 0) + parseInt(item.jumlah_masuk || 0);
                });
            }

            if (stokKeluarData?.riwayat) {
                stokKeluarData.riwayat.forEach(item => {
                    stockMap[item.judul] = (stockMap[item.judul] || 0) - parseInt(item.jumlah_keluar || 0);
                });
            }

            // Generate alerts for low stock
            const lowStockAlerts = bukuData
                .map(book => ({
                    ...book,
                    currentStock: stockMap[book.judul] || 0
                }))
                .filter(book => book.currentStock <= STOCK_THRESHOLD)
                .sort((a, b) => a.currentStock - b.currentStock);

            setAlerts(lowStockAlerts);

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/login');
            return;
        }
        fetchData();

        // Refresh data every 5 minutes
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, [router]);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} userRole="admin" />

            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="p-8">
                    <div className="flex items-center gap-4 mb-8 mt-16">
                        <Bell className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-800">Notifikasi Stok</h1>
                    </div>
                    <p className="text-gray-600">Daftar buku dengan stok di bawah batas minimum ({STOCK_THRESHOLD})</p>
                    {loading ? (
                        <div className="text-center py-6 text-gray-700 font-medium">Loading...</div>
                    ) : alerts.length > 0 ? (
                        <div className="grid gap-4">
                            {alerts.map((item) => (
                                <div
                                    key={item._id}
                                    className={`bg-white p-6 rounded-lg shadow-sm border-l-4 
                                        ${item.currentStock === 0 ?
                                            'border-red-500 bg-red-50' :
                                            'border-yellow-500 bg-yellow-50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <AlertTriangle className={`w-6 h-6 
                                            ${item.currentStock === 0 ? 'text-red-500' : 'text-yellow-500'}`}
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">{item.judul}</h3>
                                            <p className="text-sm text-gray-700 font-medium">
                                                Penulis: {item.penulis} | Kategori: {item.kategori}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold mb-1 ${item.currentStock === 0 ? 'text-red-600' : 'text-yellow-600'
                                                }`}>
                                                {item.currentStock}
                                            </div>
                                            <div className="text-sm font-medium text-gray-700">Stok Tersedia</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <p className="text-green-700 text-center font-medium text-lg">
                                Semua stok buku masih di atas batas minimum ({STOCK_THRESHOLD})
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}