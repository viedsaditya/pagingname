//API untuk menampilkan log data paging
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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

//API untuk menampilkan semua data paging log
export async function GET(request: Request) {
    try {
        //lakukan validasi api key
        validateApiKey(request);

        // Use type assertion to access the log table
        const pagingLogs = await (prisma as any).tb_paging_log.findMany({
            orderBy: {
                last_update: 'desc'
            }
        });
        
        return NextResponse.json(pagingLogs, {status: 200});
    } catch (error: unknown) {
        //jika terjadi error maka tampilkan error
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({message: errorMessage, status: 400});
    }
}
