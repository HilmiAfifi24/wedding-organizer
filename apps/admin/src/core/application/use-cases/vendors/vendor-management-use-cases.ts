import { AuditModule } from "@wo/shared-types";
import type { AdminVendorsQuery, CreateAuditLogInput } from "@wo/shared-types";

import {
  VENDOR_MANAGEMENT_MENU_CODE,
  evaluateVendorVerificationChecklist,
  type VendorPermissionFlags,
} from "@/core/domain/entities/vendor-management";
import type { VendorManagementRepository } from "@/core/domain/repositories";

import type {
  ParsedVendorListQuery,
  VendorDetailResponse,
  VendorListResponse,
} from "../../dto/vendors/vendor-management-dto";

const assertPermission = (
  permission: VendorPermissionFlags | null,
  key: keyof VendorPermissionFlags,
  message: string
) => {
  if (!permission || !permission[key]) {
    throw new Error(message);
  }
};

const defaultSortBy: NonNullable<AdminVendorsQuery["sortBy"]> = "createdAt";
const defaultSortDirection: NonNullable<AdminVendorsQuery["sortDirection"]> = "desc";

const toPagedResult = (
  query: Pick<ParsedVendorListQuery, "page" | "pageSize">,
  totalItems: number,
  items: VendorListResponse["items"]
): VendorListResponse => ({
  items,
  page: query.page,
  pageSize: query.pageSize,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
});

const createAuditPayload = (
  actorId: string,
  action: string,
  targetId: string,
  beforeData: unknown,
  afterData: unknown
): CreateAuditLogInput => ({
  actorId,
  module: AuditModule.VENDOR_MANAGEMENT,
  action,
  targetId,
  beforeData,
  afterData,
});

export class ListAdminVendorsUseCase {
  constructor(private readonly repository: VendorManagementRepository) {}

  async execute(actorId: string, query: ParsedVendorListQuery): Promise<VendorListResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      VENDOR_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view vendors");

    const normalizedQuery: ParsedVendorListQuery = {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      status: query.status,
      includeDeleted: permission?.canHistory ? query.includeDeleted : false,
      sortBy: query.sortBy ?? defaultSortBy,
      sortDirection: query.sortDirection ?? defaultSortDirection,
    };

    const result = await this.repository.listVendors(normalizedQuery);
    return toPagedResult(normalizedQuery, result.totalItems, result.items);
  }
}

export class GetAdminVendorDetailUseCase {
  constructor(private readonly repository: VendorManagementRepository) {}

  async execute(
    actorId: string,
    vendorId: string,
    options?: { includeHistory?: boolean; includeDeleted?: boolean }
  ): Promise<VendorDetailResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      VENDOR_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view vendors");

    const includeHistory = options?.includeHistory ?? false;
    const includeDeleted = permission?.canHistory ? options?.includeDeleted ?? false : false;

    if (includeHistory) {
      assertPermission(permission, "canHistory", "Forbidden: no permission to view history");
    }

    const vendor = await this.repository.getVendorById(vendorId, includeDeleted);
    if (!vendor) {
      throw new Error("Vendor not found");
    }

    if (!includeHistory) {
      return {
        ...vendor,
        history: [],
      };
    }

    return vendor;
  }
}

export class ApproveVendorUseCase {
  constructor(private readonly repository: VendorManagementRepository) {}

  async execute(actorId: string, vendorId: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      VENDOR_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to approve vendor");

    const before = await this.repository.getVendorById(vendorId, true);
    if (!before) {
      throw new Error("Vendor not found");
    }

    if (before.deletedAt) {
      throw new Error("Cannot approve deleted vendor");
    }

    if (before.status === "approved") {
      return before;
    }

    const checklist = evaluateVendorVerificationChecklist({
      businessName: before.name,
      categoryId: before.categoryId,
      phoneNumber: before.phoneNumber,
      serviceCount: before.services.length,
      portfolioCount: before.portfolio.length,
    });

    if (!checklist.isComplete) {
      throw new Error("Vendor verification checklist is incomplete");
    }

    const after = await this.repository.approveVendor(vendorId, actorId);

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "APPROVE_VENDOR", vendorId, before, after)
    );

    return after;
  }
}

export class RejectVendorUseCase {
  constructor(private readonly repository: VendorManagementRepository) {}

  async execute(actorId: string, vendorId: string, reason: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      VENDOR_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to reject vendor");

    const before = await this.repository.getVendorById(vendorId, true);
    if (!before) {
      throw new Error("Vendor not found");
    }

    if (before.deletedAt) {
      throw new Error("Cannot reject deleted vendor");
    }

    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      throw new Error("Rejection reason is required");
    }

    const after = await this.repository.rejectVendor(vendorId, actorId, normalizedReason);

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "REJECT_VENDOR", vendorId, before, after)
    );

    return after;
  }
}

export class SuspendVendorUseCase {
  constructor(private readonly repository: VendorManagementRepository) {}

  async execute(actorId: string, vendorId: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      VENDOR_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to suspend vendor");

    const before = await this.repository.getVendorById(vendorId, true);
    if (!before) {
      throw new Error("Vendor not found");
    }

    if (before.deletedAt) {
      throw new Error("Cannot suspend deleted vendor");
    }

    const after = await this.repository.suspendVendor(vendorId, actorId);

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "SUSPEND_VENDOR", vendorId, before, after)
    );

    return after;
  }
}

export class UnsuspendVendorUseCase {
  constructor(private readonly repository: VendorManagementRepository) {}

  async execute(actorId: string, vendorId: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      VENDOR_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to unsuspend vendor");

    const before = await this.repository.getVendorById(vendorId, true);
    if (!before) {
      throw new Error("Vendor not found");
    }

    if (before.deletedAt) {
      throw new Error("Cannot unsuspend deleted vendor");
    }

    const after = await this.repository.unsuspendVendor(vendorId);

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "UNSUSPEND_VENDOR", vendorId, before, after)
    );

    return after;
  }
}

export class SoftDeleteVendorUseCase {
  constructor(private readonly repository: VendorManagementRepository) {}

  async execute(actorId: string, vendorId: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      VENDOR_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canDelete", "Forbidden: no permission to delete vendor");

    const before = await this.repository.getVendorById(vendorId, true);
    if (!before) {
      throw new Error("Vendor not found");
    }

    if (before.deletedAt) {
      throw new Error("Vendor already deleted");
    }

    const after = await this.repository.softDeleteVendor(vendorId, actorId);

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "DELETE_VENDOR", vendorId, before, after)
    );

    return after;
  }
}
