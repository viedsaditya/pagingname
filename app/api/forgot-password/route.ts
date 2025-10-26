import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Forgot password endpoint' }, { status: 200 });
}
