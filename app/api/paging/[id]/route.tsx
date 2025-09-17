//impelementasi CRUD API NEXTJS PRISMA & MYSQL
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//API untuk menampilkan data paging by id
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!params || !params.id) {
        return NextResponse.json({message: "ID harus diisi", status: 400});
    }

    const paging = await prisma.tb_paging.findUnique({
        where: {
            id: parseInt(params.id)
        }
    }); 

    if (!paging) {
        return NextResponse.json({message: "ID Tidak Ditemukan", status: 400});
    }

    return NextResponse.json(paging, {status: 200});  
}