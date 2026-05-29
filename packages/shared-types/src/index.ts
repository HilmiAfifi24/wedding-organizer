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

export enum PaymentProofStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum AuditModule {
  USER_MANAGEMENT = "USER_MANAGEMENT",
  VENDOR_MANAGEMENT = "VENDOR_MANAGEMENT",
  BOOKING_MANAGEMENT = "BOOKING_MANAGEMENT",
  PAYMENT_MONITORING = "PAYMENT_MONITORING",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

export enum VendorStatus {
  PENDING_VERIFICATION = "pending_verification",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
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
  phoneNumber?: string | null;
  priceRange?: string | null;
  categoryId?: string | null;
  status: VendorStatus;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  rejectedAt?: Date | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  suspendedAt?: Date | null;
  suspendedBy?: string | null;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorVerificationChecklistDTO {
  businessNameExists: boolean;
  categoryExists: boolean;
  phoneNumberValid: boolean;
  hasMinimumService: boolean;
  hasMinimumPortfolio: boolean;
  isComplete: boolean;
}

export interface AdminVendorListItemDTO {
  id: string;
  name: string;
  status: VendorStatus;
  categoryId?: string | null;
  categoryName?: string | null;
  ownerId: string;
  ownerName?: string | null;
  ownerEmail: string;
  phoneNumber?: string | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminVendorServicePreviewDTO {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
}

export interface AdminVendorPortfolioPreviewDTO {
  id: string;
  title?: string | null;
  description?: string | null;
  mediaUrl: string;
  mediaType: MediaType;
}

export interface AdminVendorDetailDTO extends AdminVendorListItemDTO {
  description?: string | null;
  location?: string | null;
  contactInfo?: string | null;
  priceRange?: string | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  rejectedAt?: Date | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  suspendedAt?: Date | null;
  suspendedBy?: string | null;
  checklist: VendorVerificationChecklistDTO;
  services: AdminVendorServicePreviewDTO[];
  portfolio: AdminVendorPortfolioPreviewDTO[];
  history?: AuditLogDTO[];
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

export interface BookingStatusHistoryDTO {
  id: string;
  bookingId: string;
  previousStatus?: BookingStatus | null;
  newStatus: BookingStatus;
  changedById?: string | null;
  changedByName?: string | null;
  note?: string | null;
  createdAt: Date;
}

export interface AdminBookingListItemDTO {
  id: string;
  bookedAt: Date;
  status: BookingStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  userName?: string | null;
  userEmail: string;
  vendorId: string;
  vendorName: string;
  vendorStatus: VendorStatus;
  serviceId?: string | null;
  serviceName?: string | null;
  hasPaymentProof: boolean;
}

export interface AdminBookingDetailDTO extends AdminBookingListItemDTO {
  user: {
    id: string;
    name?: string | null;
    email: string;
    role: Role;
    suspendedAt?: Date | null;
    deletedAt?: Date | null;
  };
  vendor: {
    id: string;
    name: string;
    status: VendorStatus;
    categoryName?: string | null;
    ownerName?: string | null;
    ownerEmail?: string | null;
    deletedAt?: Date | null;
    suspendedAt?: Date | null;
  };
  service?: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    isActive: boolean;
  } | null;
  paymentProof?: PaymentProofDTO | null;
}

export interface PaymentProofDTO {
  id: string;
  bookingId: string;
  fileUrl: string;
  note?: string | null;
  status: PaymentProofStatus;
  verifiedById?: string | null;
  verifiedAt?: Date | null;
  rejectedById?: string | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
  verificationNote?: string | null;
  overriddenById?: string | null;
  overriddenAt?: Date | null;
  overrideReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentProofStatusHistoryDTO {
  id: string;
  paymentProofId: string;
  previousStatus?: PaymentProofStatus | null;
  newStatus: PaymentProofStatus;
  changedById?: string | null;
  changedByName?: string | null;
  note?: string | null;
  isOverride: boolean;
  createdAt: Date;
}

export interface AdminPaymentProofListItemDTO {
  id: string;
  bookingId: string;
  paymentProofStatus: PaymentProofStatus;
  bookingStatus: BookingStatus;
  fileUrl: string;
  uploadedAt: Date;
  updatedAt: Date;
  userId: string;
  userName?: string | null;
  userEmail: string;
  vendorId: string;
  vendorName: string;
  vendorStatus: VendorStatus;
  verifiedAt?: Date | null;
  rejectedAt?: Date | null;
  overriddenAt?: Date | null;
}

export interface AdminPaymentProofDetailDTO extends AdminPaymentProofListItemDTO {
  note?: string | null;
  verificationNote?: string | null;
  rejectionReason?: string | null;
  overrideReason?: string | null;
  verifiedById?: string | null;
  verifiedByName?: string | null;
  rejectedById?: string | null;
  rejectedByName?: string | null;
  overriddenById?: string | null;
  overriddenByName?: string | null;
  booking: {
    id: string;
    bookedAt: Date;
    status: BookingStatus;
    notes?: string | null;
    serviceId?: string | null;
    serviceName?: string | null;
  };
  user: {
    id: string;
    name?: string | null;
    email: string;
    role: Role;
  };
  vendor: {
    id: string;
    name: string;
    status: VendorStatus;
    ownerName?: string | null;
    ownerEmail?: string | null;
    categoryName?: string | null;
  };
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
  phoneNumber?: string;
  priceRange?: string;
  categoryId?: string;
}

export interface UpdateVendorInput {
  name?: string;
  description?: string;
  location?: string;
  contactInfo?: string;
  phoneNumber?: string | null;
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
  note?: string;
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

export interface AdminVendorsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: VendorStatus;
  sortBy?: "createdAt" | "updatedAt" | "name";
  sortDirection?: "asc" | "desc";
  includeDeleted?: boolean;
}

export interface AdminBookingsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: BookingStatus;
  bookedFrom?: Date;
  bookedTo?: Date;
  vendor?: string;
  user?: string;
  sortBy?: "bookedAt" | "createdAt" | "updatedAt" | "status";
  sortDirection?: "asc" | "desc";
}

export interface CreatePaymentProofInput {
  bookingId: string;
  fileUrl: string;
  note?: string;
}

export interface VerifyPaymentProofInput {
  verifiedById: string;
  verifiedAt?: Date;
  verificationNote?: string;
}

export interface AdminPaymentProofsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  paymentProofStatus?: PaymentProofStatus;
  bookingStatus?: BookingStatus;
  vendor?: string;
  uploadedFrom?: Date;
  uploadedTo?: Date;
  sortBy?: "createdAt" | "updatedAt" | "status" | "verifiedAt";
  sortDirection?: "asc" | "desc";
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
