import type {
  CreateUserInput,
  Role,
  UserDTO,
  UserSessionDTO,
} from "@wo/shared-types";

export interface UserAuthRecord {
  userId: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  passwordHash: string | null;
  role: Role;
  suspendedAt: Date | null;
  deletedAt: Date | null;
}

export interface UserAuthRepository {
  findAuthUserByEmail(email: string): Promise<UserAuthRecord | null>;
  isEmailTaken(email: string): Promise<boolean>;
  isPhoneNumberTaken(phoneNumber: string): Promise<boolean>;
  createUserRegistration(data: CreateUserInput): Promise<UserDTO>;
  getUserSessionByUserId(userId: string): Promise<UserSessionDTO | null>;
}
