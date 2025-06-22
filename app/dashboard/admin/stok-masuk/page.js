'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Save } from 'lucide-react';

export default function StokMasukPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [supplierList, setSupplierList] = useState([]);
    const [buku, setBuku] = useState([]);
    const [riwayatStok, setRiwayatStok] = useState([]);
    const [form, setForm] = useState({
        nomor_nota: '',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        buku_id: '',
        judul: '',
        penulis: '',
        kategori: '',
        supplier: '',
        jumlah_masuk: '',
        keterangan: '',
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bukuRes, stokRes, supplierRes] = await Promise.all([
                fetch('/api/buku'),
                fetch('/api/stok-masuk'),
                fetch('/api/supplier')
            ]);

            const [bukuData, stokData, supplierData] = await Promise.all([
                bukuRes.json(),
                stokRes.json(),
                supplierRes.json()
            ]);

            if (bukuData) setBuku(bukuData);
            if (stokData?.riwayat) setRiwayatStok(stokData.riwayat);
            if (supplierData?.data) setSupplierList(supplierData.data);

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };
    const generateNota = () => {
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        return `STK/${year}${month}${day}/${hours}${minutes}-${random}`;
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

    const handleBookSelect = (bukuId) => {
        const selectedBook = buku.find(b => b._id === bukuId);
        if (selectedBook) {
            setForm(prev => ({
                ...prev,
                buku_id: selectedBook._id,
                judul: selectedBook.judul || '',
                penulis: selectedBook.penulis || '',
                kategori: selectedBook.kategori || '',
                harga_beli: selectedBook.harga_beli?.toString() || ''
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Calculate total
    const calculateTotal = () => {
        const jumlah = parseInt(form.jumlah_masuk) || 0;
        const harga = parseInt(form.harga_beli) || 0;
        return jumlah * harga;
    };

    // Submit handler
    const handleSubmit = async () => {
        if (!form.buku_id || !form.jumlah_masuk || !form.nomor_nota) {
            return alert('Lengkapi data yang diperlukan');
        }

        try {
            const res = await fetch('/api/stok-masuk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (data.success) {
                fetchData();
                // Reset form with new nota number
                setForm({
                    nomor_nota: generateNota(), // Generate new nota number
                    tanggal_masuk: new Date().toISOString().split('T')[0],
                    buku_id: '',
                    judul: '',
                    penulis: '',
                    kategori: '',
                    supplier: '',
                    jumlah_masuk: '',
                    keterangan: '',
                });
            }
        } catch (err) {
            console.error('Error submitting:', err);
        }
    };

    return (
       <div className="flex h-screen bg-gray-50 text-gray-900 ">
                   <Sidebar isOpen={sidebarOpen} userRole="admin" />
       
                   <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                       <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="p-8">
                    <h1 className="text-2xl font-bold mb-6">Stok Masuk</h1>

                    {/* Form Section */}
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <div className="grid grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Nomor Nota"
                                value={form.nomor_nota}
                                readOnly
                                className="border p-2 rounded bg-gray-50"
                            />
                            <input
                                type="date"
                                value={form.tanggal_masuk}
                                onChange={e => setForm({ ...form, tanggal_masuk: e.target.value })}
                                className="border p-2 rounded"
                            />
                            <select
                                value={form.supplier}
                                onChange={e => setForm({ ...form, supplier: e.target.value })}
                                className="border p-2 rounded"
                            >
                                <option value="">Pilih Supplier</option>
                                {supplierList.map(s => (
                                    <option key={s._id} value={s.nama_supplier}>
                                        {s.nama_supplier}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={form.buku_id}
                                onChange={e => handleBookSelect(e.target.value)}
                                className="border p-2 rounded"
                            >
                                <option value="">Pilih Buku</option>
                                {buku.map(b => (
                                    <option key={b._id} value={b._id}>{b.judul}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Jumlah"
                                value={form.jumlah_masuk}
                                onChange={e => setForm({ ...form, jumlah_masuk: e.target.value })}
                                className="border p-2 rounded"
                            />
                            <textarea
                                placeholder="Keterangan"
                                value={form.keterangan}
                                onChange={e => setForm({ ...form, keterangan: e.target.value })}
                                className="border p-2 rounded col-span-3"
                            />
                        </div>
                        <button
                            onClick={handleSubmit}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Simpan
                        </button>
                    </div>

                    {/* History Table */}
                    <div className="bg-white rounded-lg shadow border border-gray-100 mb-8 overflow-hidden text-gray-900">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Riwayat Stok Masuk</h2>
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
                                        <tr key={item._id} className="border-t">
                                            <td className="p-3">{new Date(item.tanggal_masuk).toLocaleDateString()}</td>
                                            <td className="p-3">{item.nomor_nota}</td>
                                            <td className="p-3">{item.judul}</td>
                                            <td className="p-3">{item.supplier}</td>
                                            <td className="p-3">{item.jumlah_masuk}</td>
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