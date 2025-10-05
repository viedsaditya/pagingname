//example search data based on non id (name)
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//search based on name using POST method
export async function POST(request: Request) {
    try {
        //ambil body JSON yang dikirim client
        const body = await request.json();

        //debuging
        console.log('Body yang diterima dari client:',body);

        //if body is empty or first name is empty
        if(!body || !body.firstName) {
            return NextResponse.json({message: "Name must be filled", status: 400});
        }

        //if body is not empty or first name is not empty
        const {firstName} = body;

        const pagings = await prisma.tb_paging.findMany({
            where: {
                name_passenger: {
                    contains: firstName
                }
            }
        });

        //if search results not found show error
        if(!pagings || pagings.length === 0) {
            return NextResponse.json({message: "Nama Tidak Ditemukan", status: 400});
        }

        // jika ditemukan nama kembalikan data paging
        return NextResponse.json(pagings, {status: 200});
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({message: "Terjadi Kesalahan", status: 500});
    }
}