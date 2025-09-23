import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from 'crypto';

const prisma = new PrismaClient();

// Function to create SHA1 hash
function sha1(input: string): string {
    return crypto.createHash('sha1').update(input).digest('hex');
}

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        
        // Convert password to SHA1
        const hashedPassword = sha1(password).toUpperCase(); // SHA1 to uppercase to match DB format
        
        console.log('Login attempt:', {
            username,
            hashedPassword
        });

        // Find user with matching username and password
        const user = await prisma.tb_user.findFirst({
            where: {
                username: username,
                password: hashedPassword, // Using SHA1 hashed password
                is_active: 1
            }
        });

        console.log('Query result:', user);

        if (user) {
            // User found and active
            return NextResponse.json({ 
                logged_in: "1",
                user: {
                    id: user.id_usr,
                    fullname: user.fullname,
                    email: user.email
                }
            });
        } else {
            // User not found or inactive
            return NextResponse.json({ 
                logged_in: "0",
                message: "Invalid username or password" 
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ 
            logged_in: "0",
            message: "Server error occurred" 
        }, { status: 500 });
    }
}
