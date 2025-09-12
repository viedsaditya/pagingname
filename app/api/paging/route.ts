//impelementasi CRUD API NEXTJS PRISMA & MYSQL
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//buat function untuk validasi API_KEY
const validateApiKey = (request) => {
    //tangkap http header dengan nama x-api-key
    const apiKey = request.headers.get("x-api-key");

    //ambil nilai API_KEY dari file .env
    const validApiKey = process.env.API_KEY;

    //cocokan apakah api key yang dikirimkan user cocok dengan API_KEY yang ada di file .env
    if (!apiKey || apiKey !== validApiKey) {
        throw new Error("Invalid API Key");
    }
}

//API untuk insert data paging
export async function POST(request: Request) {
    try {
        //lakukan validasi api key
        validateApiKey(request);

        const {belt_no, flight_no, name_passenger} = await request.json();

        //validasi dokumen json yang dikirimkan user (pastikan semua lengkap)
        if (!belt_no || !flight_no || !name_passenger) {
            throw new Error("All fields are required");
        }
        
        // Check if belt number already exists
        const existingBelt = await prisma.tb_paging.findFirst({
            where: {
                belt_no: belt_no
            }
        });
        
        if (existingBelt) {
            throw new Error(`Belt number ${belt_no} is already in use. Please choose another belt number.`);
        }

        const newPaging = await prisma.tb_paging.create({
            data: {
                belt_no,
                flight_no,
                name_passenger
            }
        });
        return NextResponse.json(newPaging, {status: 201});
    } catch (error: unknown) {
        //jika terjadi error maka tampilkan error
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({message: errorMessage, status: 400});
    }
}

//API untuk menampilkan semua data paging
export async function GET(request: Request) {
    try {
        //lakukan validasi api key
        validateApiKey(request);

        const pagings = await prisma.tb_paging.findMany();
        return NextResponse.json(pagings, {status: 200});
    } catch (error: unknown) {
        //jika terjadi error maka tampilkan error
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({message: errorMessage, status: 400});
    }
}

//API untuk delete data paging
export async function DELETE(request: Request) {
    try {
        //lakukan validasi api key
        validateApiKey(request);

        const {id} = await request.json();

        //pastikan user memasukan id data yang akan dihapus
        if (!id) {
            throw new Error("ID is required");
        }

        await prisma.tb_paging.delete({
            where: {id}
        });
        return NextResponse.json({message: "Successfully Deleted", status: 202});
    } catch (error: unknown) {
        //jika terjadi error maka tampilkan error
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({message: errorMessage, status: 400});
    }
}   

//API untuk update data paging
export async function PUT(request: Request) {
    try {
        //lakukan validasi api key
        validateApiKey(request);

        const {id, belt_no, flight_no, name_passenger} = await request.json();

        //validasi dokumen json yang dikirimkan user (pastikan semua lengkap)
        if (!id || !belt_no || !flight_no || !name_passenger) {
            throw new Error("All fields are required");
        }
        
        // Check if belt number already exists but belongs to a different record
        const existingBelt = await prisma.tb_paging.findFirst({
            where: {
                belt_no: belt_no,
                NOT: {
                    id: id
                }
            }
        });
        
        if (existingBelt) {
            throw new Error(`Belt number ${belt_no} is already in use. Please choose another belt number.`);
        }

        await prisma.tb_paging.update({
            where: {id},
            data: {
                belt_no: belt_no,
                flight_no: flight_no,
                name_passenger: name_passenger
            }
        }); 
        return NextResponse.json({message: "Successfully Updated", status: 200});
    } catch (error: unknown) {
        //jika terjadi error maka tampilkan error
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({message: errorMessage, status: 400});
    }
}