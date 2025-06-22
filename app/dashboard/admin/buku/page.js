'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Pencil, Trash2, Save } from 'lucide-react';

export default function DataBukuPage() {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [buku, setBuku] = useState([]);
    const [kategoriList, setKategoriList] = useState([]);
    const [stokBuku, setStokBuku] = useState({});
    const [form, setForm] = useState({
        _id: null,
        judul: '',
        penulis: '',
        penerbit: '',
        tahun: '',
        kategori: ''
    });
    const [isEdit, setIsEdit] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/login');
            return;
        }

        fetchBuku();
        fetchKategori();
    }, [router]);

    const fetchBuku = async () => {
        try {
            const res = await fetch('/api/buku');
            const data = await res.json();
            setBuku(data);
        } catch (error) {
            console.error('Error fetch data buku:', error);
        }
    };

    const fetchKategori = async () => {
        try {
            const res = await fetch('/api/kategori');
            const data = await res.json();
            setKategoriList(data.kategori || []);
        } catch (err) {
            console.error('Gagal fetch kategori:', err);
        }
    };

    useEffect(() => {
        fetchBuku();
        fetchKategori();
    }, []);

    const handleInput = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const method = isEdit ? 'PUT' : 'POST';
        const payload = {
            ...form,
            tahun: parseInt(form.tahun)
        };

        if (!isEdit) {
            delete payload._id;
        }

        try {
            const res = await fetch('/api/buku', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            await res.json();
            setForm({
                _id: null,
                judul: '',
                penulis: '',
                penerbit: '',
                tahun: '',
                kategori: ''
            });
            setIsEdit(false);
            fetchBuku();
        } catch (error) {
            console.error(`Error ${method} data buku:`, error);
        }
    };

    const handleEdit = (item) => {
        setForm({
            _id: item._id,
            judul: item.judul,
            penulis: item.penulis,
            penerbit: item.penerbit,
            tahun: item.tahun,
            kategori: item.kategori
        });
        setIsEdit(true);
    };
    const handleHapus = async (_id) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;
        try {
            await fetch(`/api/buku?id=${_id}`, { method: 'DELETE' });
            fetchBuku();
        } catch (error) {
            console.error('Error hapus buku:', error);
        }
    };
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} userRole="admin" />

            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="pt-20 px-6">
                    <h1 className="text-2xl font-bold text-blue-800 mb-6">Data Buku</h1>
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 text-gray-800">
                        <h2 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Buku' : 'Tambah Buku'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                            <input
                                type="text"
                                name="judul"
                                value={form.judul}
                                onChange={handleInput}
                                placeholder="Judul Buku"
                                className="border p-2 rounded w-full text-gray-700 placeholder:text-gray-500 placeholder:font-medium"
                            />

                            <input
                                type="text"
                                name="penulis"
                                value={form.penulis}
                                onChange={handleInput}
                                placeholder="Penulis"
                                className="border p-2 rounded w-full text-gray-700 placeholder:text-gray-500 placeholder:font-medium"
                            />

                            <input
                                type="text"
                                name="penerbit"
                                value={form.penerbit}
                                onChange={handleInput}
                                placeholder="Penerbit"
                                className="border p-2 rounded w-full text-gray-700 placeholder:text-gray-500 placeholder:font-medium"
                            />

                            <input
                                type="number"
                                name="tahun"
                                value={form.tahun}
                                onChange={handleInput}
                                placeholder="Tahun Terbit"
                                className="border p-2 rounded w-full text-gray-700 placeholder:text-gray-500 placeholder:font-medium"
                            />

                            <select
                                name="kategori"
                                value={form.kategori}
                                onChange={handleInput}
                                className="border p-2 rounded w-full text-gray-700 placeholder:text-gray-500"
                            ><option value="">Pilih Kategori</option>
                                {kategoriList.map((kat) => (
                                    <option key={kat._id} value={kat.nama}>{kat.nama}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleSubmit} className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <Save className="w-4 h-4" /> {isEdit ? 'Update' : 'Simpan'}
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="p-6 overflow-x-auto">
                            <table className="min-w-full bg-white border rounded shadow text-sm text-gray-700">
                                <thead className="bg-blue-800 text-white">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Judul</th>
                                        <th className="px-4 py-2 text-left">Penulis</th>
                                        <th className="px-4 py-2 text-left">Penerbit</th>
                                        <th className="px-4 py-2 text-left">Tahun</th>
                                        <th className="px-4 py-2 text-left">Kategori</th>
                                        <th className="px-4 py-2 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {buku.map((item) => (
                                        <tr key={item._id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">{item.judul}</td>
                                            <td className="px-4 py-2">{item.penulis}</td>
                                            <td className="px-4 py-2">{item.penerbit}</td>
                                            <td className="px-4 py-2">{item.tahun}</td>
                                            <td className="px-4 py-2">{item.kategori}</td>
                                            <td className="px-4 py-2 flex justify-center gap-3">
                                                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleHapus(item._id)} className="text-red-600 hover:text-red-800">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
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
