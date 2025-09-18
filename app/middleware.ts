//file ini harus berada di app
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("logged_in")?.value;

    //jika tidak ada token dan mengakses halaman selain login maka redirect ke halaman login
    if (!token && request.nextUrl.pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

//buat daftar alamat yang akan diprotect
export const config = {
    matcher: ["/crud"],
};