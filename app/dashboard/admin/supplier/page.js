'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function SupplierPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [supplierList, setSupplierList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [form, setForm] = useState({
    nama_supplier: '',
    kontak_supplier: '',
    alamat_supplier: '',
    jenis_buku: '',
    status: 'Aktif',
    tanggal_kerjasama: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  // Role check
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      router.push('/login');
    }
  }, [router]);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/supplier');
      const data = await res.json();
      
      if (data.success && data.suppliers) {
        setSupplierList(data.suppliers); // Updated to use data.suppliers instead of data.data
      } else {
        setSupplierList([]); // Fallback to empty array if no data
        console.error('Failed to fetch suppliers:', data.error);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSupplierList([]); // Fallback to empty array on error
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);
  const fetchKategori = async () => {
    try {
      const res = await fetch('/api/kategori');
      const data = await res.json();
      if (data.success) {
        setKategoriList(data.kategori || []);
      }
    } catch (err) {
      console.error('Gagal mengambil data kategori:', err);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchKategori(); // Add kategori fetch
  }, [router]);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (item) => {
    setForm({
      _id: item._id,
      nama_supplier: item.nama_supplier,
      kontak_supplier: item.kontak_supplier,
      alamat_supplier: item.alamat_supplier,
      jenis_buku: item.jenis_buku,
      status: item.status,
      tanggal_kerjasama: item.tanggal_kerjasama
    });
    setIsEdit(true);
  };

  const handleCancel = () => {
    setForm({
      nama_supplier: '',
      kontak_supplier: '',
      alamat_supplier: '',
      jenis_buku: '',
      status: 'Aktif',
      tanggal_kerjasama: new Date().toISOString().split('T')[0]
    });
    setIsEdit(false);
  };

  const handleSubmit = async () => {
    if (!form.nama_supplier.trim()) return alert('Nama supplier wajib diisi');
    if (!form.kontak_supplier.trim()) return alert('Kontak supplier wajib diisi');
    if (!form.alamat_supplier.trim()) return alert('Alamat supplier wajib diisi');

    setLoading(true);

    try {
      const res = await fetch('/api/supplier', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (isEdit) {
          setSupplierList(supplierList.map(item =>
            item._id === form._id ? { ...form, _id: item._id } : item
          ));
          setIsEdit(false);
        } else {
          const newSupplier = {
            _id: data.data.insertedId,
            ...form,
            dibuat: new Date().toISOString()
          };
          setSupplierList([...supplierList, newSupplier]);
        }
        setForm({
          nama_supplier: '',
          kontak_supplier: '',
          alamat_supplier: '',
          jenis_buku: '',
          status: 'Aktif',
          tanggal_kerjasama: new Date().toISOString().split('T')[0]
        });
      } else {
        alert(data.error || `Gagal ${isEdit ? 'mengupdate' : 'menyimpan'} supplier`);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
};

  const handleHapus = async (id) => {
    if (!confirm('Yakin ingin menghapus supplier ini?')) return;

    try {
      const res = await fetch(`/api/supplier?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSupplierList(supplierList.filter(item => item._id !== id));
      } else {
        alert(data.error || 'Gagal menghapus supplier');
      }
    } catch (err) {
      console.error('Gagal hapus supplier:', err);
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
              {isEdit ? 'Edit Supplier' : 'Tambah Supplier Baru'}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
              <input
                type="text"
                name="nama_supplier"
                value={form.nama_supplier}
                onChange={handleInput}
                placeholder="Nama Supplier"
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                name="kontak_supplier"
                value={form.kontak_supplier}
                onChange={handleInput}
                placeholder="Kontak"
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                name="alamat_supplier"
                value={form.alamat_supplier}
                onChange={handleInput}
                placeholder="Alamat"
                className="border rounded px-3 py-2"
              />
              <select
                name="jenis_buku"
                value={form.jenis_buku}
                onChange={handleInput}
                className="border rounded px-3 py-2"
              >
                <option value="">Pilih Jenis Buku</option>
                {kategoriList.map((kat) => (
                  <option key={kat._id} value={kat.nama}>{kat.nama}</option>
                ))}
              </select>
              <select
                name="status"
                value={form.status}
                onChange={handleInput}
                className="border rounded px-3 py-2"
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>

              <div className="flex gap-2">
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
          </div>

          <div className="bg-white shadow rounded-lg overflow-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-blue-800 text-white text-gray-700">
                <tr>
                  <th className="p-3 text-left">No</th>
                  <th className="p-3 text-left">Nama Supplier</th>
                  <th className="p-3 text-left">Kontak</th>
                  <th className="p-3 text-left">Alamat</th>
                  <th className="p-3 text-left">Jenis Buku</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {supplierList.map((item, index) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{item.nama_supplier}</td>
                    <td className="p-3">{item.kontak_supplier}</td>
                    <td className="p-3">{item.alamat_supplier}</td>
                    <td className="p-3">{item.jenis_buku}</td>
                    <td className="p-3">{item.status}</td>
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
                {supplierList.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-500 py-4">
                      Tidak ada supplier tersedia.
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