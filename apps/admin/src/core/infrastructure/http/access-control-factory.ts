import {
  AssignUserAccessProfileUseCase,
  CreateAccessMenuUseCase,
  CreateAccessProfileUseCase,
  DeleteAccessMenuUseCase,
  DeleteAccessProfileUseCase,
  GetAccessProfilePermissionsUseCase,
  GetUserAccessMenuTreeUseCase,
  ListAccessMenusUseCase,
  ListAccessProfilesUseCase,
  ListAccessUsersUseCase,
  SetAccessProfilePermissionsUseCase,
  UpdateAccessMenuUseCase,
  UpdateAccessProfileUseCase,
} from "@/core/application/use-cases/access-control";
import {
  PrismaAccessMenuRepository,
  PrismaAccessProfileRepository,
  PrismaAccessUserRepository,
} from "@/core/infrastructure/db/repositories";

export const createAccessControlUseCases = () => {
  const accessMenuRepository = new PrismaAccessMenuRepository();
  const accessProfileRepository = new PrismaAccessProfileRepository();
  const accessUserRepository = new PrismaAccessUserRepository();

  return {
    listAccessMenusUseCase: new ListAccessMenusUseCase(
      accessMenuRepository,
      accessProfileRepository
    ),
    createAccessMenuUseCase: new CreateAccessMenuUseCase(accessMenuRepository),
    updateAccessMenuUseCase: new UpdateAccessMenuUseCase(accessMenuRepository),
    deleteAccessMenuUseCase: new DeleteAccessMenuUseCase(accessMenuRepository),

    listAccessProfilesUseCase: new ListAccessProfilesUseCase(accessProfileRepository),
    createAccessProfileUseCase: new CreateAccessProfileUseCase(accessProfileRepository),
    updateAccessProfileUseCase: new UpdateAccessProfileUseCase(accessProfileRepository),
    deleteAccessProfileUseCase: new DeleteAccessProfileUseCase(accessProfileRepository),
    getAccessProfilePermissionsUseCase: new GetAccessProfilePermissionsUseCase(
      accessProfileRepository
    ),
    setAccessProfilePermissionsUseCase: new SetAccessProfilePermissionsUseCase(
      accessProfileRepository
    ),

    listAccessUsersUseCase: new ListAccessUsersUseCase(accessUserRepository),
    assignUserAccessProfileUseCase: new AssignUserAccessProfileUseCase(accessUserRepository),
    getUserAccessMenuTreeUseCase: new GetUserAccessMenuTreeUseCase(
      accessUserRepository,
      accessMenuRepository,
      accessProfileRepository
    ),
  };
};
