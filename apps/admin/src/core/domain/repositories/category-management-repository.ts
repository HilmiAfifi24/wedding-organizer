import type {
  AdminCategoriesQuery,
  AdminCategoryListItemDTO,
  AuditLogDTO,
  CreateAuditLogInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@wo/shared-types";

import type { CategoryPermissionFlags } from "@/core/domain/entities/category-management";

export interface CategoryManagementRepository {
  getActorPermissionByMenuCode(
    actorId: string,
    menuCode: string
  ): Promise<CategoryPermissionFlags | null>;

  listCategories(
    query: Required<Pick<AdminCategoriesQuery, "page" | "pageSize" | "sortBy" | "sortDirection">> &
      Omit<AdminCategoriesQuery, "page" | "pageSize" | "sortBy" | "sortDirection">
  ): Promise<{ items: AdminCategoryListItemDTO[]; totalItems: number }>;

  getCategoryById(categoryId: string): Promise<AdminCategoryListItemDTO | null>;
  getCategoryByName(
    name: string,
    options?: { excludeId?: string }
  ): Promise<AdminCategoryListItemDTO | null>;
  createCategory(data: CreateCategoryInput): Promise<AdminCategoryListItemDTO>;
  updateCategory(categoryId: string, data: UpdateCategoryInput): Promise<AdminCategoryListItemDTO>;
  deleteCategory(categoryId: string): Promise<void>;

  createAuditLog(data: CreateAuditLogInput): Promise<AuditLogDTO>;
}
