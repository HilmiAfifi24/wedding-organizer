import type {
  CreateVendorInput,
  ListOptions,
  UpdateVendorInput,
  VendorDTO,
} from "@wo/shared-types";

export interface VendorRepository {
  findById(id: string): Promise<VendorDTO | null>;
  list(options?: ListOptions & { categoryId?: string }): Promise<VendorDTO[]>;
  create(data: CreateVendorInput): Promise<VendorDTO>;
  update(id: string, data: UpdateVendorInput): Promise<VendorDTO>;
}
