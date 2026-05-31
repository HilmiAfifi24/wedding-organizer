import { AuditModule } from "@wo/shared-types";
import type {
  CreateAuditLogInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@wo/shared-types";

import {
  CATEGORY_MANAGEMENT_MENU_CODE,
  type CategoryPermissionFlags,
} from "@/core/domain/entities/category-management";
import type { CategoryManagementRepository } from "@/core/domain/repositories";

import type {
  CategoryListResponse,
  ParsedCategoryListQuery,
} from "../../dto/categories/category-management-dto";

const assertPermission = (
  permission: CategoryPermissionFlags | null,
  key: keyof CategoryPermissionFlags,
  message: string
) => {
  if (!permission || !permission[key]) {
    throw new Error(message);
  }
};

const defaultSortBy: NonNullable<ParsedCategoryListQuery["sortBy"]> = "name";
const defaultSortDirection: NonNullable<ParsedCategoryListQuery["sortDirection"]> = "asc";

const toPagedResult = (
  query: Pick<ParsedCategoryListQuery, "page" | "pageSize">,
  totalItems: number,
  items: CategoryListResponse["items"]
): CategoryListResponse => ({
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

export class ListAdminCategoriesUseCase {
  constructor(private readonly repository: CategoryManagementRepository) {}

  async execute(actorId: string, query: ParsedCategoryListQuery): Promise<CategoryListResponse> {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      CATEGORY_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canView", "Forbidden: no permission to view categories");

    const normalizedQuery: ParsedCategoryListQuery = {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      sortBy: query.sortBy ?? defaultSortBy,
      sortDirection: query.sortDirection ?? defaultSortDirection,
    };

    const result = await this.repository.listCategories(normalizedQuery);

    return toPagedResult(normalizedQuery, result.totalItems, result.items);
  }
}

export class CreateAdminCategoryUseCase {
  constructor(private readonly repository: CategoryManagementRepository) {}

  async execute(actorId: string, input: CreateCategoryInput) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      CATEGORY_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canInsert", "Forbidden: no permission to create category");

    const normalizedName = input.name.trim();
    if (!normalizedName) {
      throw new Error("Category name is required");
    }

    const existing = await this.repository.getCategoryByName(normalizedName);
    if (existing) {
      throw new Error("Category name already exists");
    }

    const created = await this.repository.createCategory({
      name: normalizedName,
    });

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "CREATE_CATEGORY", created.id, null, created)
    );

    return created;
  }
}

export class UpdateAdminCategoryUseCase {
  constructor(private readonly repository: CategoryManagementRepository) {}

  async execute(actorId: string, categoryId: string, input: UpdateCategoryInput) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      CATEGORY_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canUpdate", "Forbidden: no permission to update category");

    const before = await this.repository.getCategoryById(categoryId);
    if (!before) {
      throw new Error("Category not found");
    }

    const normalizedName = input.name.trim();
    if (!normalizedName) {
      throw new Error("Category name is required");
    }

    const existing = await this.repository.getCategoryByName(normalizedName, {
      excludeId: categoryId,
    });

    if (existing) {
      throw new Error("Category name already exists");
    }

    const after = await this.repository.updateCategory(categoryId, {
      name: normalizedName,
    });

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "UPDATE_CATEGORY", categoryId, before, after)
    );

    return after;
  }
}

export class DeleteAdminCategoryUseCase {
  constructor(private readonly repository: CategoryManagementRepository) {}

  async execute(actorId: string, categoryId: string) {
    const permission = await this.repository.getActorPermissionByMenuCode(
      actorId,
      CATEGORY_MANAGEMENT_MENU_CODE
    );

    assertPermission(permission, "canDelete", "Forbidden: no permission to delete category");

    const before = await this.repository.getCategoryById(categoryId);
    if (!before) {
      throw new Error("Category not found");
    }

    if (before.vendorCount > 0) {
      throw new Error("Category cannot be deleted because it is already used by vendors");
    }

    await this.repository.deleteCategory(categoryId);

    await this.repository.createAuditLog(
      createAuditPayload(actorId, "DELETE_CATEGORY", categoryId, before, null)
    );

    return before;
  }
}
