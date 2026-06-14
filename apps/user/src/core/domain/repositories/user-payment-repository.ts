import type {
  BookingStatus,
  CreateAuditLogInput,
  PaginatedResult,
  PaymentProofStatus,
  PaymentProofStatusHistoryDTO,
  PaymentStatus,
  PaymentTermStatus,
  PaymentType,
} from "@wo/shared-types";

export interface UserPaymentsQuery {
  page: number;
  limit: number;
  status?: PaymentProofStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface UserPaymentVendorSnapshotDTO {
  id: string;
  businessName: string;
  city?: string | null;
  province?: string | null;
}

export interface UserPaymentServiceSnapshotDTO {
  id: string;
  name: string;
  price: number;
}

export interface UserPaymentProofSummaryDTO {
  id: string;
  paymentTermId: string;
  amount: number;
  fileUrl: string;
  status: PaymentProofStatus;
  note?: string | null;
  verificationNote?: string | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPaymentTermItemDTO {
  id: string;
  bookingId: string;
  type: PaymentType;
  amount: number;
  status: PaymentTermStatus;
  dueDate?: Date | null;
  sequence: number;
  latestProof: UserPaymentProofSummaryDTO | null;
}

export interface UserBookingPaymentSummaryDTO {
  bookingId: string;
  bookingCode: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  totalPaidAmount: number;
  remainingBalance: number;
  vendor: UserPaymentVendorSnapshotDTO;
  service: UserPaymentServiceSnapshotDTO | null;
  terms: UserPaymentTermItemDTO[];
}

export interface UserPaymentProofListItemDTO {
  id: string;
  bookingId: string;
  bookingCode: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentTermId: string;
  paymentTermType: PaymentType;
  paymentTermStatus: PaymentTermStatus;
  paymentTermSequence: number;
  amount: number;
  fileUrl: string;
  status: PaymentProofStatus;
  uploadedAt: Date;
  updatedAt: Date;
  vendor: UserPaymentVendorSnapshotDTO;
  service: UserPaymentServiceSnapshotDTO | null;
  verificationNote?: string | null;
  rejectionReason?: string | null;
}

export interface UserPaymentProofDetailDTO extends UserPaymentProofListItemDTO {
  note?: string | null;
  history: PaymentProofStatusHistoryDTO[];
}

export interface UserPaymentTermUploadContextDTO {
  bookingId: string;
  bookingCode: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  vendor: UserPaymentVendorSnapshotDTO;
  service: UserPaymentServiceSnapshotDTO | null;
  term: UserPaymentTermItemDTO;
}

export interface CreateUserPaymentProofInput {
  bookingId: string;
  paymentTermId: string;
  uploadedById: string;
  amount: number;
  fileUrl: string;
  note?: string;
}

export type UserPaymentAuditLogInput = Omit<CreateAuditLogInput, "targetId">;

export interface UserPaymentRepository {
  listPaymentProofsByUser(
    userId: string,
    query: UserPaymentsQuery
  ): Promise<PaginatedResult<UserPaymentProofListItemDTO>>;
  findPaymentProofByIdForUser(paymentProofId: string, userId: string): Promise<UserPaymentProofDetailDTO | null>;
  findBookingPaymentsByBookingIdForUser(
    bookingId: string,
    userId: string
  ): Promise<UserBookingPaymentSummaryDTO | null>;
  findPaymentTermByIdForUser(
    paymentTermId: string,
    userId: string
  ): Promise<UserPaymentTermUploadContextDTO | null>;
  createPaymentProofUpload(
    input: CreateUserPaymentProofInput,
    auditLog: UserPaymentAuditLogInput
  ): Promise<UserPaymentProofDetailDTO>;
}
