'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';

export default function StokKeluarManagerPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [riwayatStok, setRiwayatStok] = useState([]);

    // Role check
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'manager') {
            router.push('/login');
            return;
        }
        fetchData();
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stok-keluar');
            const data = await res.json();
            if (data?.riwayat) setRiwayatStok(data.riwayat);
            else setRiwayatStok([]);
        } catch (err) {
            console.error('Error fetching data:', err);
            setRiwayatStok([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900">
            <Sidebar isOpen={sidebarOpen} userRole="manager" />

            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Stok Keluar</h1>

                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Stok Keluar</h2>
                            {loading ? (
                                <div className="text-center py-8 text-blue-500 font-semibold">Memuat data...</div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 text-left font-semibold text-gray-700">Tanggal</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">No Nota</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Judul Buku</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Jumlah</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {riwayatStok.map(item => (
                                            <tr key={item._id} className="border-t hover:bg-gray-50">
                                                <td className="p-3 text-gray-700 font-medium">{new Date(item.tanggal_keluar).toLocaleDateString()}</td>
                                                <td className="p-3 text-gray-700">{item.nomor_nota}</td>
                                                <td className="p-3 text-gray-700">{item.judul}</td>
                                                <td className="p-3 text-gray-700 font-medium">{item.jumlah_keluar}</td>
                                                <td className="p-3 text-gray-700">{item.keterangan}</td>
                                            </tr>
                                        ))}
                                        {riwayatStok.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center text-gray-400 py-8">
                                                    Tidak ada data stok keluar.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}