import bcrypt from "bcryptjs";
import {
  Role,
  UserStatus,
  type UserRegistrationInput,
  type UserSessionDTO,
} from "@wo/shared-types";

import type { UserAuthRepository } from "@/core/domain/repositories";

export type UserAuthenticationFailureReason =
  | "INVALID_CREDENTIALS"
  | "FORBIDDEN_ROLE"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_DELETED";

export type UserAuthenticationResult =
  | {
      success: true;
      session: UserSessionDTO;
    }
  | {
      success: false;
      reason: UserAuthenticationFailureReason;
    };

const ensureUserSession = (session: UserSessionDTO | null) => {
  if (!session) {
    throw new Error("Unauthorized: user session not found");
  }

  return session;
};

export class RegisterUserUseCase {
  constructor(private readonly repository: UserAuthRepository) {}

  async execute(input: UserRegistrationInput): Promise<UserSessionDTO> {
    if (await this.repository.isEmailTaken(input.email)) {
      throw new Error("Email sudah terdaftar");
    }

    if (await this.repository.isPhoneNumberTaken(input.phoneNumber)) {
      throw new Error("Nomor telepon sudah digunakan");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const created = await this.repository.createUserRegistration({
      email: input.email,
      phoneNumber: input.phoneNumber,
      name: input.fullName,
      passwordHash,
      role: Role.USER,
    });

    const session = await this.repository.getUserSessionByUserId(created.id);
    return ensureUserSession(session);
  }
}

export class AuthenticateUserUseCase {
  constructor(private readonly repository: UserAuthRepository) {}

  async execute(email: string, password: string): Promise<UserAuthenticationResult> {
    const authRecord = await this.repository.findAuthUserByEmail(email);

    if (!authRecord || !authRecord.passwordHash) {
      return {
        success: false,
        reason: "INVALID_CREDENTIALS",
      };
    }

    if (authRecord.role !== Role.USER) {
      return {
        success: false,
        reason: "FORBIDDEN_ROLE",
      };
    }

    if (authRecord.deletedAt) {
      return {
        success: false,
        reason: "ACCOUNT_DELETED",
      };
    }

    if (authRecord.suspendedAt) {
      return {
        success: false,
        reason: "ACCOUNT_SUSPENDED",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, authRecord.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        reason: "INVALID_CREDENTIALS",
      };
    }

    const session = await this.repository.getUserSessionByUserId(authRecord.userId);

    if (!session || session.status !== UserStatus.ACTIVE) {
      return {
        success: false,
        reason:
          session?.status === UserStatus.SUSPENDED
            ? "ACCOUNT_SUSPENDED"
            : "INVALID_CREDENTIALS",
      };
    }

    return {
      success: true,
      session,
    };
  }
}

export class GetUserSessionUseCase {
  constructor(private readonly repository: UserAuthRepository) {}

  async execute(userId: string): Promise<UserSessionDTO> {
    const session = await this.repository.getUserSessionByUserId(userId);
    return ensureUserSession(session);
  }
}
