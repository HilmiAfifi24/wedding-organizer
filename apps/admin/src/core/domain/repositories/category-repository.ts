import type { CategoryDTO, CreateCategoryInput } from "@wo/shared-types";

export interface CategoryRepository {
  list(): Promise<CategoryDTO[]>;
  create(data: CreateCategoryInput): Promise<CategoryDTO>;
}
