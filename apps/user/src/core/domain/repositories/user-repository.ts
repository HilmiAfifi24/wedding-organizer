import type { CreateUserInput, UserDTO } from "@wo/shared-types";

export interface UserRepository {
  findById(id: string): Promise<UserDTO | null>;
  findByEmail(email: string): Promise<UserDTO | null>;
  findByPhoneNumber(phoneNumber: string): Promise<UserDTO | null>;
  create(data: CreateUserInput): Promise<UserDTO>;
}
