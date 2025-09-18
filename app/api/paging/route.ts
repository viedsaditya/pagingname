//impelementasi CRUD API NEXTJS PRISMA & MYSQL
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { logPagingOperation } from "../../utils/logging";

const prisma = new PrismaClient();

//buat function untuk validasi API_KEY
const validateApiKey = (request: Request) => {
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

        const requestBody = await request.json();
        console.log("Received request body:", requestBody);
        
        const {belt_no, flight_no, name_passenger, handle_by, free_text, status} = requestBody;

        //validasi dokumen json yang dikirimkan user (pastikan semua lengkap)
        if (!belt_no || !flight_no || !name_passenger || !handle_by || !free_text) {
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
                name_passenger,
                handle_by,
                free_text,
                status: status || 1
            }
        });

        // Create log entry for INSERT operation
        await logPagingOperation({
            belt_no,
            flight_no,
            name_passenger,
            handle_by,
            free_text,
            status: status || 1
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

        // Get the data before deleting for logging purposes
        const existingPaging = await prisma.tb_paging.findUnique({
            where: {id}
        });

        if (!existingPaging) {
            throw new Error("Data not found");
        }

        // Delete the record
        await prisma.tb_paging.delete({
            where: {id}
        });

        // Create log entry for DELETE operation
        await logPagingOperation({
            belt_no: existingPaging.belt_no,
            flight_no: existingPaging.flight_no,
            name_passenger: existingPaging.name_passenger,
            handle_by: existingPaging.handle_by,
            free_text: existingPaging.free_text,
            status: existingPaging.status
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

        const {id, belt_no, flight_no, name_passenger, handle_by, free_text, status} = await request.json();

        //validasi dokumen json yang dikirimkan user (pastikan semua lengkap)
        if (!id || !belt_no || !flight_no || !name_passenger || !handle_by || !free_text) {
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
                name_passenger: name_passenger,
                handle_by: handle_by,
                free_text: free_text,
                status: status !== undefined ? status : 0
            }
        });

        // Create log entry for UPDATE operation
        await logPagingOperation({
            belt_no: belt_no,
            flight_no: flight_no,
            name_passenger: name_passenger,
            handle_by: handle_by,
            free_text: free_text,
            status: status !== undefined ? status : 0
        });

        return NextResponse.json({message: "Successfully Updated", status: 200});
    } catch (error: unknown) {
        //jika terjadi error maka tampilkan error
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({message: errorMessage, status: 400});
    }
}