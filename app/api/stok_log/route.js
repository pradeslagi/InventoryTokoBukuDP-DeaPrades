import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'tokobuku';

export async function GET() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const stokLog = db.collection('stok_log');
    const dataStok = await stokLog.find().toArray();

    return NextResponse.json(dataStok);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal ambil data stok' }, { status: 500 });
  }
}
