import type {
  AuditModule,
  BookingStatus,
  BookingStatusHistoryDTO,
  CreateAuditLogInput,
  ListOptions,
  PaginatedResult,
  PaymentProofStatus,
  PaymentProofStatusHistoryDTO,
  PaymentStatus,
  PaymentTermStatus,
  PaymentType,
} from "@wo/shared-types";

export interface BookingVendorSnapshotDTO {
  id: string;
  businessName: string;
  categoryName?: string | null;
  city?: string | null;
  province?: string | null;
  contactInfo?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
}

export interface BookingServiceSnapshotDTO {
  id: string;
  vendorId: string;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
}

export interface BookingTargetSnapshotDTO {
  vendor: {
    id: string;
    businessName: string;
    status: string;
    deletedAt?: Date | null;
    suspendedAt?: Date | null;
    city?: string | null;
    province?: string | null;
    coverImageUrl?: string | null;
    logoUrl?: string | null;
  } | null;
  service: BookingServiceSnapshotDTO | null;
}

export interface CreateUserBookingInput {
  vendorId: string;
  serviceId: string;
  eventDate: Date;
  eventLocation: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  guestCount?: number;
  notes?: string;
  specialRequest?: string;
}

export interface CreateUserBookingRecordInput extends CreateUserBookingInput {
  userId: string;
  totalAmount: number;
  paymentTerms: Array<{
    type: PaymentType;
    amount: number;
    status: PaymentTermStatus;
    dueDate?: Date | null;
    sequence: number;
  }>;
}

export interface UserBookingListItemDTO {
  id: string;
  bookingCode: string;
  eventDate: Date;
  eventLocation: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  remainingBalance: number;
  customerName: string;
  createdAt: Date;
  vendor: BookingVendorSnapshotDTO;
  service: Pick<BookingServiceSnapshotDTO, "id" | "name" | "price"> | null;
}

export interface UserBookingPaymentProofItemDTO {
  id: string;
  bookingId: string;
  paymentTermId: string;
  paymentTermType: PaymentType;
  paymentTermSequence: number;
  amount: number;
  fileUrl: string;
  status: PaymentProofStatus;
  note?: string | null;
  verificationNote?: string | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  history: PaymentProofStatusHistoryDTO[];
}

export interface UserBookingPaymentTermItemDTO {
  id: string;
  bookingId: string;
  type: PaymentType;
  amount: number;
  status: PaymentTermStatus;
  dueDate?: Date | null;
  sequence: number;
  latestProof: Pick<
    UserBookingPaymentProofItemDTO,
    "id" | "paymentTermId" | "amount" | "fileUrl" | "status" | "note" | "verificationNote" | "rejectionReason" | "createdAt" | "updatedAt"
  > | null;
}

export interface UserBookingTimelineItemDTO {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  actorName?: string | null;
  createdAt: Date;
}

export interface UserBookingDetailDTO extends UserBookingListItemDTO {
  userId: string;
  vendorId: string;
  serviceId?: string | null;
  bookedAt: Date;
  customerPhone: string;
  customerEmail: string;
  guestCount?: number | null;
  notes?: string | null;
  specialRequest?: string | null;
  updatedAt: Date;
  history: BookingStatusHistoryDTO[];
  totalPaidAmount: number;
  paymentTerms: UserBookingPaymentTermItemDTO[];
  paymentProofs: UserBookingPaymentProofItemDTO[];
  timeline: UserBookingTimelineItemDTO[];
  service: BookingServiceSnapshotDTO | null;
}

export type UserBookingListSort = "newest" | "oldest" | "event-date-nearest";

export interface UserBookingListQuery {
  page: number;
  limit: number;
  search?: string;
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
  eventDateFrom?: Date;
  eventDateTo?: Date;
  sort: UserBookingListSort;
}

export interface BookingAuditLogInput
  extends Omit<CreateAuditLogInput, "module" | "action" | "targetId"> {
  module?: AuditModule;
  action?: string;
}

export interface DuplicateBookingCheckInput {
  userId: string;
  vendorId: string;
  serviceId: string;
  eventDate: Date;
  excludeBookingId?: string;
}

export interface BookingRepository {
  getBookingTarget(vendorId: string, serviceId: string): Promise<BookingTargetSnapshotDTO>;
  hasActiveDuplicateBooking(input: DuplicateBookingCheckInput): Promise<boolean>;
  create(input: CreateUserBookingRecordInput, auditLog: BookingAuditLogInput): Promise<UserBookingDetailDTO>;
  findDetailByIdForUser(id: string, userId: string): Promise<UserBookingDetailDTO | null>;
  listByUser(
    userId: string,
    query: UserBookingListQuery,
    options?: ListOptions
  ): Promise<PaginatedResult<UserBookingListItemDTO>>;
  findTimelineByBookingIdForUser(
    bookingId: string,
    userId: string
  ): Promise<UserBookingTimelineItemDTO[] | null>;
}
