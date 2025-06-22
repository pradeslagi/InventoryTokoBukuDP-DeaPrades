import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const db = await connectDB();
        const riwayat = await db.collection('stok_masuk')
            .find()
            .sort({ tanggal_masuk: -1 })
            .toArray();

        return NextResponse.json({ 
            success: true, 
            riwayat 
        });
    } catch (error) {
        console.error('GET Stok Masuk Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Gagal mengambil data stok masuk' 
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { 
            nomor_nota,
            tanggal_masuk,
            buku_id,
            judul,
            penulis,
            kategori,
            supplier,
            jumlah_masuk,
            keterangan
        } = data;

        // Validate required fields
        if (!nomor_nota || !buku_id || !jumlah_masuk || jumlah_masuk <= 0) {
            return NextResponse.json({ 
                success: false, 
                error: 'Data tidak lengkap' 
            }, { status: 400 });
        }

        const db = await connectDB();

        // Insert stok masuk record
        const result = await db.collection('stok_masuk').insertOne({
            nomor_nota,
            tanggal_masuk: new Date(tanggal_masuk),
            buku_id: new ObjectId(buku_id),
            judul,
            penulis,
            kategori,
            supplier,
            jumlah_masuk: parseInt(jumlah_masuk),
            keterangan,
            created_at: new Date()
        });

        // Update book stock
        await db.collection('buku').updateOne(
            { _id: new ObjectId(buku_id) },
            { $inc: { stok_awal: parseInt(jumlah_masuk) } }
        );

        return NextResponse.json({ 
            success: true,
            message: 'Stok berhasil ditambahkan',
            insertedId: result.insertedId
        }, { status: 201 });

    } catch (error) {
        console.error('POST Stok Masuk Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Gagal menambah stok' 
        }, { status: 500 });
    }
}