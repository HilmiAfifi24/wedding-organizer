import { Role, UserStatus } from "@wo/shared-types";

export const ROLE_FILTER_OPTIONS: Array<{ label: string; value: Role | "ALL" }> = [
  { label: "Semua Role", value: "ALL" },
  { label: "User", value: Role.USER },
  { label: "Vendor", value: Role.VENDOR },
  { label: "Admin", value: Role.ADMIN },
];

export const STATUS_FILTER_OPTIONS: Array<{ label: string; value: UserStatus | "ALL" }> = [
  { label: "Status Aktif", value: UserStatus.ACTIVE },
  { label: "Status Suspend", value: UserStatus.SUSPENDED },
  { label: "Status Deleted", value: UserStatus.DELETED },
  { label: "Semua Status", value: "ALL" },
];
