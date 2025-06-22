'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { BookOpen, Layers, Users, Truck, AlertCircle, Package, Activity, UserX } from 'lucide-react';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [stockDetails, setStockDetails] = useState([]); // State untuk stok terakhir setiap buku
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const STOCK_THRESHOLD = 10; // Batas minimum stok
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
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

      // Generate alerts for low stock
      const lowStockAlerts = bukuData
        .map(book => ({
          ...book,
          currentStock: stockMap[book.judul] || 0
        }))
        .filter(book => book.currentStock <= STOCK_THRESHOLD)
        .sort((a, b) => a.currentStock - b.currentStock);

      setAlerts(lowStockAlerts);

      // Set stock details for all books
      const stockDetails = bukuData.map(book => ({
        judul: book.judul,
        currentStock: stockMap[book.judul] || 0
      }));
      setStockDetails(stockDetails);

      const totalKategori = kategoriData?.totalKategori || 0;

      const suppliers = supplierData.suppliers || [];
      const activeSuppliers = supplierData.activeSuppliers || 0;
      const inactiveSuppliers = supplierData.inactiveSuppliers || 0;

      setTotalSuppliers(suppliers.length);
      setDashboardData({
        totalBuku: Array.isArray(bukuData) ? bukuData.length : 0,
        totalKategori,
        totalSupplier: suppliers.length,
        activeSuppliers,
        inactiveSuppliers,
        stokMinimum: lowStockAlerts.length
      });

    } catch (err) {
      console.error('Error:', err);
      setDashboardData({
        totalBuku: 0,
        totalKategori: 0,
        totalSupplier: 0,
        activeSuppliers: 0,
        inactiveSuppliers: 0,
        stokMinimum: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !dashboardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} userRole="admin" />
  
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
  
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-gray-600 mt-2">Overview dan statistik sistem</p>
          </div>
  
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Buku</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.totalBuku}</h3>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
  
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kategori</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.totalKategori}</h3>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <Layers className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
  
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Supplier</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.totalSupplier}</h3>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Truck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
  
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stok Minimum</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">{dashboardData.stokMinimum}</h3>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
  
          {/* Supplier Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Total Supplier</h3>
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? '...' : totalSuppliers}
              </p>
            </div>
  
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Supplier Aktif</h3>
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {loading ? '...' : dashboardData?.activeSuppliers || 0}
              </p>
            </div>
  
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Supplier Tidak Aktif</h3>
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {loading ? '...' : dashboardData?.inactiveSuppliers || 0}
              </p>
            </div>
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