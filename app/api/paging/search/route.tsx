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

        const employees = await prisma.emp1.findMany({
            where: {
                firstName: {
                    contains: firstName
                }
            }
        });

        //jika hasil pencarion tidak ditemukan tampilkan error
        if(!employees || employees.length === 0) {
            return NextResponse.json({message: "Nama Tidak Ditemukan", status: 400});
        }

        // jika ditemukan nama kembalikan data karyawan
        return NextResponse.json(employees, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Terjadi Kesalahan", status: 500});
    }
}