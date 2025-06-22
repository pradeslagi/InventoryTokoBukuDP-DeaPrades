'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';

export default function LaporanMingguanPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('masuk');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [weekRange, setWeekRange] = useState({ start: null, end: null });
    const [stokMasuk, setStokMasuk] = useState([]);
    const [stokKeluar, setStokKeluar] = useState([]);

    // Calculate week range when date changes
    useEffect(() => {
        const date = new Date(selectedDate);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday

        const weekStart = new Date(date.setDate(diff));
        const weekEnd = new Date(date.setDate(diff + 6));

        setWeekRange({
            start: weekStart.toISOString().split('T')[0],
            end: weekEnd.toISOString().split('T')[0]
        });
    }, [selectedDate]);

    // Gunakan useCallback agar fetchData stabil di dependency useEffect
    const fetchData = useCallback(async () => {
        if (!weekRange.start || !weekRange.end) return;

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

            // Filter data for selected week
            const filterByWeek = (item, dateField) => {
                const date = new Date(item[dateField]).toISOString().split('T')[0];
                return date >= weekRange.start && date <= weekRange.end;
            };

            setStokMasuk(masukData.riwayat?.filter(item => filterByWeek(item, 'tanggal_masuk')) || []);
            setStokKeluar(keluarData.riwayat?.filter(item => filterByWeek(item, 'tanggal_keluar')) || []);

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [weekRange]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/login');
            return;
        }
        fetchData();
    }, [weekRange, router, fetchData]);

    const currentData = activeTab === 'masuk' ? stokMasuk : stokKeluar;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} userRole="admin" />
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="p-8">
                    <h1 className="text-2xl font-semibold mb-6 mt-20 text-gray-900">Laporan Stok Mingguan</h1>
                    <p className="text-gray-600 mb-4">
                        Laporan ini menampilkan riwayat stok buku masuk dan keluar selama satu minggu berdasarkan tanggal yang dipilih.
                    </p>
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Pilih Tanggal</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="border p-2 rounded text-gray-700 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700">Range Minggu:</span>
                                <span className="text-gray-800 font-semibold">
                                    {weekRange.start} s/d {weekRange.end}
                                </span>
                            </div>
                            <div className="flex rounded-lg overflow-hidden ml-auto">
                                <button
                                    onClick={() => setActiveTab('masuk')}
                                    className={`px-6 py-2 font-medium transition-colors ${activeTab === 'masuk' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Stok Masuk
                                </button>
                                <button
                                    onClick={() => setActiveTab('keluar')}
                                    className={`px-6 py-2 font-medium transition-colors ${activeTab === 'keluar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Stok Keluar
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-8 text-gray-600 font-medium">Loading...</div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 text-left font-semibold text-gray-700">Tanggal</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">No Nota</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">Judul Buku</th>
                                        <th className="p-3 text-left font-semibold text-gray-700">{activeTab === 'masuk' ? 'Supplier' : 'Keterangan'}</th>
                                        <th className="p-3 text-right font-semibold text-gray-700">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {currentData.map((item) => (
                                        <tr key={item._id} className="border-t hover:bg-gray-50">
                                            <td className="p-3 font-medium">
                                                {new Date(activeTab === 'masuk' ? item.tanggal_masuk : item.tanggal_keluar)
                                                    .toLocaleDateString()}
                                            </td>
                                            <td className="p-3 font-medium">{item.nomor_nota}</td>
                                            <td className="p-3">{item.judul}</td>
                                            <td className="p-3">{activeTab === 'masuk' ? item.supplier : item.keterangan}</td>
                                            <td className="p-3 text-right font-medium">
                                                {activeTab === 'masuk' ? item.jumlah_masuk : item.jumlah_keluar}
                                            </td>
                                        </tr>
                                    ))}
                                    {currentData.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-4 text-center text-gray-500 font-medium">
                                                Tidak ada transaksi pada minggu ini
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-100">
                                    <tr>
                                        <td colSpan="4" className="p-3 text-right font-bold text-gray-800">Total Minggu Ini:</td>
                                        <td className="p-3 text-right font-bold text-gray-800">
                                            {currentData.reduce((sum, item) =>
                                                sum + parseInt(activeTab === 'masuk' ? item.jumlah_masuk : item.jumlah_keluar), 0
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}