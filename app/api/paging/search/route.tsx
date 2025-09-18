//contoh pencarian data based on non id (nama)
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//pencarian based on nama dengan method POST
export async function POST(request: Request) {
    try {
        //ambil body JSON yang dikirim client
        const body = await request.json();

        //debuging
        console.log('Body yang diterima dari client:',body);

        //jika body kosong atau first name kosong
        if(!body || !body.firstName) {
            return NextResponse.json({message: "Nama harus diisi", status: 400});
        }

        //jika body tidak kosong atau first name tidak kosong
        const {firstName} = body;

        const pagings = await prisma.tb_paging.findMany({
            where: {
                name_passenger: {
                    contains: firstName
                }
            }
        });

        //jika hasil pencarion tidak ditemukan tampilkan error
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