import type {
  AuditModule,
  BookingStatus,
  BookingStatusHistoryDTO,
  CreateAuditLogInput,
  ListOptions,
  PaymentStatus,
  PaymentTermStatus,
  PaymentType,
} from "@wo/shared-types";

export interface BookingVendorSnapshotDTO {
  id: string;
  businessName: string;
  city?: string | null;
  province?: string | null;
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
  customerName: string;
  createdAt: Date;
  vendor: BookingVendorSnapshotDTO;
  service: Pick<BookingServiceSnapshotDTO, "id" | "name" | "price"> | null;
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
  service: BookingServiceSnapshotDTO | null;
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
  listByUser(userId: string, options?: ListOptions): Promise<UserBookingListItemDTO[]>;
}
