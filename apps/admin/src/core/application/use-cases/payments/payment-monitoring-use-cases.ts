import {
  AuditModule,
  BookingStatus,
  PaymentProofStatus,
  type CreateAuditLogInput,
} from "@wo/shared-types";

import {
  PAYMENT_MONITORING_MENU_CODE,
  type PaymentMonitoringPermissionFlags,
} from "@/core/domain/entities/payment-monitoring";
import type { PaymentMonitoringRepository } from "@/core/domain/repositories";

import type {
  ParsedPaymentProofListQuery,
  PaymentProofDetailResponse,
  PaymentProofHistoryResponse,
  PaymentProofListResponse,
} from "../../dto/payments/payment-monitoring-dto";

const assertPermission = (
  permission: PaymentMonitoringPermissionFlags | null,
  key: keyof PaymentMonitoringPermissionFlags,
  message: string
) => {
  if (!permission || !permission[key]) {
    throw new Error(message);
  }
};

const defaultSortBy: NonNullable<ParsedPaymentProofListQuery["sortBy"]> = "createdAt";
const defaultSortDirection: NonNullable<ParsedPaymentProofListQuery["sortDirection"]> = "desc";

const toPagedResult = (
  query: Pick<ParsedPaymentProofListQuery, "page" | "pageSize">,
  totalItems: number,
  items: PaymentProofListResponse["items"]
): PaymentProofListResponse => ({
  items,
  page: query.page,
  pageSize: query.pageSize,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
});

const createAuditPayload = (
  actorId: string,
  module: AuditModule,
  action: string,
  targetId: string,
  beforeData: unknown,
  afterData: unknown
): CreateAuditLogInput => ({
  actorId,
  module,
  action,
  targetId,
  beforeData,
  afterData,
});

const normalizeOverrideReason = (reason: string) => {
  const normalized = reason.trim();
  if (!normalized) {
    throw new Error("Override reason is required");
  }

  return normalized;
};

export class ListAdminPaymentProofsUseCase {
  constructor(private readonly repository: PaymentMonitoringRepository) {}

  async execute(actorId: string, query: ParsedPaymentProofListQuery): Promise<PaymentProofListResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      PAYMENT_MONITORING_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view payment proofs");

    const normalizedQuery: ParsedPaymentProofListQuery = {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      paymentProofStatus: query.paymentProofStatus,
      bookingStatus: query.bookingStatus,
      vendor: query.vendor,
      uploadedFrom: query.uploadedFrom,
      uploadedTo: query.uploadedTo,
      sortBy: query.sortBy ?? defaultSortBy,
      sortDirection: query.sortDirection ?? defaultSortDirection,
    };

    const result = await this.repository.listPaymentProofs(normalizedQuery);
    return toPagedResult(normalizedQuery, result.totalItems, result.items);
  }
}

export class GetAdminPaymentProofDetailUseCase {
  constructor(private readonly repository: PaymentMonitoringRepository) {}

  async execute(actorId: string, paymentProofId: string): Promise<PaymentProofDetailResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      PAYMENT_MONITORING_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view payment proof detail");

    const proof = await this.repository.getPaymentProofById(paymentProofId);
    if (!proof) {
      throw new Error("Payment proof not found");
    }

    return proof;
  }
}

export class GetAdminPaymentProofHistoryUseCase {
  constructor(private readonly repository: PaymentMonitoringRepository) {}

  async execute(actorId: string, paymentProofId: string): Promise<PaymentProofHistoryResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      PAYMENT_MONITORING_MENU_CODE
    );

    assertPermission(permission, "canHistory", "Forbidden: no permission to view payment verification history");

    const proof = await this.repository.getPaymentProofById(paymentProofId);
    if (!proof) {
      throw new Error("Payment proof not found");
    }

    return this.repository.getPaymentProofHistory(paymentProofId);
  }
}

export class ForceVerifyPaymentProofUseCase {
  constructor(private readonly repository: PaymentMonitoringRepository) {}

  async execute(actorId: string, paymentProofId: string, reason: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      PAYMENT_MONITORING_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to override payment proof");

    const before = await this.repository.getPaymentProofById(paymentProofId);
    if (!before) {
      throw new Error("Payment proof not found");
    }

    if (before.paymentProofStatus === PaymentProofStatus.VERIFIED) {
      throw new Error("Payment proof is already verified");
    }

    if (
      before.booking.status !== BookingStatus.PENDING_PAYMENT &&
      before.booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new Error(
        "Force verify is only allowed when booking status is PENDING_PAYMENT or CONFIRMED"
      );
    }

    const overrideReason = normalizeOverrideReason(reason);

    const result = await this.repository.forceVerifyPaymentProof({
      paymentProofId,
      actorId,
      reason: overrideReason,
    });

    await this.repository.createAuditLog(
      createAuditPayload(
        actorId,
        AuditModule.PAYMENT_MONITORING,
        "ADMIN_FORCE_VERIFY_PAYMENT",
        paymentProofId,
        before,
        {
          ...result.paymentProof,
          overrideReason,
          previousPaymentStatus: result.previousPaymentStatus,
        }
      )
    );

    await this.repository.createAuditLog(
      createAuditPayload(
        actorId,
        AuditModule.PAYMENT_MONITORING,
        "PAYMENT_OVERRIDE_REASON",
        paymentProofId,
        { paymentProofStatus: before.paymentProofStatus },
        { reason: overrideReason, newStatus: PaymentProofStatus.VERIFIED }
      )
    );

    if (result.bookingStatusChanged) {
      await this.repository.createAuditLog(
        createAuditPayload(
          actorId,
          AuditModule.PAYMENT_MONITORING,
          "BOOKING_STATUS_CHANGED_BY_ADMIN_PAYMENT_OVERRIDE",
          before.booking.id,
          { bookingStatus: result.previousBookingStatus },
          { bookingStatus: result.paymentProof.booking.status, paymentProofId }
        )
      );
    }

    return result.paymentProof;
  }
}

export class ForceRejectPaymentProofUseCase {
  constructor(private readonly repository: PaymentMonitoringRepository) {}

  async execute(actorId: string, paymentProofId: string, reason: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      PAYMENT_MONITORING_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to override payment proof");

    const before = await this.repository.getPaymentProofById(paymentProofId);
    if (!before) {
      throw new Error("Payment proof not found");
    }

    if (before.paymentProofStatus === PaymentProofStatus.REJECTED) {
      throw new Error("Payment proof is already rejected");
    }

    if (
      before.booking.status !== BookingStatus.PENDING_PAYMENT &&
      before.booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new Error(
        "Force reject is only allowed for bookings in PENDING_PAYMENT or CONFIRMED status"
      );
    }

    const overrideReason = normalizeOverrideReason(reason);

    const result = await this.repository.forceRejectPaymentProof({
      paymentProofId,
      actorId,
      reason: overrideReason,
    });

    await this.repository.createAuditLog(
      createAuditPayload(
        actorId,
        AuditModule.PAYMENT_MONITORING,
        "ADMIN_FORCE_REJECT_PAYMENT",
        paymentProofId,
        before,
        {
          ...result.paymentProof,
          overrideReason,
          previousPaymentStatus: result.previousPaymentStatus,
        }
      )
    );

    await this.repository.createAuditLog(
      createAuditPayload(
        actorId,
        AuditModule.PAYMENT_MONITORING,
        "PAYMENT_OVERRIDE_REASON",
        paymentProofId,
        { paymentProofStatus: before.paymentProofStatus },
        { reason: overrideReason, newStatus: PaymentProofStatus.REJECTED }
      )
    );

    if (result.bookingStatusChanged) {
      await this.repository.createAuditLog(
        createAuditPayload(
          actorId,
          AuditModule.PAYMENT_MONITORING,
          "BOOKING_STATUS_CHANGED_BY_ADMIN_PAYMENT_OVERRIDE",
          before.booking.id,
          { bookingStatus: result.previousBookingStatus },
          { bookingStatus: result.paymentProof.booking.status, paymentProofId }
        )
      );
    }

    return result.paymentProof;
  }
}
