// app/api/riwayat/route.js
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('tokobuku');
    const riwayat = await db.collection('riwayat').find({}).sort({ waktu: -1 }).toArray();
    return Response.json(riwayat);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Gagal mengambil riwayat' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();

    const client = await clientPromise;
    const db = client.db('tokobuku');

    const result = await db.collection('riwayat').insertOne({
      ...data,
      waktu: new Date()
    });

    return Response.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Gagal menyimpan riwayat' }), { status: 500 });
  }
}
