'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';

export default function SupplierPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [supplierList, setSupplierList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);

  // Role check
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'manager') {
      router.push('/login');
    }
  }, [router]);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/supplier');
      const data = await res.json();
      if (data.success && data.suppliers) {
        setSupplierList(data.suppliers);
      } else {
        setSupplierList([]);
        console.error('Failed to fetch suppliers:', data.error);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSupplierList([]);
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
    if (user.role !== 'manager') {
      router.push('/login');
      return;
    }
    fetchKategori();
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} userRole="manager" />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="pt-20 px-6">
          <div className="flex justify-between items-center mb-6 text-gray-800">
            <h2 className="text-2xl font-bold text-blue-800">
              Data Supplier
            </h2>
          </div>

          <div className="bg-white shadow rounded-lg overflow-auto">
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-3 text-left">No</th>
                  <th className="p-3 text-left">Nama Supplier</th>
                  <th className="p-3 text-left">Kontak</th>
                  <th className="p-3 text-left">Alamat</th>
                  <th className="p-3 text-left">Jenis Buku</th>
                  <th className="p-3 text-left">Status</th>
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
                  </tr>
                ))}
                {supplierList.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-4">
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