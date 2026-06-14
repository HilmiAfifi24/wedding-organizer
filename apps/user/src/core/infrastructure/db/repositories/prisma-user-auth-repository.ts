import "server-only";

import {
  Role,
  type CreateUserInput,
  type UserDTO,
  type UserSessionDTO,
} from "@wo/shared-types";

import { getUserStatus } from "@/core/domain/entities/user-account";
import type { UserAuthRecord, UserAuthRepository } from "@/core/domain/repositories";

import { prisma } from "../prisma";

const toAuthRecord = (record: {
  id: string;
  email: string;
  phoneNumber: string | null;
  name: string | null;
  passwordHash: string | null;
  role: string;
  suspendedAt: Date | null;
  deletedAt: Date | null;
}): UserAuthRecord => ({
  userId: record.id,
  email: record.email,
  fullName: record.name,
  phoneNumber: record.phoneNumber,
  passwordHash: record.passwordHash,
  role: record.role as Role,
  suspendedAt: record.suspendedAt,
  deletedAt: record.deletedAt,
});

const toSession = (record: {
  id: string;
  email: string;
  phoneNumber: string | null;
  name: string | null;
  role: string;
  suspendedAt: Date | null;
  deletedAt: Date | null;
}): UserSessionDTO | null => {
  if (record.role !== Role.USER || record.deletedAt) {
    return null;
  }

  return {
    userId: record.id,
    email: record.email,
    fullName: record.name,
    phoneNumber: record.phoneNumber,
    role: Role.USER,
    status: getUserStatus(record),
    suspendedAt: record.suspendedAt,
  };
};

export class PrismaUserAuthRepository implements UserAuthRepository {
  async findAuthUserByEmail(email: string): Promise<UserAuthRecord | null> {
    const record = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        name: true,
        passwordHash: true,
        role: true,
        suspendedAt: true,
        deletedAt: true,
      },
    });

    return record ? toAuthRecord(record) : null;
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return Boolean(user);
  }

  async isPhoneNumberTaken(phoneNumber: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      select: { id: true },
    });

    return Boolean(user);
  }

  async createUserRegistration(data: CreateUserInput): Promise<UserDTO> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phoneNumber: data.phoneNumber,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role ?? Role.USER,
      },
    });

    return {
      ...user,
      role: user.role as Role,
    };
  }

  async getUserSessionByUserId(userId: string): Promise<UserSessionDTO | null> {
    const record = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        name: true,
        role: true,
        suspendedAt: true,
        deletedAt: true,
      },
    });

    return record ? toSession(record) : null;
  }
}
