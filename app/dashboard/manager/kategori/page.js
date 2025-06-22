'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Tag, CheckCircle, XCircle } from 'lucide-react';

export default function ManagerKategoriView() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/kategori');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.kategori)) {
        setCategories(data.kategori);
      } else {
        console.error('Error format data:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'manager') {
      router.push('/login');
      return;
    }
    fetchCategories();
  }, [router]);

return (
  <div className="flex h-screen bg-gray-50">
    <Sidebar isOpen={sidebarOpen} userRole="manager" />
    
    <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="p-8 max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3 mt-14">
            <Tag className="inline w-8 h-8 text-pink-500" />
            Kategori Buku
          </h1>
          <p className="text-gray-500 mt-2">Daftar kategori buku yang tersedia</p>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
              <p className="text-gray-500 mt-4">Memuat data...</p>
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left font-bold text-gray-700">Nama Kategori</th>
                    <th className="px-5 py-4 text-left font-bold text-gray-700">Deskripsi</th>
                    <th className="px-5 py-4 text-left font-bold text-gray-700">Status</th>
                    <th className="px-5 py-4 text-left font-bold text-gray-700">Tanggal Dibuat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-gray-900 font-semibold">{category.nama}</td>
                      <td className="px-5 py-4 text-gray-600">{category.deskripsi}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${category.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {category.status ? 
                            <CheckCircle className="w-3 h-3" /> : 
                            <XCircle className="w-3 h-3" />}
                          {category.status ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {new Date(category.dibuat).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada kategori yang tersedia</p>
            </div>
          )}
        </div>
      </main>
    </div>
  </div>
);
}