'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Pencil, Trash2, Plus } from 'lucide-react';


const kategoriOptions = [
  'Novel', 'Komik', 'Majalah', 'Ensiklopedia', 'Kamus', 'Buku Pelajaran', 'Biografi',
  'Jurnal Ilmiah', 'Buku Anak', 'Panduan', 'Atlas', 'Buku Agama', 'Buku Referensi',
  'Buku Teknologi', 'Karya Sastra', 'Lainnya',
];

const deskripsiOptions = [
  'Romance', 'Horor', 'Misteri', 'Fantasi', 'Petualangan', 'Komedi', 'Drama', 'Ilmiah',
  'Biografi', 'Sejarah', 'Filsafat', 'Psikologi', 'Sastra Klasik', 'Agama',
  'Pendidikan', 'Self-Improvement', 'Teknologi', 'Motivasi', 'Lainnya',
];

export default function KategoriPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [isEdit, setIsEdit] = useState(false);

  const [kategori, setKategori] = useState([]);
  const [form, setForm] = useState({
    nama: '',
    deskripsi: '',
    status: 'Aktif',
  });
  const [loading, setLoading] = useState(false);

  const fetchKategori = async () => {
    try {
      const res = await fetch('/api/kategori', { method: 'GET' });
      const data = await res.json();
      if (res.ok) {
        setKategori(data.kategori);
      }
    } catch (err) {
      console.error('Gagal mengambil data kategori:', err);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      router.push('/login');
    }
  }, [router]);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (item) => {
    setForm({
      _id: item._id,
      nama: item.nama,
      deskripsi: item.deskripsi,
      status: item.status
    });
    setIsEdit(true);
  };

  const handleCancel = () => {
    setForm({
      nama: '',
      deskripsi: '',
      status: 'Aktif'
    });
    setIsEdit(false);
  };

  const handleSubmit = async () => {
    if (!form.nama.trim()) return alert('Pilih nama kategori');
    if (!form.deskripsi.trim()) return alert('Pilih genre/deskripsi');

    setLoading(true);

    try {
      const res = await fetch('/api/kategori', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (isEdit) {
          setKategori(kategori.map(item =>
            item._id === form._id ? { ...form, tanggal: item.tanggal } : item
          ));
          setIsEdit(false);
        } else {
          setKategori([...kategori, { _id: data.insertedId, ...form, tanggal: new Date().toISOString().split('T')[0] }]);
        }
        setForm({ nama: '', deskripsi: '', status: 'Aktif' });
      } else {
        alert(data.error || `Gagal ${isEdit ? 'mengupdate' : 'menyimpan'} kategori`);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleHapus = async (id) => {
    const konfirmasi = confirm('Yakin ingin menghapus kategori ini?');
    if (!konfirmasi) return;

    try {
      const res = await fetch(`/api/kategori?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setKategori(kategori.filter((item) => item._id !== id));
      } else {
        alert(data.error || 'Gagal menghapus kategori');
      }
    } catch (err) {
      console.error('Gagal hapus kategori:', err);
      alert('Terjadi kesalahan saat menghapus');
    }
  };

  return (
   <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} userRole="admin" />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="pt-20 px-6">
          <div className="flex justify-between items-center mb-6 text-gray-800">
            <h2 className="text-2xl font-bold text-blue-800">
              {isEdit ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h2>
            <div className="flex gap-2 flex-wrap">
              <select
                name="nama"
                value={form.nama}
                onChange={handleInput}
                className="border border-gray-300 rounded px-3 py-1"
              >
                <option value="">Pilih Kategori</option>
                {kategoriOptions.map((k, i) => (
                  <option key={i} value={k}>{k}</option>
                ))}
              </select>

              <select
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleInput}
                className="border border-gray-300 rounded px-3 py-1"
              >
                <option value="">Pilih Genre</option>
                {deskripsiOptions.map((g, i) => (
                  <option key={i} value={g}>{g}</option>
                ))}
              </select>

              <select
                name="status"
                value={form.status}
                onChange={handleInput}
                className="border border-gray-300 rounded px-3 py-1"
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
              >
                {isEdit ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {loading ? 'Menyimpan...' : isEdit ? 'Update' : 'Tambah'}
              </button>

              {isEdit && (
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-3 text-left">No</th>
                  <th className="p-3 text-left">Kategori</th>
                  <th className="p-3 text-left">Genre</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Tanggal</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
            {kategori.map((item, index) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{item.nama}</td>
                <td className="p-3">{item.deskripsi}</td>
                <td className="p-3">{item.status}</td>
                <td className="p-3">{item.tanggal}</td>
                <td className="p-3 flex justify-center gap-3">
                  <button 
                    onClick={() => handleEdit(item)} 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleHapus(item._id)} 
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
                {kategori.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-4">
                      Tidak ada kategori tersedia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </main>
      </div>
    </div>
  );
}
