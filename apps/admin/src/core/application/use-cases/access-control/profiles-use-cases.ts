import type {
  CreateAccessProfileInput,
  SetAccessPermissionInput,
  UpdateAccessProfileInput,
} from "@wo/shared-types";

import type { AccessProfileRepository } from "@/core/domain/repositories";

export class ListAccessProfilesUseCase {
  constructor(private readonly accessProfileRepository: AccessProfileRepository) {}

  async execute() {
    return this.accessProfileRepository.listAll();
  }
}

export class CreateAccessProfileUseCase {
  constructor(private readonly accessProfileRepository: AccessProfileRepository) {}

  async execute(data: CreateAccessProfileInput) {
    return this.accessProfileRepository.create(data);
  }
}

export class UpdateAccessProfileUseCase {
  constructor(private readonly accessProfileRepository: AccessProfileRepository) {}

  async execute(id: string, data: UpdateAccessProfileInput) {
    return this.accessProfileRepository.update(id, data);
  }
}

export class DeleteAccessProfileUseCase {
  constructor(private readonly accessProfileRepository: AccessProfileRepository) {}

  async execute(id: string) {
    await this.accessProfileRepository.remove(id);
  }
}

export class GetAccessProfilePermissionsUseCase {
  constructor(private readonly accessProfileRepository: AccessProfileRepository) {}

  async execute(accessProfileId: string) {
    const profile = await this.accessProfileRepository.findById(accessProfileId);
    if (!profile) {
      throw new Error("Access profile not found");
    }

    const permissions = await this.accessProfileRepository.listPermissions(accessProfileId);

    return { profile, permissions };
  }
}

export class SetAccessProfilePermissionsUseCase {
  constructor(private readonly accessProfileRepository: AccessProfileRepository) {}

  async execute(accessProfileId: string, permissions: SetAccessPermissionInput[]) {
    const profile = await this.accessProfileRepository.findById(accessProfileId);
    if (!profile) {
      throw new Error("Access profile not found");
    }

    const updated = await this.accessProfileRepository.setPermissions(accessProfileId, permissions);

    return {
      profile,
      permissions: updated,
    };
  }
}
