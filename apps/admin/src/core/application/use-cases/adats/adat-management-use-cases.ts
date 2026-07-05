import { AuditModule } from "@wo/shared-types";
import type {
  CreateAuditLogInput,
} from "@wo/shared-types";

import {
  ADAT_MANAGEMENT_MENU_CODE,
  type AdatPermissionFlags,
} from "@/core/domain/entities/adat-management";
import type { AdatManagementRepository } from "@/core/domain/repositories";

import type {
  AdatListResponse,
  ParsedAdatListQuery,
} from "../../dto/adats/adat-management-dto";

const assertPermission = (
  permission: AdatPermissionFlags | null,
  key: keyof AdatPermissionFlags,
  message: string
) => {
  if (!permission || !permission[key]) {
    throw new Error(message);
  }
};

const defaultSortBy: NonNullable<ParsedAdatListQuery["sortBy"]> = "name";
const defaultSortDirection: NonNullable<ParsedAdatListQuery["sortDirection"]> = "asc";

const toPagedResult = (
  query: Pick<ParsedAdatListQuery, "page" | "pageSize">,
  totalItems: number,
  items: AdatListResponse["items"]
): AdatListResponse => ({
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

export class ListAdminAdatsUseCase {
  constructor(private readonly repository: AdatManagementRepository) {}

  async execute(actorId: string, query: ParsedAdatListQuery): Promise<AdatListResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      ADAT_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view adats");

    const normalizedQuery: ParsedAdatListQuery = {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      sortBy: query.sortBy ?? defaultSortBy,
      sortDirection: query.sortDirection ?? defaultSortDirection,
    };

    const result = await this.repository.listAdats(normalizedQuery);

    return toPagedResult(normalizedQuery, result.totalItems, result.items);
  }
}

export class CreateAdminAdatUseCase {
  constructor(private readonly repository: AdatManagementRepository) {}

  async execute(actorId: string, input: { name: string }) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      ADAT_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canInsert", "Forbidden: no permission to create adat");

    const normalizedName = input.name.trim();
    if (!normalizedName) {
      throw new Error("Adat name is required");
    }

    const existing = await this.repository.getAdatByName(normalizedName);
    if (existing) {
      throw new Error("Adat name already exists");
    }

    const created = await this.repository.createAdat({
      name: normalizedName,
    });

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "CREATE_ADAT", created.id, null, created)
    );

    return created;
  }
}

export class UpdateAdminAdatUseCase {
  constructor(private readonly repository: AdatManagementRepository) {}

  async execute(actorId: string, adatId: string, input: { name: string }) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      ADAT_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to update adat");

    const before = await this.repository.getAdatById(adatId);
    if (!before) {
      throw new Error("Adat not found");
    }

    const normalizedName = input.name.trim();
    if (!normalizedName) {
      throw new Error("Adat name is required");
    }

    const existing = await this.repository.getAdatByName(normalizedName, {
      excludeId: adatId,
    });

    if (existing) {
      throw new Error("Adat name already exists");
    }

    const after = await this.repository.updateAdat(adatId, {
      name: normalizedName,
    });

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "UPDATE_ADAT", adatId, before, after)
    );

    return after;
  }
}

export class DeleteAdminAdatUseCase {
  constructor(private readonly repository: AdatManagementRepository) {}

  async execute(actorId: string, adatId: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      ADAT_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canDelete", "Forbidden: no permission to delete adat");

    const before = await this.repository.getAdatById(adatId);
    if (!before) {
      throw new Error("Adat not found");
    }

    if (before.serviceCount > 0) {
      throw new Error("Adat cannot be deleted because it is already used by services");
    }

    await this.repository.deleteAdat(adatId);

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "DELETE_ADAT", adatId, before, null)
    );

    return before;
  }
}
