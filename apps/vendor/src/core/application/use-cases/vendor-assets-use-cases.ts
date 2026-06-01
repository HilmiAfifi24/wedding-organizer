import {
  MediaType,
  VendorStatus,
  type CreatePortfolioInput,
  type CreateServiceInput,
  type PortfolioDTO,
  type ServiceDTO,
  type UpdatePortfolioInput,
  type UpdateServiceInput,
} from "@wo/shared-types";

import type { PortfolioRepository, ServiceRepository } from "@/core/domain/repositories";

const assertCanManageAssets = (status: VendorStatus) => {
  if (status === VendorStatus.SUSPENDED) {
    throw new Error("Forbidden: suspended vendor cannot manage services or portfolio");
  }
};

export class ListVendorServicesUseCase {
  constructor(private readonly repository: ServiceRepository) {}

  async execute(vendorId: string): Promise<ServiceDTO[]> {
    return this.repository.listByVendor(vendorId);
  }
}

export class CreateVendorServiceUseCase {
  constructor(private readonly repository: ServiceRepository) {}

  async execute(vendorId: string, status: VendorStatus, input: Omit<CreateServiceInput, "vendorId">) {
    assertCanManageAssets(status);

    if (!input.name.trim()) {
      throw new Error("Service name is required");
    }

    if (input.price < 0) {
      throw new Error("Service price is invalid");
    }

    return this.repository.create({
      vendorId,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      price: input.price,
      isActive: input.isActive ?? true,
    });
  }
}

export class UpdateVendorServiceUseCase {
  constructor(private readonly repository: ServiceRepository) {}

  async execute(
    vendorId: string,
    status: VendorStatus,
    serviceId: string,
    input: UpdateServiceInput
  ) {
    assertCanManageAssets(status);

    const existing = await this.repository.findById(serviceId);
    if (!existing || existing.vendorId !== vendorId) {
      throw new Error("Service not found");
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new Error("Service name is required");
    }

    if (input.price !== undefined && input.price < 0) {
      throw new Error("Service price is invalid");
    }

    return this.repository.update(serviceId, {
      ...input,
      name: input.name?.trim(),
      description: input.description?.trim() || input.description,
    });
  }
}

export class DeleteVendorServiceUseCase {
  constructor(private readonly repository: ServiceRepository) {}

  async execute(vendorId: string, status: VendorStatus, serviceId: string) {
    assertCanManageAssets(status);

    const existing = await this.repository.findById(serviceId);
    if (!existing || existing.vendorId !== vendorId) {
      throw new Error("Service not found");
    }

    await this.repository.remove(serviceId);
  }
}

export class ListVendorPortfolioUseCase {
  constructor(private readonly repository: PortfolioRepository) {}

  async execute(vendorId: string): Promise<PortfolioDTO[]> {
    return this.repository.listByVendor(vendorId);
  }
}

export class CreateVendorPortfolioUseCase {
  constructor(private readonly repository: PortfolioRepository) {}

  async execute(
    vendorId: string,
    status: VendorStatus,
    input: Omit<CreatePortfolioInput, "vendorId">
  ) {
    assertCanManageAssets(status);

    if (!input.mediaUrl.trim()) {
      throw new Error("Portfolio media URL is required");
    }

    if (!Object.values(MediaType).includes(input.mediaType)) {
      throw new Error("Portfolio media type is invalid");
    }

    return this.repository.create({
      vendorId,
      title: input.title?.trim() || undefined,
      description: input.description?.trim() || undefined,
      mediaUrl: input.mediaUrl.trim(),
      mediaType: input.mediaType,
    });
  }
}

export class UpdateVendorPortfolioUseCase {
  constructor(private readonly repository: PortfolioRepository) {}

  async execute(
    vendorId: string,
    status: VendorStatus,
    portfolioId: string,
    input: UpdatePortfolioInput
  ) {
    assertCanManageAssets(status);

    const existing = await this.repository.findById(portfolioId);
    if (!existing || existing.vendorId !== vendorId) {
      throw new Error("Portfolio not found");
    }

    if (input.mediaUrl !== undefined && !input.mediaUrl.trim()) {
      throw new Error("Portfolio media URL is required");
    }

    if (input.mediaType !== undefined && !Object.values(MediaType).includes(input.mediaType)) {
      throw new Error("Portfolio media type is invalid");
    }

    return this.repository.update(portfolioId, {
      ...input,
      title: input.title?.trim() || undefined,
      description: input.description?.trim() || undefined,
      mediaUrl: input.mediaUrl?.trim(),
    });
  }
}

export class DeleteVendorPortfolioUseCase {
  constructor(private readonly repository: PortfolioRepository) {}

  async execute(vendorId: string, status: VendorStatus, portfolioId: string) {
    assertCanManageAssets(status);

    const existing = await this.repository.findById(portfolioId);
    if (!existing || existing.vendorId !== vendorId) {
      throw new Error("Portfolio not found");
    }

    await this.repository.remove(portfolioId);
  }
}
