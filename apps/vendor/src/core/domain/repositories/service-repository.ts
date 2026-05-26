import type {
  CreateServiceInput,
  ListOptions,
  ServiceDTO,
  UpdateServiceInput,
} from "@wo/shared-types";

export interface ServiceRepository {
  findById(id: string): Promise<ServiceDTO | null>;
  listByVendor(vendorId: string, options?: ListOptions): Promise<ServiceDTO[]>;
  create(data: CreateServiceInput): Promise<ServiceDTO>;
  update(id: string, data: UpdateServiceInput): Promise<ServiceDTO>;
  remove(id: string): Promise<void>;
}
