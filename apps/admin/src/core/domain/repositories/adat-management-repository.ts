import type {
  AdminAdatsQuery,
  AdminAdatListItemDTO,
  AuditLogDTO,
  CreateAuditLogInput,
} from "@wo/shared-types";

import type { AdatPermissionFlags } from "@/core/domain/entities/adat-management";

export interface AdatManagementRepository {
  getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<AdatPermissionFlags | null>;

  listAdats(
    query: Required<Pick<AdminAdatsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> &
      Omit<AdminAdatsQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminAdatListItemDTO[]; totalItems: number }>;

  getAdatById(adatId: string): Promise<AdminAdatListItemDTO | null>;
  getAdatByName(
    name: string,
    options?: { excludeId?: string }
  ): Promise<AdminAdatListItemDTO | null>;
  createAdat(data: { name: string }): Promise<AdminAdatListItemDTO>;
  updateAdat(adatId: string, data: { name: string }): Promise<AdminAdatListItemDTO>;
  deleteAdat(adatId: string): Promise<void>;

  createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO>;
}
