import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const user = await db.collection("users").findOne({ username });
    
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        role: user.role,
        dibuat: user.dibuat
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Set cookie user (role) agar bisa dibaca middleware
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        _id: user._id,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        role: user.role,
        dibuat: user.dibuat
      },
      token
    });

    // Cookie hanya perlu role saja untuk middleware
    response.cookies.set('user', JSON.stringify({ role: user.role }), {
      path: '/',
      httpOnly: false, // true lebih aman, tapi middleware Next.js hanya bisa baca non-HTTPOnly
      sameSite: 'lax',
      maxAge: 60 * 60 * 8 // 8 jam
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}