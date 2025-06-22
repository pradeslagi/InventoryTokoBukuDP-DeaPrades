import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db("tokobuku");

    const totalBuku = await db.collection("buku").countDocuments();
    const totalKategori = await db.collection("kategori").countDocuments();
    const totalPengguna = await db.collection("users").countDocuments();

    return NextResponse.json({
      totalBuku,
      totalKategori,
      totalPengguna,
      stokMinimum: 3
    });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  } finally {
    await client.close();
  }
}
