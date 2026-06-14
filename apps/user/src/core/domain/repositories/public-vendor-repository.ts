export type PublicVendorSortOption =
  | "newest"
  | "highest-rating"
  | "most-booked"
  | "price-low-to-high"
  | "price-high-to-low";

export interface PublicVendorDiscoveryQuery {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sortBy: PublicVendorSortOption;
}

export interface PublicVendorFilterOption {
  value: string;
  label: string;
}

export interface PublicVendorListItemDTO {
  id: string;
  businessName: string;
  categoryId?: string | null;
  categoryName?: string | null;
  city?: string | null;
  province?: string | null;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  averageRating: number;
  totalReviews: number;
  startingPrice: number | null;
  shortDescription: string;
  bookingCount: number;
  createdAt: Date;
}

export interface PublicVendorListResultDTO {
  items: PublicVendorListItemDTO[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  filters: {
    categories: PublicVendorFilterOption[];
    cities: PublicVendorFilterOption[];
  };
}

export interface PublicVendorDetailDTO {
  id: string;
  businessName: string;
  description?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  city?: string | null;
  province?: string | null;
  businessAddress?: string | null;
  location?: string | null;
  priceRange?: string | null;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  averageRating: number;
  totalReviews: number;
  startingPrice: number | null;
  bookingCount: number;
  contact: {
    contactInfo?: string | null;
    phoneNumber?: string | null;
    whatsappNumber?: string | null;
    website?: string | null;
    instagramUrl?: string | null;
    tiktokUrl?: string | null;
    facebookUrl?: string | null;
    youtubeUrl?: string | null;
  };
  createdAt: Date;
}

export interface PublicVendorServiceItemDTO {
  id: string;
  vendorId: string;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicVendorPortfolioItemDTO {
  id: string;
  vendorId: string;
  title?: string | null;
  description?: string | null;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicVendorReviewItemDTO {
  id: string;
  bookingId: string;
  vendorId: string;
  rating: number;
  comment?: string | null;
  reviewerName?: string | null;
  createdAt: Date;
}

export interface PublicVendorRepository {
  listPublicVendors(query: PublicVendorDiscoveryQuery): Promise<PublicVendorListResultDTO>;
  getPublicVendorById(vendorId: string): Promise<PublicVendorDetailDTO | null>;
  listPublicVendorServices(vendorId: string): Promise<PublicVendorServiceItemDTO[] | null>;
  listPublicVendorPortfolio(vendorId: string): Promise<PublicVendorPortfolioItemDTO[] | null>;
  listPublicVendorReviews(vendorId: string): Promise<PublicVendorReviewItemDTO[] | null>;
}
