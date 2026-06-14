import "server-only";

import type { CategoryDTO, CreateCategoryInput } from "@wo/shared-types";

import type { CategoryRepository } from "../../../domain/repositories";
import { prisma } from "../prisma";

export class PrismaCategoryRepository implements CategoryRepository {
  async list(): Promise<CategoryDTO[]> {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  async create(data: CreateCategoryInput): Promise<CategoryDTO> {
    return prisma.category.create({ data });
  }
}
