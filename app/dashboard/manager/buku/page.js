'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { BookOpen } from 'lucide-react';

export default function ManagerBookView() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'manager') {
      router.push('/login');
      return;
    }
    fetchBooks();
  }, [router]);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/buku');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="flex h-screen bg-gray-50">
    <Sidebar isOpen={sidebarOpen} userRole="manager" />

    <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main className="p-8 max-w-6xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight flex items-center gap-3 mt-15">
              <BookOpen className="inline w-8 h-8 text-blue-600" />
              Data Buku
            </h1>
            <p className="text-gray-500 mt-1">Informasi koleksi buku</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-blue-500 font-semibold text-lg">Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left font-bold text-gray-700">Judul Buku</th>
                    <th className="px-5 py-4 text-left font-bold text-gray-700">Penulis</th>
                    <th className="px-5 py-4 text-left font-bold text-gray-700">Penerbit</th>
                    <th className="px-5 py-4 text-left font-bold text-gray-700">Tahun</th>
                    <th className="px-5 py-4 text-left font-bold text-gray-700">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {books.map((book) => (
                    <tr key={book._id} className="hover:bg-gray-100 transition">
                      <td className="px-5 py-4 text-gray-900 font-semibold">{book.judul}</td>
                      <td className="px-5 py-4 text-gray-700">{book.penulis}</td>
                      <td className="px-5 py-4 text-gray-700">{book.penerbit}</td>
                      <td className="px-5 py-4 text-gray-700">{book.tahun}</td>
                      <td className="px-5 py-4 text-gray-700">{book.kategori}</td>
                    </tr>
                  ))}
                  {books.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-400 py-8">
                        Tidak ada data buku.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  </div>
);
}