'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';

export default function StokMasukManagerPage() {
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
            const res = await fetch('/api/stok-masuk');
            const data = await res.json();
            if (data?.riwayat) setRiwayatStok(data.riwayat);
        } catch (err) {
            console.error('Error fetching data:', err);
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
                    <h1 className="text-2xl font-bold mb-6">Stok Masuk</h1>

                    <div className="bg-white rounded-lg shadow border border-gray-100 mb-8 overflow-hidden text-gray-900">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Riwayat Stok Masuk</h2>
                            {loading ? (
                                <div className="text-center py-8 text-blue-500 font-semibold">Memuat data...</div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 text-left">Tanggal</th>
                                            <th className="p-3 text-left">No Nota</th>
                                            <th className="p-3 text-left">Judul Buku</th>
                                            <th className="p-3 text-left">Supplier</th>
                                            <th className="p-3 text-left">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {riwayatStok.map(item => (
                                            <tr key={item._id} className="border-t hover:bg-gray-50 transition">
                                                <td className="p-3">{new Date(item.tanggal_masuk).toLocaleDateString()}</td>
                                                <td className="p-3">{item.nomor_nota}</td>
                                                <td className="p-3">{item.judul}</td>
                                                <td className="p-3">{item.supplier}</td>
                                                <td className="p-3">{item.jumlah_masuk}</td>
                                            </tr>
                                        ))}
                                        {riwayatStok.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center text-gray-400 py-8">
                                                    Tidak ada data stok masuk.
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