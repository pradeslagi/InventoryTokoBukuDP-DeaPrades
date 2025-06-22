import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('tokobuku');

    const laporan = await db
      .collection('stok_log')
      .find({})
      .sort({ tanggal: -1 }) // urutkan dari terbaru
      .toArray();

    return new Response(
      JSON.stringify({ laporan }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Gagal ambil laporan:', error);
    return new Response(
      JSON.stringify({ error: 'Gagal mengambil laporan stok' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
