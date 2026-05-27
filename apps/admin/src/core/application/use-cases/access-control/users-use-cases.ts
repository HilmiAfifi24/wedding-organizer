import type {
  AccessMenuRepository,
  AccessProfileRepository,
  AccessUserRepository,
} from "@/core/domain/repositories";

import { buildAccessMenuTree } from "./build-menu-tree";

export class ListAccessUsersUseCase {
  constructor(private readonly accessUserRepository: AccessUserRepository) {}

  async execute(search?: string) {
    return this.accessUserRepository.listUsers(search);
  }
}

export class AssignUserAccessProfileUseCase {
  constructor(private readonly accessUserRepository: AccessUserRepository) {}

  async execute(userId: string, accessProfileId: string | null) {
    return this.accessUserRepository.assignAccessProfile(userId, accessProfileId);
  }
}

export class GetUserAccessMenuTreeUseCase {
  constructor(
    private readonly accessUserRepository: AccessUserRepository,
    private readonly accessMenuRepository: AccessMenuRepository,
    private readonly accessProfileRepository: AccessProfileRepository
  ) {}

  async execute(userId: string) {
    const user = await this.accessUserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const menus = await this.accessMenuRepository.listAll();

    if (!user.accessProfileId) {
      return {
        user,
        menuTree: buildAccessMenuTree(menus),
      };
    }

    const permissions = await this.accessProfileRepository.listPermissions(user.accessProfileId);

    return {
      user,
      menuTree: buildAccessMenuTree(menus, permissions),
    };
  }
}
