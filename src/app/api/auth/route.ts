import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }
    const officer = await db.officer.findUnique({ where: { username } });
    if (!officer) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }
    // Check if password is hashed (starts with $2a$, $2b$, or $2y$)
    const isHashed = /^\$2[aby]\$/.test(officer.password);
    let isValid = false;
    if (isHashed) {
      isValid = await bcrypt.compare(password, officer.password);
    } else {
      // Fallback for legacy plaintext passwords
      isValid = officer.password === password;
    }
    if (!isValid) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }
    const { password: _, ...safeOfficer } = officer;
    return NextResponse.json({ officer: safeOfficer });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Login gagal' }, { status: 500 });
  }
}
