import "server-only";

import {
  CreateVendorInput,
  ListOptions,
  VendorStatus,
  UpdateVendorInput,
  VendorDTO,
} from "@wo/shared-types";

import type { VendorRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

const mapStatus = (status: string): VendorStatus => {
  switch (status) {
    case "APPROVED":
      return VendorStatus.APPROVED;
    case "REJECTED":
      return VendorStatus.REJECTED;
    case "SUSPENDED":
      return VendorStatus.SUSPENDED;
    default:
      return VendorStatus.PENDING_VERIFICATION;
  }
};

const mapVendor = (
  vendor: Omit<VendorDTO, "status"> & {
    status: string;
  }
): VendorDTO => ({
  ...vendor,
  status: mapStatus(vendor.status),
});

export class PrismaVendorRepository implements VendorRepository {
  async findById(id: string): Promise<VendorDTO | null> {
    const vendor = await prisma.vendor.findFirst({
      where: {
        id,
        status: "APPROVED",
        deletedAt: null,
      },
    });

    return vendor ? mapVendor(vendor) : null;
  }

  async list(options?: ListOptions & { categoryId?: string }): Promise<VendorDTO[]> {
    const vendors = await prisma.vendor.findMany({
      where: {
        status: "APPROVED",
        deletedAt: null,
        ...(options?.categoryId ? { categoryId: options.categoryId } : {}),
      },
      take: options?.take,
      skip: options?.skip,
      orderBy: { createdAt: "desc" },
    });

    return vendors.map(mapVendor);
  }

  async create(data: CreateVendorInput): Promise<VendorDTO> {
    const vendor = await prisma.vendor.create({ data });
    return mapVendor(vendor);
  }

  async update(id: string, data: UpdateVendorInput): Promise<VendorDTO> {
    const vendor = await prisma.vendor.update({ where: { id }, data });
    return mapVendor(vendor);
  }
}
