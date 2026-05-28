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

export enum AuditModule {
  USER_MANAGEMENT = "USER_MANAGEMENT",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

export interface UserDTO {
  id: string;
  email: string;
  name?: string | null;
  passwordHash?: string | null;
  role: Role;
  accessProfileId?: string | null;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  suspendedAt?: Date | null;
  suspendedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingHistoryItemDTO {
  id: string;
  bookedAt: Date;
  status: BookingStatus;
  notes?: string | null;
  vendorId: string;
  vendorName: string;
  serviceId?: string | null;
  serviceName?: string | null;
  createdAt: Date;
}

export interface AdminUserListItemDTO {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  status: UserStatus;
  accessProfileId?: string | null;
  accessProfileCode?: string | null;
  accessProfileName?: string | null;
  suspendedAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUserDetailDTO extends AdminUserListItemDTO {
  bookings: BookingHistoryItemDTO[];
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AuditLogDTO {
  id: string;
  actorId: string;
  module: AuditModule;
  action: string;
  targetId: string;
  beforeData?: unknown;
  afterData?: unknown;
  createdAt: Date;
}

export interface CreateAuditLogInput {
  actorId: string;
  module: AuditModule;
  action: string;
  targetId: string;
  beforeData?: unknown;
  afterData?: unknown;
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
  accessProfileId?: string;
}

export interface AccessMenuDTO {
  id: string;
  code: string;
  name: string;
  path?: string | null;
  icon?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessProfileDTO {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessPermissionDTO {
  id: string;
  accessProfileId: string;
  accessMenuId: string;
  canView: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canUpsert: boolean;
  canDelete: boolean;
  canHistory: boolean;
  customEvents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessUserDTO {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  accessProfileId?: string | null;
  accessProfileCode?: string | null;
  accessProfileName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccessMenuInput {
  code: string;
  name: string;
  path?: string;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateAccessMenuInput {
  code?: string;
  name?: string;
  path?: string | null;
  icon?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateAccessProfileInput {
  code: string;
  name: string;
  description?: string;
  isSystem?: boolean;
}

export interface UpdateAccessProfileInput {
  code?: string;
  name?: string;
  description?: string | null;
  isSystem?: boolean;
}

export interface SetAccessPermissionInput {
  accessMenuId: string;
  canView?: boolean;
  canInsert?: boolean;
  canUpdate?: boolean;
  canUpsert?: boolean;
  canDelete?: boolean;
  canHistory?: boolean;
  customEvents?: string[];
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

export interface AdminUsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
  sortBy?: "createdAt" | "updatedAt" | "name" | "email";
  sortDirection?: "asc" | "desc";
  includeDeleted?: boolean;
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
