import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// API Key untuk keamanan
const API_KEY = "rahasia";

// Function untuk hash password dengan SHA-1
function hashPassword(password: string): string {
  return createHash("sha1").update(password).digest("hex");
}

// Function untuk validasi API key
function validateApiKey(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  return apiKey === API_KEY;
}

// GET - Mengambil semua data user
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.tb_user.findMany({
      orderBy: {
        id_usr: "asc",
      },
    });
    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Menambah user baru
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id_sts, fullname, username, password, email, nohp, is_active } =
      body;

    // Validasi required fields
    if (!id_sts || !fullname || !username || !password || !email || !nohp) {
      return NextResponse.json(
        { error: "All fields are required including station" },
        { status: 400 }
      );
    }

    // Check for duplicate username
    const existingUser = await prisma.tb_user.findFirst({
      where: { username: username },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: `Username ${username} is already taken. Please choose another username.`,
        },
        { status: 400 }
      );
    }

    // Create new user with hashed password
    const hashedPassword = hashPassword(password);
    const newUser = await prisma.tb_user.create({
      data: {
        id_sts: parseInt(id_sts),
        fullname,
        username,
        password: hashedPassword, // Password di-hash dengan SHA-1
        email,
        nohp,
        is_active: is_active || 1,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PUT - Mengupdate data user
export async function PUT(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id_usr,
      id_sts,
      fullname,
      username,
      password,
      email,
      nohp,
      is_active,
    } = body;

    if (!id_usr) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.tb_user.findUnique({
      where: { id_usr: parseInt(id_usr) },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for duplicate username (excluding current user)
    if (username && username !== existingUser.username) {
      const duplicateUser = await prisma.tb_user.findFirst({
        where: {
          username: username,
          id_usr: { not: parseInt(id_usr) },
        },
      });

      if (duplicateUser) {
        return NextResponse.json(
          {
            error: `Username ${username} is already taken. Please choose another username.`,
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      id_sts?: number;
      fullname?: string;
      username?: string;
      password?: string;
      email?: string;
      nohp?: string;
      is_active?: number;
    } = {
      id_sts: id_sts ? parseInt(id_sts) : existingUser.id_sts,
      fullname: fullname || existingUser.fullname,
      username: username || existingUser.username,
      email: email || existingUser.email,
      nohp: nohp || existingUser.nohp,
      is_active: is_active !== undefined ? is_active : existingUser.is_active,
    };

    // Only update password if provided (hash with SHA-1)
    if (password) {
      updateData.password = hashPassword(password); // Password di-hash dengan SHA-1
    }

    const updatedUser = await prisma.tb_user.update({
      where: { id_usr: parseInt(id_usr) },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - Menghapus data user
export async function DELETE(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id_usr } = body;

    if (!id_usr) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.tb_user.findUnique({
      where: { id_usr: parseInt(id_usr) },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the user
    await prisma.tb_user.delete({
      where: { id_usr: parseInt(id_usr) },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
