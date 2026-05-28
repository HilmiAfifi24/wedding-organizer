import type {
  AdminVendorDetailDTO,
  AdminVendorListItemDTO,
  AdminVendorsQuery,
  AuditLogDTO,
  CreateAuditLogInput,
} from "@wo/shared-types";

import type { VendorPermissionFlags } from "@/core/domain/entities/vendor-management";

export interface VendorManagementRepository {
  getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<VendorPermissionFlags | null>;

  listVendors(
    query: Required<Pick<AdminVendorsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> &
      Omit<AdminVendorsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminVendorListItemDTO[]; totalItems: number }>;

  getVendorById(vendorId: string, includeDeleted?: boolean): Promise<AdminVendorDetailDTO | null>;

  approveVendor(vendorId: string, actorId: string): Promise<AdminVendorDetailDTO>;
  rejectVendor(vendorId: string, actorId: string, reason: string): Promise<AdminVendorDetailDTO>;
  suspendVendor(vendorId: string, actorId: string): Promise<AdminVendorDetailDTO>;
  unsuspendVendor(vendorId: string): Promise<AdminVendorDetailDTO>;
  softDeleteVendor(vendorId: string, actorId: string): Promise<AdminVendorDetailDTO>;

  createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO>;
}
