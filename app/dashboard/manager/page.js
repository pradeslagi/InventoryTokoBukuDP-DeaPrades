'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { BookOpen, Layers, Users, Truck, AlertCircle, Package } from 'lucide-react';

export default function ManagerDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stockDetails, setStockDetails] = useState([]);
  const STOCK_THRESHOLD = 10;
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'manager') {
      router.push('/login');
    }
  }, [router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bukuRes, stokMasukRes, stokKeluarRes, kategoriRes, supplierRes] = await Promise.all([
        fetch('/api/buku'),
        fetch('/api/stok-masuk'),
        fetch('/api/stok-keluar'),
        fetch('/api/kategori'),
        fetch('/api/supplier')
      ]);

      const [bukuData, stokMasukData, stokKeluarData, kategoriData, supplierData] = await Promise.all([
        bukuRes.json(),
        stokMasukRes.json(),
        stokKeluarRes.json(),
        kategoriRes.json(),
        supplierRes.json()
      ]);

      // Hitung stok per buku
      const stockMap = {};
      if (stokMasukData?.riwayat) {
        stokMasukData.riwayat.forEach(item => {
          stockMap[item.judul] = (stockMap[item.judul] || 0) + parseInt(item.jumlah_masuk || 0);
        });
      }
      if (stokKeluarData?.riwayat) {
        stokKeluarData.riwayat.forEach(item => {
          stockMap[item.judul] = (stockMap[item.judul] || 0) - parseInt(item.jumlah_keluar || 0);
        });
      }

      // Set stock details for all books
      const stockDetails = bukuData.map(book => ({
        judul: book.judul,
        currentStock: stockMap[book.judul] || 0
      }));
      setStockDetails(stockDetails);

      const totalKategori = kategoriData?.totalKategori || 0;
      const suppliers = supplierData.suppliers || [];

      setDashboardData({
        totalBuku: Array.isArray(bukuData) ? bukuData.length : 0,
        totalKategori,
        totalSupplier: suppliers.length,
        stokMinimum: stockDetails.filter(b => b.currentStock <= STOCK_THRESHOLD).length
      });

    } catch (err) {
      console.error('Error:', err);
      setDashboardData({
        totalBuku: 0,
        totalKategori: 0,
        totalSupplier: 0,
        stokMinimum: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !dashboardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} userRole="manager" />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mt-20">Dashboard Manager</h1>
            <p className="text-gray-600 mt-2">Statistik dan ringkasan data inventori</p>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<BookOpen className="w-6 h-6 text-blue-600" />}
              title="Total Buku"
              value={dashboardData.totalBuku}
              color="bg-blue-100"
              textColor="text-blue-700"
            />
            <StatCard
              icon={<Layers className="w-6 h-6 text-green-600" />}
              title="Kategori"
              value={dashboardData.totalKategori}
              color="bg-green-100"
              textColor="text-green-700"
            />
            <StatCard
              icon={<Truck className="w-6 h-6 text-purple-600" />}
              title="Total Supplier"
              value={dashboardData.totalSupplier}
              color="bg-purple-100"
              textColor="text-purple-700"
            />
            <StatCard
              icon={<AlertCircle className="w-6 h-6 text-red-600" />}
              title="Stok Minimum"
              value={dashboardData.stokMinimum}
              color="bg-red-100"
              textColor="text-red-700"
            />
          </div>

          {/* Stock Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Stok Terakhir Buku</h2>
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div className="divide-y divide-gray-100">
              {stockDetails.map((book, index) => (
                <div key={index} className="flex justify-between py-3">
                  <span className="text-gray-600 font-medium">{book.judul}</span>
                  <span className={`font-semibold ${book.currentStock <= STOCK_THRESHOLD ? 'text-red-600' : 'text-green-600'}`}>
                    {book.currentStock}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, textColor }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</h3>
        </div>
        <div className={`${color} rounded-full p-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
}