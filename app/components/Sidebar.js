'use client';
import {
  BookOpen, LayoutDashboard, Truck, Tag, Boxes,
  BarChart2, Users2, ClipboardList, Bell,
  History, FileText, ChartBar, UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Sidebar({ isOpen, userRole }) {
  const [notificationCount, setNotificationCount] = useState(0);
  const STOCK_THRESHOLD = 10;

  const fetchNotifications = async () => {
    try {
      const [bukuRes, stokMasukRes, stokKeluarRes] = await Promise.all([
        fetch('/api/buku'),
        fetch('/api/stok-masuk'),
        fetch('/api/stok-keluar')
      ]);

      const [bukuData, stokMasukData, stokKeluarData] = await Promise.all([
        bukuRes.json(),
        stokMasukRes.json(),
        stokKeluarRes.json()
      ]);

      // Calculate stock levels
      const stockMap = {};
      stokMasukData?.riwayat?.forEach(item => {
        stockMap[item.judul] = (stockMap[item.judul] || 0) + parseInt(item.jumlah_masuk || 0);
      });

      stokKeluarData?.riwayat?.forEach(item => {
        stockMap[item.judul] = (stockMap[item.judul] || 0) - parseInt(item.jumlah_keluar || 0);
      });

      // Count low stock items
      const lowStockCount = bukuData.filter(book =>
        (stockMap[book.judul] || 0) <= STOCK_THRESHOLD
      ).length;

      setNotificationCount(lowStockCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const menuItems = {
    admin: [
      // Dashboard Group
      [
        { icon: <LayoutDashboard className="w-5 h-5" />, title: 'Dashboard', path: '/dashboard/admin' },
      ],
      // Data Management Group
      [
        { icon: <BookOpen className="w-5 h-5" />, title: 'Data Buku', path: '/dashboard/admin/buku' },
        { icon: <Tag className="w-5 h-5" />, title: 'Kategori', path: '/dashboard/admin/kategori' },
        { icon: <Truck className="w-5 h-5" />, title: 'Supplier', path: '/dashboard/admin/supplier' },
      ],
      // Stock Management Group
      [
        { icon: <Boxes className="w-5 h-5" />, title: 'Stok Masuk', path: '/dashboard/admin/stok-masuk' },
        { icon: <Boxes className="w-5 h-5" />, title: 'Stok Keluar', path: '/dashboard/admin/stok-keluar' },
        { icon: <Boxes className="w-5 h-5" />, title: 'Stok Buku', path: '/dashboard/admin/kelola_stok_buku' },
      ],
      // Reports & Notifications Group
      [
        { icon: <Bell className="w-5 h-5" />, title: 'Notifikasi', path: '/dashboard/admin/notifikasi', badge: notificationCount > 0 ? notificationCount : null },
        { icon: <FileText className="w-5 h-5" />, title: 'Laporan Harian', path: '/dashboard/admin/laporan-harian' },
        { icon: <ChartBar className="w-5 h-5" />, title: 'Laporan Mingguan', path: '/dashboard/admin/laporan-mingguan' }
      ],
      // Biodata
      [
        { icon: <UserCircle className="w-5 h-5" />, title: 'Biodata', path: '/dashboard/admin/biodata' }
      ]
    ],
    manager: [
      // Dashboard Group
      [
        { icon: <LayoutDashboard className="w-5 h-5" />, title: 'Dashboard', path: '/dashboard/manager' },
      ],
      // Reports & Activities Group
      [
        { icon: <FileText className="w-5 h-5" />, title: 'Laporan Harian', path: '/dashboard/manager/laporan-harian' },
        { icon: <ChartBar className="w-5 h-5" />, title: 'Laporan Mingguan', path: '/dashboard/manager/laporan-mingguan' },
        { icon: <Bell className="w-5 h-5" />, title: 'Notifikasi', path: '/dashboard/manager/notifikasi' },
      ],
      // Data Management Group
      [
        { icon: <BookOpen className="w-5 h-5" />, title: 'Data Buku', path: '/dashboard/manager/buku' },
        { icon: <Tag className="w-5 h-5" />, title: 'Kategori', path: '/dashboard/manager/kategori' },
        { icon: <Truck className="w-5 h-5" />, title: 'Supplier', path: '/dashboard/manager/supplier' },
      ],
      // Stock Management Group
      [
        { icon: <Boxes className="w-5 h-5" />, title: 'Stok Masuk', path: '/dashboard/manager/stok-masuk' },
        { icon: <Boxes className="w-5 h-5" />, title: 'Stok Keluar', path: '/dashboard/manager/stok-keluar' }
      ],
      // Biodata
      [
        { icon: <UserCircle className="w-5 h-5" />, title: 'Biodata', path: '/dashboard/manager/biodata' }
      ]
    ]
  };

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-pink-100 to-white text-gray-700 z-40 transform transition-transform duration-300 shadow-lg ${
      isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
    }`}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-pink-700 tracking-wide">
          <BookOpen className="w-6 h-6 text-pink-600" />
          <span className="font-sans text-lg tracking-wider">Inventory Buku</span>
        </h2>
        <div className="space-y-6">
          {menuItems[userRole]?.map((group, groupIndex) => (
            <div key={groupIndex}>
              <ul className="space-y-2.5">
                {group.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 group relative hover:bg-pink-50 rounded-lg p-2.5 transition-all duration-200">
                    <div className="text-pink-500">
                      {item.icon}
                    </div>
                    <Link 
                      href={item.path} 
                      className="text-gray-700 hover:text-pink-700 flex-1 transition-colors duration-200 font-medium tracking-wide text-sm"
                    >
                      {item.title}
                    </Link>
                    {item.badge && (
                      <span className="absolute -right-1 -top-1 bg-pink-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {groupIndex < menuItems[userRole].length - 1 && (
                <div className="border-b border-pink-200 my-5 opacity-30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}