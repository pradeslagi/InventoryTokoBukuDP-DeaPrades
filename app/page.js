import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-pink-50 text-gray-900">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-b from-pink-200 to-pink-50">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/image/file_00000000cae86230a06fa67671abba98-removebg-preview.png"
            alt="Logo DP"
            width={150}
            height={150}
            priority
            className="mb-6"
          />
          <h1 className="text-4xl font-bold mb-4 text-pink-600">Sistem Inventory Buku DP</h1>
        </div>
        <p className="text-lg text-pink-700 mb-6 max-w-xl mx-auto">
          Kelola dan pantau seluruh koleksi buku toko Anda dengan sistem inventory yang efisien, akurat, dan mudah digunakan.
        </p>
        <a href="/login">
          <button className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition">
            Masuk ke Sistem
          </button>
        </a>
      </section>

      {/* Fitur Utama */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-10 text-center text-pink-600">Fitur Sistem</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 border border-pink-200 rounded shadow hover:shadow-md transition bg-white">
            <h3 className="text-xl font-bold mb-2 text-pink-500">Manajemen Stok</h3>
            <p className="text-pink-700">Catat jumlah masuk dan keluar setiap buku secara real-time.</p>
          </div>
          <div className="p-6 border border-pink-200 rounded shadow hover:shadow-md transition bg-white">
            <h3 className="text-xl font-bold mb-2 text-pink-500">Kategori Buku</h3>
            <p className="text-pink-700">Kelompokkan buku berdasarkan genre, penulis, atau tingkat usia.</p>
          </div>
          <div className="p-6 border border-pink-200 rounded shadow hover:shadow-md transition bg-white">
            <h3 className="text-xl font-bold mb-2 text-pink-500">Laporan Mingguan</h3>
            <p className="text-pink-700">Berisi laporan stok mingguan keluar & masuknya buku.</p>
          </div>
          <div className="p-6 border border-pink-200 rounded shadow hover:shadow-md transition bg-white">
            <h3 className="text-xl font-bold mb-2 text-pink-500">Pencatatan Supplier</h3>
            <p className="text-pink-700">Data lengkap tentang distribusi buku.</p>
          </div>
          <div className="p-6 border border-pink-200 rounded shadow hover:shadow-md transition bg-white">
            <h3 className="text-xl font-bold mb-2 text-pink-500">Peringatan Stok Menipis</h3>
            <p className="text-pink-700">Notifikasi otomatis jika stok buku hampir habis.</p>
          </div>
          <div className="p-6 border border-pink-200 rounded shadow hover:shadow-md transition bg-white">
            <h3 className="text-xl font-bold mb-2 text-pink-500">Laporan Harian</h3>
            <p className="text-pink-700">Berisi pantauan laporan stok harian keluar & masuknya buku.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pink-600 text-white text-center py-6">
  <div className="flex flex-col items-center gap-2">
    <p>&copy; 2025 Sistem Inventory Toko Buku DP.</p>
    <a href="https://github.com/pradeslagi"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-white hover:text-pink-200 transition"
    >
      {/* GitHub Icon SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        fill="currentColor"
        viewBox="0 0 24 24"
        className="inline-block"
      >
        <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.853 0 1.337-.012 2.419-.012 2.749 0 .267.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
      </svg>
      <span className="font-semibold">pradeslagi</span>
    </a>
    </div>
</footer>
</main>
  );
}