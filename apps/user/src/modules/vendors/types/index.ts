import type {
  PublicVendorDetailDTO,
  PublicVendorDiscoveryQuery,
  PublicVendorFilterOption,
  PublicVendorListItemDTO,
  PublicVendorListResultDTO,
  PublicVendorPortfolioItemDTO,
  PublicVendorReviewItemDTO,
  PublicVendorServiceItemDTO,
} from "@/core/domain/repositories";

export type {
  PublicVendorDetailDTO,
  PublicVendorDiscoveryQuery,
  PublicVendorFilterOption,
  PublicVendorListItemDTO,
  PublicVendorListResultDTO,
  PublicVendorPortfolioItemDTO,
  PublicVendorReviewItemDTO,
  PublicVendorServiceItemDTO,
};

export interface VendorDetailPageData {
  vendor: PublicVendorDetailDTO;
  services: PublicVendorServiceItemDTO[];
  portfolio: PublicVendorPortfolioItemDTO[];
  reviews: PublicVendorReviewItemDTO[];
}
