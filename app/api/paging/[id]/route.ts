//impelementasi CRUD API NEXTJS PRISMA & MYSQL
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//API untuk menampilkan data paging by id
export async function GET(request: Request) {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    if (!id) {
        return NextResponse.json({ message: "ID harus diisi" }, { status: 400 });
    }

    const paging = await prisma.tb_paging.findUnique({
        where: {
            id: parseInt(id)
        }
    });

    if (!paging) {
        return NextResponse.json({ message: "ID Tidak Ditemukan" }, { status: 404 });
    }

    return NextResponse.json(paging, { status: 200 });
}


