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

export enum ReviewStatus {
  VISIBLE = "VISIBLE",
  HIDDEN = "HIDDEN",
  DELETED = "DELETED",
}

export enum ReviewModerationAction {
  HIDE = "HIDE",
  UNHIDE = "UNHIDE",
  DELETE = "DELETE",
}

export enum AuditModule {
  USER_MANAGEMENT = "USER_MANAGEMENT",
  VENDOR_MANAGEMENT = "VENDOR_MANAGEMENT",
  VENDOR_PROFILE = "VENDOR_PROFILE",
  BOOKING_MANAGEMENT = "BOOKING_MANAGEMENT",
  PAYMENT_MONITORING = "PAYMENT_MONITORING",
  REVIEW_MODERATION = "REVIEW_MODERATION",
}

export enum DashboardTimeRange {
  TODAY = "TODAY",
  LAST_7_DAYS = "LAST_7_DAYS",
  LAST_30_DAYS = "LAST_30_DAYS",
  LAST_90_DAYS = "LAST_90_DAYS",
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

export const INDONESIAN_PHONE_REGEX = /^(\+?62|0)\d{8,13}$/;

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
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface CreateAuditLogInput {
  actorId: string;
  module: AuditModule;
  action: string;
  targetId: string;
  beforeData?: unknown;
  afterData?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export interface AdminAuditLogListItemDTO extends AuditLogDTO {
  actorName?: string | null;
  actorEmail: string;
  targetPath?: string | null;
}

export interface AdminAuditLogDetailDTO extends AdminAuditLogListItemDTO {}

export interface DashboardPermissionMapDTO {
  dashboard: boolean;
  users: boolean;
  vendors: boolean;
  bookings: boolean;
  payments: boolean;
  reviews: boolean;
  auditLogs: boolean;
}

export interface DashboardKpiSummaryDTO {
  key: string;
  title: string;
  count: number;
  href: string;
  trendPercentage?: number | null;
}

export interface DashboardStatusMetricDTO {
  status: string;
  label: string;
  count: number;
}

export interface DashboardTopVendorDTO {
  vendorId: string;
  vendorName: string;
  metricValue: number;
  metricLabel: string;
  href: string;
}

export interface DashboardRecentActivityDTO {
  id: string;
  actorName?: string | null;
  actorEmail?: string | null;
  action: string;
  module: AuditModule;
  targetId: string;
  createdAt: Date;
  detailPath: string;
  targetPath?: string | null;
}

export interface DashboardPendingActionDTO {
  key: string;
  title: string;
  description: string;
  count: number;
  href: string;
  ctaLabel: string;
}

export interface DashboardQuickActionDTO {
  key: string;
  title: string;
  description: string;
  href: string;
}

export interface AdminDashboardBookingsOverviewDTO {
  range: DashboardTimeRange;
  total: number;
  statuses: DashboardStatusMetricDTO[];
}

export interface AdminDashboardVendorsOverviewDTO {
  total: number;
  statuses: DashboardStatusMetricDTO[];
  topByBookings: DashboardTopVendorDTO[];
  topByRatings: DashboardTopVendorDTO[];
}

export interface AdminDashboardPaymentsOverviewDTO {
  range: DashboardTimeRange;
  total: number;
  statuses: DashboardStatusMetricDTO[];
}

export interface DashboardReviewRatingDistributionDTO {
  rating: number;
  count: number;
}

export interface AdminDashboardReviewsOverviewDTO {
  range: DashboardTimeRange;
  total: number;
  averageRating: number;
  statuses: DashboardStatusMetricDTO[];
  ratingDistribution: DashboardReviewRatingDistributionDTO[];
}

export interface AdminDashboardOverviewDTO {
  timeRange: DashboardTimeRange;
  permissions: DashboardPermissionMapDTO;
  kpis: DashboardKpiSummaryDTO[];
  bookings?: AdminDashboardBookingsOverviewDTO | null;
  vendors?: AdminDashboardVendorsOverviewDTO | null;
  payments?: AdminDashboardPaymentsOverviewDTO | null;
  reviews?: AdminDashboardReviewsOverviewDTO | null;
  recentActivities?: DashboardRecentActivityDTO[] | null;
  pendingActions: DashboardPendingActionDTO[];
  quickActions: DashboardQuickActionDTO[];
}

export interface CategoryDTO {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCategoryListItemDTO extends CategoryDTO {
  vendorCount: number;
}

export interface AdminCategoryDetailDTO extends AdminCategoryListItemDTO {}

export interface AdminCategoriesQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortDirection?: "asc" | "desc";
}

export interface VendorDTO {
  id: string;
  ownerId: string;
  name: string;
  businessName?: string | null;
  description?: string | null;
  businessType?: string | null;
  establishedYear?: number | null;
  location?: string | null;
  businessAddress?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  contactInfo?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  priceRange?: string | null;
  categoryId?: string | null;
  status: VendorStatus;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  rejectedAt?: Date | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  resubmittedAt?: Date | null;
  suspendedAt?: Date | null;
  suspendedBy?: string | null;
  suspensionReason?: string | null;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorVerificationChecklistDTO {
  businessNameExists: boolean;
  categoryExists: boolean;
  phoneNumberValid: boolean;
  addressCompleted: boolean;
  hasMinimumService: boolean;
  hasMinimumPortfolio: boolean;
  isComplete: boolean;
}

export enum VendorOnboardingStatus {
  INCOMPLETE = "INCOMPLETE",
  READY_FOR_REVIEW = "READY_FOR_REVIEW",
}

export interface VendorSessionDTO {
  userId: string;
  vendorId: string;
  email: string;
  role: Role.VENDOR;
  vendorStatus: VendorStatus;
  ownerName?: string | null;
  businessName?: string | null;
  rejectionReason?: string | null;
  rejectedAt?: Date | null;
  suspensionReason?: string | null;
  suspendedAt?: Date | null;
}

export interface VendorOnboardingDTO {
  vendorId: string;
  ownerName?: string | null;
  email: string;
  status: VendorStatus;
  onboardingStatus: VendorOnboardingStatus;
  businessName?: string | null;
  description?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  phoneNumber?: string | null;
  businessAddress?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  whatsappNumber?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  businessType?: string | null;
  establishedYear?: number | null;
  rejectionReason?: string | null;
  rejectedAt?: Date | null;
  resubmittedAt?: Date | null;
  suspendedAt?: Date | null;
  suspensionReason?: string | null;
  servicesCount: number;
  portfolioCount: number;
  checklist: VendorVerificationChecklistDTO;
}

export interface VendorProfileDTO extends VendorOnboardingDTO {
  approvedAt?: Date | null;
  approvedById?: string | null;
  rejectedById?: string | null;
}

export interface AdminVendorListItemDTO {
  id: string;
  name: string;
  businessName?: string | null;
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
  businessAddress?: string | null;
  city?: string | null;
  province?: string | null;
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
  status: ReviewStatus;
  hiddenAt?: Date | null;
  hiddenById?: string | null;
  deletedAt?: Date | null;
  deletedById?: string | null;
  moderationReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewModerationHistoryDTO {
  id: string;
  reviewId: string;
  action: ReviewModerationAction;
  reason?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  beforeData?: unknown;
  afterData?: unknown;
  createdAt: Date;
}

export interface AdminReviewListItemDTO {
  id: string;
  bookingId: string;
  rating: number;
  comment?: string | null;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
  reviewerId: string;
  reviewerName?: string | null;
  reviewerEmail: string;
  vendorId: string;
  vendorName: string;
  bookingStatus: BookingStatus;
}

export interface AdminReviewDetailDTO extends AdminReviewListItemDTO {
  moderationReason?: string | null;
  hiddenAt?: Date | null;
  hiddenById?: string | null;
  hiddenByName?: string | null;
  deletedAt?: Date | null;
  deletedById?: string | null;
  deletedByName?: string | null;
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

export interface UpdateCategoryInput {
  name: string;
}

export interface CreateVendorInput {
  ownerId: string;
  name: string;
  businessName?: string;
  description?: string;
  location?: string;
  businessAddress?: string;
  city?: string;
  province?: string;
  contactInfo?: string;
  phoneNumber?: string;
  priceRange?: string;
  categoryId?: string;
}

export interface UpdateVendorInput {
  name?: string;
  businessName?: string;
  description?: string;
  location?: string;
  businessAddress?: string;
  city?: string;
  province?: string;
  contactInfo?: string;
  phoneNumber?: string | null;
  priceRange?: string;
  categoryId?: string | null;
}

export interface VendorRegistrationInput {
  ownerName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  categoryId: string;
  businessAddress: string;
  city: string;
  province: string;
  initialService: {
    name: string;
    description?: string;
    price: number;
    isActive?: boolean;
  };
  initialPortfolio: {
    title?: string;
    description?: string;
    mediaUrl: string;
    mediaType: MediaType;
  };
}

export interface UpdateVendorOnboardingInput {
  businessName: string;
  description?: string;
  categoryId: string;
  phoneNumber: string;
  businessAddress: string;
  city: string;
  province: string;
}

export interface UpdateVendorProfileInput {
  businessName: string;
  description?: string;
  categoryId: string;
  businessType?: string;
  establishedYear?: number;
  phoneNumber: string;
  whatsappNumber?: string;
  website?: string;
  businessAddress: string;
  city: string;
  province: string;
  postalCode?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
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

export interface AdminReviewsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ReviewStatus;
  rating?: number;
  vendor?: string;
  createdFrom?: Date;
  createdTo?: Date;
  sortBy?: "createdAt" | "updatedAt" | "rating" | "status";
  sortDirection?: "asc" | "desc";
}

export interface AdminAuditLogsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  module?: AuditModule;
  action?: string;
  actor?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "createdAt";
  sortDirection?: "asc" | "desc";
}

export interface AdminDashboardOverviewQuery {
  timeRange?: DashboardTimeRange;
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

export interface UpdatePortfolioInput {
  title?: string;
  description?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
}
