"use server";

import { prisma } from "database";
import bcrypt from "bcryptjs";
import { registerSchema, type RegisterInput } from "../validators/auth";

export async function getCategoriesAction() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return {
      success: true,
      categories,
    };
  } catch (error) {
    console.error("Fetch categories error:", error);
    return {
      success: false,
      categories: [],
      error: "Gagal mengambil kategori",
    };
  }
}

export async function registerVendorAction(data: RegisterInput) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Validasi gagal",
    };
  }

  const { name, email, password, vendorName, categoryId } = result.data;

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

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "VENDOR",
        },
      });

      await tx.vendor.create({
        data: {
          ownerId: user.id,
          name: vendorName,
          categoryId,
        },
      });
    });

    return {
      success: true,
      message: "Registrasi vendor berhasil, silakan login",
    };
  } catch (error) {
    console.error("Vendor register error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan server saat mendaftar sebagai vendor",
    };
  }
}
