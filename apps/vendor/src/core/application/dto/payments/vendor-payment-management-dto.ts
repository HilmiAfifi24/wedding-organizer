import type {
  BookingStatus,
  PaginatedResult,
  PaymentProofStatus,
  PaymentProofStatusHistoryDTO,
  PaymentTermStatus,
  PaymentType,
  VendorStatus,
} from "@wo/shared-types";

export interface VendorPaymentListItemDTO {
  id: string;
  bookingId: string;
  paymentTermId?: string;
  paymentTermType?: PaymentType;
  paymentTermStatus?: PaymentTermStatus;
  paymentTermSequence?: number;
  amount?: number | null;
  bookingDate: Date;
  bookingStatus: BookingStatus;
  paymentProofStatus: PaymentProofStatus;
  fileUrl: string;
  uploadedAt: Date;
  updatedAt: Date;
  customerId: string;
  customerName?: string | null;
  customerEmail: string;
  customerPhone?: string | null;
  serviceName?: string | null;
  totalAmount?: number | null;
  verifiedAt?: Date | null;
  rejectedAt?: Date | null;
}

export interface VendorPaymentDetailDTO extends VendorPaymentListItemDTO {
  note?: string | null;
  verificationNote?: string | null;
  rejectionReason?: string | null;
  verifiedById?: string | null;
  verifiedByName?: string | null;
  rejectedById?: string | null;
  rejectedByName?: string | null;
  booking: {
    id: string;
    bookedAt: Date;
    status: BookingStatus;
    notes?: string | null;
    serviceId?: string | null;
    serviceName?: string | null;
    packageName?: string | null;
    totalAmount?: number | null;
  };
  user: {
    id: string;
    name?: string | null;
    email: string;
    phone?: string | null;
  };
  vendor: {
    id: string;
    name: string;
    status: VendorStatus;
  };
}

export interface ParsedVendorPaymentListQuery {
  page: number;
  pageSize: number;
  search?: string;
  paymentProofStatus?: PaymentProofStatus;
  customer?: string;
  bookedFrom?: Date;
  bookedTo?: Date;
  uploadedFrom?: Date;
  uploadedTo?: Date;
  sortBy: "bookedAt" | "createdAt" | "updatedAt" | "status";
  sortDirection: "asc" | "desc";
}

export type VendorPaymentListResponse = PaginatedResult<VendorPaymentListItemDTO>;
export type VendorPaymentDetailResponse = VendorPaymentDetailDTO;
export type VendorPaymentHistoryResponse = PaymentProofStatusHistoryDTO[];
