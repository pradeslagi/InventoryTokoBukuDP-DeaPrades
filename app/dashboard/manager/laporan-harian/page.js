'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Calendar } from 'lucide-react';

export default function LaporanHarianPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('masuk'); // 'masuk' or 'keluar'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [stokMasuk, setStokMasuk] = useState([]);
    const [stokKeluar, setStokKeluar] = useState([]);
    const [activeDates, setActiveDates] = useState(new Set());

    const fetchData = async () => {
        setLoading(true);
        try {
            const [masukRes, keluarRes] = await Promise.all([
                fetch('/api/stok-masuk'),
                fetch('/api/stok-keluar')
            ]);

            const [masukData, keluarData] = await Promise.all([
                masukRes.json(),
                keluarRes.json()
            ]);

            // Get all active dates
            const dates = new Set();
            masukData.riwayat?.forEach(item => {
                dates.add(new Date(item.tanggal_masuk).toISOString().split('T')[0]);
            });
            keluarData.riwayat?.forEach(item => {
                dates.add(new Date(item.tanggal_keluar).toISOString().split('T')[0]);
            });

            setActiveDates(dates);
            setStokMasuk(masukData.riwayat || []);
            setStokKeluar(keluarData.riwayat || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'manager') {
            router.push('/login');
            return;
        }
        fetchData();
    }, [router]);

    const filteredData = activeTab === 'masuk' 
        ? stokMasuk.filter(item => new Date(item.tanggal_masuk).toISOString().split('T')[0] === selectedDate)
        : stokKeluar.filter(item => new Date(item.tanggal_keluar).toISOString().split('T')[0] === selectedDate);

        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar isOpen={sidebarOpen} userRole="manager" />
                
                <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                    <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="p-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6 mt-20">Laporan Harian</h1>
                        <p className="text-gray-600 mb-4">
                            Laporan ini menampilkan riwayat stok buku masuk dan keluar berdasarkan tanggal yang dipilih.
                        </p>
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className={`border p-2 rounded text-gray-700 font-medium ${activeDates.has(selectedDate) ? 'border-blue-500 bg-blue-50' : ''}`}
                                />
                                <div className="flex rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setActiveTab('masuk')}
                                        className={`px-4 py-2 font-semibold ${activeTab === 'masuk' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                    >
                                        Stok Masuk
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('keluar')}
                                        className={`px-4 py-2 font-semibold ${activeTab === 'keluar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                                    >
                                        Stok Keluar
                                    </button>
                                </div>
                            </div>
        
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 text-left font-semibold text-gray-700">No Nota</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Judul Buku</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">{activeTab === 'masuk' ? 'Supplier' : 'Keterangan'}</th>
                                        <th className="p-3 text-right font-semibold text-gray-700">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {filteredData.map((item) => (
                                        <tr key={item._id} className="border-t hover:bg-gray-50">
                                            <td className="p-3 font-medium">{item.nomor_nota}</td>
                                            <td className="p-3">{item.judul}</td>
                                            <td className="p-3">{activeTab === 'masuk' ? item.supplier : item.keterangan}</td>
                                            <td className="p-3 text-right font-medium">
                                                {activeTab === 'masuk' ? item.jumlah_masuk : item.jumlah_keluar}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-3 text-center text-gray-500 font-medium">
                                                Tidak ada transaksi pada tanggal ini
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-100">
                                    <tr>
                                        <td colSpan="3" className="p-3 text-right font-bold text-gray-700">Total:</td>
                                        <td className="p-3 text-right font-bold text-gray-700">
                                            {filteredData.reduce((sum, item) => 
                                                sum + parseInt(activeTab === 'masuk' ? item.jumlah_masuk : item.jumlah_keluar), 0
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </main>
                </div>
            </div>
        );
}