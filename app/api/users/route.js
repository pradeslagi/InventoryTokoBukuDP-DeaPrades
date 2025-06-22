import { connectDB, closeConnection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const db = await connectDB();
    const users = await db.collection('users').find({}).toArray();
    return Response.json({ success: true, data: users });
  } catch (error) {
    console.error('GET Users Error:', error);
    return Response.json(
      { success: false, error: 'Gagal mengambil data users' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { nama_lengkap, username, password, role } = data;

    if (!nama_lengkap || !username || !password || !role) {
      return Response.json(
        { success: false, error: 'Data user tidak lengkap' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      nama_lengkap,
      username,
      password: hashedPassword,
      role,
      dibuat: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);
    return Response.json({ 
      success: true, 
      data: { insertedId: result.insertedId }
    });
  } catch (error) {
    console.error('POST User Error:', error);
    return Response.json(
      { success: false, error: 'Gagal menambah user' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const data = await req.json();
    const { _id, nama_lengkap, username, password, role } = data;

    if (!_id || !nama_lengkap || !username || !password || !role) {
      return Response.json(
        { success: false, error: 'Data user tidak lengkap' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          nama_lengkap,
          username,
          password: hashedPassword,
          role,
        },
      }
    );

    return Response.json({ 
      success: true, 
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('PUT User Error:', error);
    return Response.json(
      { success: false, error: 'Gagal update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json(
        { success: false, error: 'ID tidak ditemukan' },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const result = await db.collection('users').deleteOne({ 
      _id: new ObjectId(id) 
    });

    return Response.json({ 
      success: true, 
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('DELETE User Error:', error);
    return Response.json(
      { success: false, error: 'Gagal menghapus user' },
      { status: 500 }
    );
  }
}