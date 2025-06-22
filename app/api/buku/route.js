import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'tokobuku';

async function connectDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db(dbName).collection('buku');
}

// GET: Ambil semua buku
export async function GET() {
  try {
    const koleksiBuku = await connectDB();
    const dataBuku = await koleksiBuku.find().toArray();
    return NextResponse.json(dataBuku);
  } catch (error) {
    console.error('Gagal mengambil data buku:', error);
    return NextResponse.json({ error: 'Gagal mengambil data buku' }, { status: 500 });
  }
}

// POST: Tambah buku baru
export async function POST(req) {
  try {
    const body = await req.json();
    const koleksiBuku = await connectDB();
    const hasil = await koleksiBuku.insertOne(body);
    return NextResponse.json(hasil);
  } catch (error) {
    console.error('Gagal menambah buku:', error);
    return NextResponse.json({ error: 'Gagal menambah buku' }, { status: 500 });
  }
}

// PUT: Update data buku
export async function PUT(req) {
  try {
    const body = await req.json();
    const id = body._id;
    delete body._id;

    const koleksiBuku = await connectDB();
    const hasil = await koleksiBuku.updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );
    return NextResponse.json(hasil);
  } catch (error) {
    console.error('Gagal update buku:', error);
    return NextResponse.json({ error: 'Gagal update buku' }, { status: 500 });
  }
}

// DELETE: Hapus data buku
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const koleksiBuku = await connectDB();
    const hasil = await koleksiBuku.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json(hasil);
  } catch (error) {
    console.error('Gagal hapus buku:', error);
    return NextResponse.json({ error: 'Gagal hapus buku' }, { status: 500 });
  }
}
