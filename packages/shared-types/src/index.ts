export enum Role {
  USER = "USER",
  VENDOR = "VENDOR",
  ADMIN = "ADMIN",
}

export enum BookingStatus {
  PENDING = "PENDING",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export interface UserDTO {
  id: string;
  email: string;
  name?: string | null;
  passwordHash?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDTO {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorDTO {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  location?: string | null;
  contactInfo?: string | null;
  priceRange?: string | null;
  categoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceDTO {
  id: string;
  vendorId: string;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingDTO {
  id: string;
  userId: string;
  vendorId: string;
  serviceId?: string | null;
  bookedAt: Date;
  status: BookingStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentProofDTO {
  id: string;
  bookingId: string;
  fileUrl: string;
  note?: string | null;
  verifiedById?: string | null;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewDTO {
  id: string;
  bookingId: string;
  userId: string;
  vendorId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioDTO {
  id: string;
  vendorId: string;
  title?: string | null;
  description?: string | null;
  mediaUrl: string;
  mediaType: MediaType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListOptions {
  take?: number;
  skip?: number;
}

export interface CreateUserInput {
  email: string;
  name?: string;
  passwordHash?: string;
  role?: Role;
}

export interface CreateCategoryInput {
  name: string;
}

export interface CreateVendorInput {
  ownerId: string;
  name: string;
  description?: string;
  location?: string;
  contactInfo?: string;
  priceRange?: string;
  categoryId?: string;
}

export interface UpdateVendorInput {
  name?: string;
  description?: string;
  location?: string;
  contactInfo?: string;
  priceRange?: string;
  categoryId?: string | null;
}

export interface CreateServiceInput {
  vendorId: string;
  name: string;
  description?: string;
  price: number;
  isActive?: boolean;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

export interface CreateBookingInput {
  userId: string;
  vendorId: string;
  serviceId?: string;
  bookedAt: Date;
  notes?: string;
}

export interface UpdateBookingStatusInput {
  status: BookingStatus;
}

export interface CreatePaymentProofInput {
  bookingId: string;
  fileUrl: string;
  note?: string;
}

export interface VerifyPaymentProofInput {
  verifiedById: string;
  verifiedAt?: Date;
}

export interface CreateReviewInput {
  bookingId: string;
  userId: string;
  vendorId: string;
  rating: number;
  comment?: string;
}

export interface CreatePortfolioInput {
  vendorId: string;
  title?: string;
  description?: string;
  mediaUrl: string;
  mediaType: MediaType;
}
