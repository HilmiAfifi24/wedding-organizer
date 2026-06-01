import { VendorStatus } from "@wo/shared-types";

export const getVendorStatusBadgeVariant = (status: VendorStatus) => {
  switch (status) {
    case VendorStatus.APPROVED:
      return "success" as const;
    case VendorStatus.REJECTED:
      return "danger" as const;
    case VendorStatus.SUSPENDED:
      return "danger" as const;
    default:
      return "warning" as const;
  }
};
