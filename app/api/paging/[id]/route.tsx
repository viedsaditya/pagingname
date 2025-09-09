//impelementasi CRUD API NEXTJS PRISMA & MYSQL
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//API untuk menampilkan data paging by id
export async function GET(request: Request,{params}) {
    if (!params || !params.id) {
        return NextResponse.json({message: "ID harus diisi", status: 400});
    }

    const employee = await prisma.emp1.findUnique({
        where: {
            id: parseInt(params.id)
        }
    }); 

    if (!employee) {
        return NextResponse.json({message: "ID Tidak Ditemukan", status: 400});
    }

    return NextResponse.json(employee, {status: 200});  
}