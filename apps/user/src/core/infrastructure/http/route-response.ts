import { NextResponse } from "next/server";

interface ErrorWithCode {
  code?: string;
}

const hasCode = (error: unknown): error is ErrorWithCode =>
  typeof error === "object" && error !== null;

export const errorResponse = (status: number, message: string, details?: unknown) =>
  NextResponse.json(
    {
      success: false,
      message,
      details,
    },
    { status }
  );

export const successResponse = <T>(data: T, status = 200, message = "Success") =>
  NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );

export const parseJsonBody = async <T>(request: Request): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Invalid JSON body");
  }
};

export const handleApiError = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message === "Invalid JSON body") {
      return errorResponse(400, error.message);
    }

    if (error.message.toLowerCase().startsWith("unauthorized")) {
      return errorResponse(401, error.message);
    }

    if (error.message.toLowerCase().startsWith("forbidden")) {
      return errorResponse(403, error.message);
    }

    if (
      error.message.includes("sudah terdaftar") ||
      error.message.includes("sudah digunakan") ||
      error.message.includes("sudah ada")
    ) {
      return errorResponse(409, error.message);
    }

    if (
      error.message.includes("tidak valid") ||
      error.message.includes("minimal") ||
      error.message.includes("wajib") ||
      error.message.includes("tidak boleh") ||
      error.message.includes("tidak aktif") ||
      error.message.includes("tidak tersedia") ||
      error.message.includes("format file") ||
      error.message.includes("ukuran file") ||
      error.message.includes("nominal") ||
      error.message.toLowerCase().startsWith("invalid")
    ) {
      return errorResponse(400, error.message);
    }

    if (error.message.includes("tidak ditemukan")) {
      return errorResponse(404, error.message);
    }
  }

  if (hasCode(error)) {
    if (error.code === "P2002") {
      return errorResponse(409, "Data already exists");
    }

    if (error.code === "P2025") {
      return errorResponse(404, "Data not found");
    }
  }

  if (error instanceof Error && process.env.NODE_ENV !== "production") {
    return errorResponse(500, error.message, {
      name: error.name,
      stack: error.stack,
    });
  }

  return errorResponse(500, "Internal server error");
};
