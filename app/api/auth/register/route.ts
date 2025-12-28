import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body?.name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().toLowerCase().trim();
    const password = (body?.password ?? "").toString();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "Email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { email, name: name || null, passwordHash },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}
