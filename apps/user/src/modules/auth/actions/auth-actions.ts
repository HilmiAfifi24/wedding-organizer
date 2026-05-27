"use server";

import { prisma } from "database";
import bcrypt from "bcryptjs";
import { registerSchema, type RegisterInput } from "../validators/auth";

export async function registerUserAction(data: RegisterInput) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Validasi gagal",
    };
  }

  const { name, email, password } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email sudah terdaftar",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
      },
    });

    return {
      success: true,
      message: "Registrasi berhasil, silakan login",
    };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan server saat mendaftar",
    };
  }
}
