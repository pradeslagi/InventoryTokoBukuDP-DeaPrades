'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';

export default function KelolaStokBukuPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [buku, setBuku] = useState([]);
    const [stokBuku, setStokBuku] = useState({});

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

            // Calculate stock by book title
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

            setStokBuku(stockMap);
            setBuku(bukuData || []);
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
    }, [router]);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} userRole="admin" />
            
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Stok Buku</h1>
    
                    {loading ? (
                        <div className="text-center font-medium text-gray-600">Loading...</div>
                    ) : (
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 text-left font-semibold text-gray-700">Judul Buku</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Penulis</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Penerbit</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Tahun</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Kategori</th>
                                            <th className="p-3 text-right font-semibold text-gray-700">Stok Tersedia</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {buku.map((item) => (
                                            <tr key={item._id} className="border-t hover:bg-gray-50">
                                                <td className="p-3 text-gray-700 font-medium">{item.judul}</td>
                                                <td className="p-3 text-gray-600">{item.penulis}</td>
                                                <td className="p-3 text-gray-600">{item.penerbit}</td>
                                                <td className="p-3 text-gray-600">{item.tahun}</td>
                                                <td className="p-3 text-gray-600">{item.kategori}</td>
                                                <td className="p-3 text-right font-semibold text-gray-700">
                                                    {stokBuku[item.judul] || 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}