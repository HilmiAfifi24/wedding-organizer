import type {
  PublicVendorDetailDTO,
  PublicVendorDiscoveryQuery,
  PublicVendorListResultDTO,
  PublicVendorPortfolioItemDTO,
  PublicVendorRepository,
  PublicVendorReviewItemDTO,
  PublicVendorServiceItemDTO,
} from "@/core/domain/repositories";

export class ListPublicVendorsUseCase {
  constructor(private readonly repository: PublicVendorRepository) {}

  async execute(query: PublicVendorDiscoveryQuery): Promise<PublicVendorListResultDTO> {
    return this.repository.listPublicVendors(query);
  }
}

export class GetPublicVendorDetailUseCase {
  constructor(private readonly repository: PublicVendorRepository) {}

  async execute(vendorId: string): Promise<PublicVendorDetailDTO | null> {
    return this.repository.getPublicVendorById(vendorId);
  }
}

export class ListPublicVendorServicesUseCase {
  constructor(private readonly repository: PublicVendorRepository) {}

  async execute(vendorId: string): Promise<PublicVendorServiceItemDTO[] | null> {
    return this.repository.listPublicVendorServices(vendorId);
  }
}

export class ListPublicVendorPortfolioUseCase {
  constructor(private readonly repository: PublicVendorRepository) {}

  async execute(vendorId: string): Promise<PublicVendorPortfolioItemDTO[] | null> {
    return this.repository.listPublicVendorPortfolio(vendorId);
  }
}

export class ListPublicVendorReviewsUseCase {
  constructor(private readonly repository: PublicVendorRepository) {}

  async execute(vendorId: string): Promise<PublicVendorReviewItemDTO[] | null> {
    return this.repository.listPublicVendorReviews(vendorId);
  }
}
