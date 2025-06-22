import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: Ambil semua data supplier
export async function GET() {
  try {
    const db = await connectDB();
    const suppliers = await db.collection('supplier')
      .find({})
      .sort({ dibuat: -1 })
      .toArray();

    const mappedSuppliers = suppliers.map(s => ({
      _id: s._id,
      nama_supplier: s.nama_supplier,
      kontak_supplier: s.kontak_supplier,
      alamat_supplier: s.alamat_supplier,
      jenis_buku: s.jenis_buku,
      status: s.status,
      tanggal_kerjasama: s.tanggal_kerjasama,
      dibuat: s.dibuat
    }));

    const activeSuppliers = mappedSuppliers.filter(s => 
      s.status === 'Aktif'
    ).length;
    
    const inactiveSuppliers = mappedSuppliers.filter(s => 
      s.status === 'Tidak aktif'
    ).length;

    return new Response(JSON.stringify({
      success: true,
      suppliers: mappedSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      totalSupplier: mappedSuppliers.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch suppliers'
    }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { 
      nama_supplier, 
      kontak_supplier, 
      alamat_supplier, 
      jenis_buku,
      status,
      tanggal_kerjasama 
    } = data;

    // Validate required fields
    if (!nama_supplier || !kontak_supplier || !alamat_supplier) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nama, kontak, dan alamat supplier wajib diisi' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await connectDB();
    const result = await db.collection('supplier').insertOne({
      nama_supplier,
      kontak_supplier,
      alamat_supplier,
      jenis_buku,
      status: status || 'Aktif',
      tanggal_kerjasama,
      dibuat: new Date()
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Supplier berhasil ditambahkan',
        data: { insertedId: result.insertedId }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('POST Supplier Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Gagal menambah supplier' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PUT: Update supplier
export async function PUT(req) {
  try {
    const data = await req.json();
    const { 
      _id, 
      nama_supplier, 
      kontak_supplier, 
      alamat_supplier, 
      jenis_buku,
      status,
      tanggal_kerjasama 
    } = data;

    if (!_id || !nama_supplier || !kontak_supplier || !alamat_supplier) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Data supplier tidak lengkap' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await connectDB();
    const result = await db.collection('supplier').updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: { 
          nama_supplier,
          kontak_supplier,
          alamat_supplier,
          jenis_buku,
          status,
          tanggal_kerjasama,
          diupdate: new Date()
        } 
      }
    );

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Supplier berhasil diupdate',
        data: { modifiedCount: result.modifiedCount }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('PUT Supplier Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Gagal mengupdate supplier' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE: Hapus supplier
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ID supplier tidak ditemukan' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await connectDB();
    const result = await db.collection('supplier').deleteOne({
      _id: new ObjectId(id)
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Supplier berhasil dihapus',
        data: { deletedCount: result.deletedCount }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('DELETE Supplier Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Gagal menghapus supplier' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}