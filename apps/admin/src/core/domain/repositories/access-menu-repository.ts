import type {
  AccessMenuDTO,
  CreateAccessMenuInput,
  UpdateAccessMenuInput,
} from "@wo/shared-types";

export interface AccessMenuRepository {
  findById(id: string): Promise<AccessMenuDTO | null>;
  listAll(): Promise<AccessMenuDTO[]>;
  create(data: CreateAccessMenuInput): Promise<AccessMenuDTO>;
  update(id: string, data: UpdateAccessMenuInput): Promise<AccessMenuDTO>;
  remove(id: string): Promise<void>;
}
