import type {
  CreateAccessMenuInput,
  UpdateAccessMenuInput,
} from "@wo/shared-types";

import type { AccessMenuRepository, AccessProfileRepository } from "@/core/domain/repositories";

import { buildAccessMenuTree } from "./build-menu-tree";

export class ListAccessMenusUseCase {
  constructor(
    private readonly accessMenuRepository: AccessMenuRepository,
    private readonly accessProfileRepository?: AccessProfileRepository
  ) {}

  async execute(accessProfileId?: string) {
    const [menus, permissions] = await Promise.all([
      this.accessMenuRepository.listAll(),
      accessProfileId && this.accessProfileRepository
        ? this.accessProfileRepository.listPermissions(accessProfileId)
        : Promise.resolve(undefined),
    ]);

    return buildAccessMenuTree(menus, permissions);
  }
}

export class CreateAccessMenuUseCase {
  constructor(private readonly accessMenuRepository: AccessMenuRepository) {}

  async execute(data: CreateAccessMenuInput) {
    return this.accessMenuRepository.create(data);
  }
}

export class UpdateAccessMenuUseCase {
  constructor(private readonly accessMenuRepository: AccessMenuRepository) {}

  async execute(id: string, data: UpdateAccessMenuInput) {
    return this.accessMenuRepository.update(id, data);
  }
}

export class DeleteAccessMenuUseCase {
  constructor(private readonly accessMenuRepository: AccessMenuRepository) {}

  async execute(id: string) {
    await this.accessMenuRepository.remove(id);
  }
}
