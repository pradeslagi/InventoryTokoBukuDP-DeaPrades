import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: Ambil semua kategori
export async function GET() {
  try {
    const db = await connectDB();
    const kategori = await db.collection('kategori')
      .find({})
      .sort({ dibuat: -1 })
      .toArray();

    const mappedKategori = kategori.map(k => ({
      _id: k._id,
      nama: k.nama,
      deskripsi: k.deskripsi,
      status: k.status,
      tanggal: k.tanggal,
      dibuat: k.dibuat,
      diupdate: k.diupdate
    }));

    return new Response(JSON.stringify({
      success: true,
      kategori: mappedKategori,
      totalKategori: kategori.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Gagal mengambil data kategori:', err);
    return new Response(JSON.stringify({
      success: false,
      error: 'Gagal mengambil data',
      kategori: [],
      totalKategori: 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST: Tambah kategori baru
export async function POST(request) {
  try {
    const { nama, deskripsi, status } = await request.json();

    // Validate required fields
    if (!nama || nama.trim() === '') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Nama kategori wajib diisi' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!deskripsi || deskripsi.trim() === '') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Deskripsi wajib diisi' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await connectDB();
    const result = await db.collection('kategori').insertOne({ 
      nama,
      deskripsi,
      status: status || 'Aktif',
      tanggal: new Date().toISOString().split('T')[0],
      dibuat: new Date()
    });

    return new Response(JSON.stringify({ 
      success: true, 
      insertedId: result.insertedId 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Gagal menambahkan kategori:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Gagal menyimpan data' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT: Edit kategori
export async function PUT(request) {
  try {
    const { _id, nama } = await request.json();

    if (!_id || !nama || nama.trim() === '') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID dan Nama wajib diisi' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await connectDB();
    const result = await db.collection('kategori').updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: { 
          nama,
          diupdate: new Date() 
        } 
      }
    );

    return new Response(JSON.stringify({ 
      success: true, 
      modifiedCount: result.modifiedCount 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Gagal update kategori:', err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Gagal update data' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE: Hapus kategori
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID tidak ditemukan' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await connectDB();
    const result = await db.collection('kategori').deleteOne({
      _id: new ObjectId(id)
    });

    return new Response(JSON.stringify({
      success: true,
      deletedCount: result.deletedCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Gagal hapus kategori:', err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Gagal menghapus kategori' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}