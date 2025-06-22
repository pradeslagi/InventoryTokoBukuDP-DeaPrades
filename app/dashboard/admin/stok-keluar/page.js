'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Save } from 'lucide-react';

export default function StokKeluarPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [buku, setBuku] = useState([]);
    const [riwayatStok, setRiwayatStok] = useState([]);
    const [form, setForm] = useState({
        nomor_nota: '',
        tanggal_keluar: new Date().toISOString().split('T')[0],
        buku_id: '',
        judul: '',
        penulis: '',
        kategori: '',
        jumlah_keluar: '',
        keterangan: '',
        stok_tersedia: 0
    });

    const generateNota = () => {
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        return `STK-OUT/${year}${month}${day}/${hours}${minutes}-${random}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bukuRes, stokRes] = await Promise.all([
                fetch('/api/buku'),
                fetch('/api/stok-keluar')
            ]);

            const [bukuData, stokData] = await Promise.all([
                bukuRes.json(),
                stokRes.json()
            ]);

            if (bukuData) setBuku(bukuData);
            if (stokData?.riwayat) setRiwayatStok(stokData.riwayat);

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBookSelect = (bukuId) => {
        const selectedBook = buku.find(b => b._id === bukuId);
        if (selectedBook) {
            setForm(prev => ({
                ...prev,
                buku_id: selectedBook._id,
                judul: selectedBook.judul || '',
                penulis: selectedBook.penulis || '',
                kategori: selectedBook.kategori || '',
                stok_tersedia: selectedBook.stok_awal || 0
            }));
        }
    };

    const handleSubmit = async () => {
        if (!form.buku_id || !form.jumlah_keluar || !form.nomor_nota) {
            return alert('Lengkapi data yang diperlukan');
        }

        if (parseInt(form.jumlah_keluar) > form.stok_tersedia) {
            return alert('Stok tidak mencukupi');
        }

        try {
            const res = await fetch('/api/stok-keluar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (data.success) {
                fetchData();
                setForm({
                    nomor_nota: generateNota(),
                    tanggal_keluar: new Date().toISOString().split('T')[0],
                    buku_id: '',
                    judul: '',
                    penulis: '',
                    kategori: '',
                    jumlah_keluar: '',
                    keterangan: '',
                    stok_tersedia: 0
                });
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Error submitting:', err);
            alert('Gagal menyimpan data');
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/login');
            return;
        }
        fetchData();
        setForm(prev => ({
            ...prev,
            nomor_nota: generateNota()
        }));
    }, [router]);
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} userRole="admin" />
    
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Stok Keluar</h1>
    
                    {/* Form Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="grid grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Nomor Nota"
                                value={form.nomor_nota}
                                readOnly
                                className="border p-2 rounded bg-gray-50 text-gray-700 font-medium"
                            />
                            <input
                                type="date"
                                value={form.tanggal_keluar}
                                onChange={e => setForm({ ...form, tanggal_keluar: e.target.value })}
                                className="border p-2 rounded text-gray-700 font-medium"
                            />
                            <select
                                value={form.buku_id}
                                onChange={e => handleBookSelect(e.target.value)}
                                className="border p-2 rounded text-gray-700 font-medium"
                            >
                                <option value="" className="text-gray-500">Pilih Buku</option>
                                {buku.map(b => (
                                    <option key={b._id} value={b._id} className="text-gray-700">
                                        {b.judul} (Stok: {b.stok_awal})
                                    </option>
                                ))}
                            </select>
                            <div className="border p-2 rounded bg-gray-50 text-gray-700 font-medium">
                                Stok Tersedia: {form.stok_tersedia}
                            </div>
                            <input
                                type="number"
                                placeholder="Jumlah Keluar"
                                value={form.jumlah_keluar}
                                onChange={e => setForm({ ...form, jumlah_keluar: e.target.value })}
                                className="border p-2 rounded text-gray-700 font-medium"
                                max={form.stok_tersedia}
                            />
                            <textarea
                                placeholder="Keterangan"
                                value={form.keterangan}
                                onChange={e => setForm({ ...form, keterangan: e.target.value })}
                                className="border p-2 rounded col-span-3 text-gray-700 font-medium"
                                rows="3"
                            />
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || parseInt(form.jumlah_keluar) > form.stok_tersedia}
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
    
                    {/* History Table */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Stok Keluar</h2>
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
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}