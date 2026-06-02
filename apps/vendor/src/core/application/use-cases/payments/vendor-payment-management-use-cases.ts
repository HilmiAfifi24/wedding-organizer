import { AuditModule, BookingStatus, PaymentProofStatus, VendorStatus } from "@wo/shared-types";

import type { VendorPaymentManagementRepository } from "@/core/domain/repositories/vendor-payment-management-repository";

import type {
  ParsedVendorPaymentListQuery,
  VendorPaymentDetailResponse,
  VendorPaymentHistoryResponse,
  VendorPaymentListResponse,
} from "../../dto/payments/vendor-payment-management-dto";

const defaultSortBy: ParsedVendorPaymentListQuery["sortBy"] = "createdAt";
const defaultSortDirection: ParsedVendorPaymentListQuery["sortDirection"] = "desc";

const toPagedResult = (
  query: Pick<ParsedVendorPaymentListQuery, "page" | "pageSize">,
  totalItems: number,
  items: VendorPaymentListResponse["items"]
): VendorPaymentListResponse => ({
  items,
  page: query.page,
  pageSize: query.pageSize,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
});

const assertVendorCanManagePayments = (status: VendorStatus) => {
  if (status !== VendorStatus.APPROVED) {
    throw new Error("Forbidden: only approved vendor can manage payments");
  }
};

const createAuditPayload = (
  actorId: string,
  action: string,
  targetId: string,
  beforeData: unknown,
  afterData: unknown
) => ({
  actorId,
  module: AuditModule.VENDOR_PAYMENTS,
  action,
  targetId,
  beforeData,
  afterData,
});

export class ListVendorPaymentProofsUseCase {
  constructor(private readonly repository: VendorPaymentManagementRepository) {}

  async execute(
    input: { vendorId: string; vendorStatus: VendorStatus },
    query: ParsedVendorPaymentListQuery
  ): Promise<VendorPaymentListResponse> {
    assertVendorCanManagePayments(input.vendorStatus);

    const normalizedQuery: ParsedVendorPaymentListQuery = {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      paymentProofStatus: query.paymentProofStatus,
      customer: query.customer,
      bookedFrom: query.bookedFrom,
      bookedTo: query.bookedTo,
      uploadedFrom: query.uploadedFrom,
      uploadedTo: query.uploadedTo,
      sortBy: query.sortBy ?? defaultSortBy,
      sortDirection: query.sortDirection ?? defaultSortDirection,
    };

    const result = await this.repository.listPaymentProofs(input.vendorId, normalizedQuery);
    return toPagedResult(normalizedQuery, result.totalItems, result.items);
  }
}

export class GetVendorPaymentProofDetailUseCase {
  constructor(private readonly repository: VendorPaymentManagementRepository) {}

  async execute(input: {
    vendorId: string;
    vendorStatus: VendorStatus;
    paymentProofId: string;
  }): Promise<VendorPaymentDetailResponse> {
    assertVendorCanManagePayments(input.vendorStatus);

    const paymentProof = await this.repository.getPaymentProofById(input.vendorId, input.paymentProofId);
    if (!paymentProof) {
      throw new Error("Payment proof not found");
    }

    return paymentProof;
  }
}

export class GetVendorPaymentProofHistoryUseCase {
  constructor(private readonly repository: VendorPaymentManagementRepository) {}

  async execute(input: {
    vendorId: string;
    vendorStatus: VendorStatus;
    paymentProofId: string;
  }): Promise<VendorPaymentHistoryResponse> {
    assertVendorCanManagePayments(input.vendorStatus);

    const paymentProof = await this.repository.getPaymentProofById(input.vendorId, input.paymentProofId);
    if (!paymentProof) {
      throw new Error("Payment proof not found");
    }

    return this.repository.getPaymentProofHistory(input.vendorId, input.paymentProofId);
  }
}

export class VerifyVendorPaymentProofUseCase {
  constructor(private readonly repository: VendorPaymentManagementRepository) {}

  async execute(
    input: {
      actorId: string;
      vendorId: string;
      vendorStatus: VendorStatus;
      paymentProofId: string;
    },
    payload: { verificationNote?: string }
  ) {
    assertVendorCanManagePayments(input.vendorStatus);

    const before = await this.repository.getPaymentProofById(input.vendorId, input.paymentProofId);
    if (!before) {
      throw new Error("Payment proof not found");
    }

    if (before.paymentProofStatus !== PaymentProofStatus.PENDING) {
      throw new Error("Only pending payment proof can be verified");
    }

    if (before.bookingStatus !== BookingStatus.PENDING_PAYMENT) {
      throw new Error("Payment verification is only allowed when booking status is PENDING_PAYMENT");
    }

    const result = await this.repository.verifyPaymentProof({
      vendorId: input.vendorId,
      paymentProofId: input.paymentProofId,
      actorId: input.actorId,
      verificationNote: payload.verificationNote,
    });

    await this.repository.createAuditLog(
      createAuditPayload(
        input.actorId,
        "VENDOR_VERIFY_PAYMENT",
        input.paymentProofId,
        before,
        result.paymentProof
      )
    );

    if (result.bookingStatusChanged) {
      await this.repository.createAuditLog(
        createAuditPayload(
          input.actorId,
          "BOOKING_CONFIRMED_BY_VENDOR_PAYMENT_VERIFICATION",
          result.paymentProof.booking.id,
          { bookingStatus: result.previousBookingStatus },
          {
            bookingStatus: result.paymentProof.booking.status,
            paymentProofId: result.paymentProof.id,
          }
        )
      );
    }

    return result.paymentProof;
  }
}

export class RejectVendorPaymentProofUseCase {
  constructor(private readonly repository: VendorPaymentManagementRepository) {}

  async execute(
    input: {
      actorId: string;
      vendorId: string;
      vendorStatus: VendorStatus;
      paymentProofId: string;
    },
    payload: { reason: string }
  ) {
    assertVendorCanManagePayments(input.vendorStatus);

    const before = await this.repository.getPaymentProofById(input.vendorId, input.paymentProofId);
    if (!before) {
      throw new Error("Payment proof not found");
    }

    if (before.paymentProofStatus !== PaymentProofStatus.PENDING) {
      throw new Error("Only pending payment proof can be rejected");
    }

    if (before.bookingStatus !== BookingStatus.PENDING_PAYMENT) {
      throw new Error("Payment rejection is only allowed when booking status is PENDING_PAYMENT");
    }

    const result = await this.repository.rejectPaymentProof({
      vendorId: input.vendorId,
      paymentProofId: input.paymentProofId,
      actorId: input.actorId,
      rejectionReason: payload.reason,
    });

    await this.repository.createAuditLog(
      createAuditPayload(
        input.actorId,
        "VENDOR_REJECT_PAYMENT",
        input.paymentProofId,
        before,
        result.paymentProof
      )
    );

    return result.paymentProof;
  }
}
