import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const db = await connectDB();
        const riwayat = await db.collection('stok_keluar')
            .find()
            .sort({ tanggal_keluar: -1 })
            .toArray();

        return NextResponse.json({ 
            success: true, 
            riwayat 
        });
    } catch (error) {
        console.error('GET Stok Keluar Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Gagal mengambil data stok keluar' 
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { 
            nomor_nota,
            tanggal_keluar,
            buku_id,
            judul,
            penulis,
            kategori,
            jumlah_keluar,
            keterangan
        } = data;

        const db = await connectDB();

        // Check stock availability
        const book = await db.collection('buku').findOne({ _id: new ObjectId(buku_id) });
        if (!book || book.stok_awal < parseInt(jumlah_keluar)) {
            return NextResponse.json({ 
                success: false, 
                error: 'Stok tidak mencukupi' 
            }, { status: 400 });
        }

        // Insert stok keluar record
        const result = await db.collection('stok_keluar').insertOne({
            nomor_nota,
            tanggal_keluar: new Date(tanggal_keluar),
            buku_id: new ObjectId(buku_id),
            judul,
            penulis,
            kategori,
            jumlah_keluar: parseInt(jumlah_keluar),
            keterangan,
            created_at: new Date()
        });

        // Update book stock
        await db.collection('buku').updateOne(
            { _id: new ObjectId(buku_id) },
            { $inc: { stok_awal: -parseInt(jumlah_keluar) } }
        );

        return NextResponse.json({ 
            success: true,
            message: 'Stok keluar berhasil dicatat',
            insertedId: result.insertedId
        }, { status: 201 });

    } catch (error) {
        console.error('POST Stok Keluar Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Gagal mencatat stok keluar' 
        }, { status: 500 });
    }
}