'use client';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    _id: '',
    nama_lengkap: '',
    username: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (error) {
      console.error('Gagal mengambil data users:', error);
    }
  };

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmitUser = async () => {
    const { _id, nama_lengkap, username, password, role } = form;
    if (!nama_lengkap || !username || !password || !role) {
      alert('Semua data wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const method = _id ? 'PUT' : 'POST';
      const res = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && (data.success || data.modifiedCount || data.upsertedCount)) {
        fetchUsers();
        setForm({ _id: '', nama_lengkap: '', username: '', password: '', role: '' });
      } else {
        alert(data.error || 'Gagal menyimpan user');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setForm({
      _id: user._id,
      nama_lengkap: user.nama_lengkap,
      username: user.username,
      password: user.password,
      role: user.role,
    });
  };

  const handleHapus = async (id) => {
    const konfirmasi = confirm('Yakin ingin menghapus user ini?');
    if (!konfirmasi) return;

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.deletedCount === 1) {
        fetchUsers();
      } else {
        alert(data.error || 'Gagal menghapus user');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus');
    }
  };

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} />
      <div className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="pt-20 px-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-800">Manajemen User</h2>
            <div className="flex gap-2">
              <input
                type="text"
                name="nama_lengkap"
                value={form.nama_lengkap}
                onChange={handleInput}
                placeholder="Nama Lengkap"
                className="border rounded px-3 py-1"
              />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleInput}
                placeholder="Username"
                className="border rounded px-3 py-1"
              />
              <input
                type="text"
                name="password"
                value={form.password}
                onChange={handleInput}
                placeholder="Password"
                className="border rounded px-3 py-1"
              />
              <select
                name="role"
                value={form.role}
                onChange={handleInput}
                className="border rounded px-3 py-1"
              >
                <option value="">Pilih Role</option>
                <option value="staff">Staff Gudang</option>
                <option value="admin">Admin Inventory</option>
                <option value="manager">Manager Operasional</option>
              </select>
              <button
                onClick={handleSubmitUser}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Menyimpan...' : form._id ? 'Update' : 'Tambah'}
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-3 text-left">No</th>
                  <th className="p-3 text-left">Nama</th>
                  <th className="p-3 text-left">Username</th>
                  <th className="p-3 text-left">Password</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item, index) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{item.nama_lengkap}</td>
                    <td className="p-3">{item.username}</td>
                    <td className="p-3">{item.password}</td>
                    <td className="p-3 capitalize">
                      {item.role === 'staff' && 'Staff Gudang'}
                      {item.role === 'admin' && 'Admin Inventory'}
                      {item.role === 'manager' && 'Manager Operasional'}
                    </td>
                    <td className="p-3 flex justify-center gap-3">
                      <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleHapus(item._id.toString())} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-4">
                      Tidak ada data user.
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
