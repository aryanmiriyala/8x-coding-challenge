import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import '@/lib/env'; // Ensure env gets evaluated

export async function GET() {
  try {
    // A simple query to ensure DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Health check database error: database unreachable');
    return NextResponse.json({ status: 'error', database: 'unreachable' }, { status: 503 });
  }
}
