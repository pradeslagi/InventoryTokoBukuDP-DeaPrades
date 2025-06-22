import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama_lengkap, username, password, role } = body;

    // Validate required fields
    if (!nama_lengkap || !username || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connectDB();

    // Check existing user
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: "Username already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.collection("users").insertOne({
      _id: new ObjectId(),
      nama_lengkap,
      username,
      password: hashedPassword,
      role: role || "admin",
      dibuat: new Date(),
    });

    return NextResponse.json(
      { 
        message: "User registered successfully",
        userId: result.insertedId 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}