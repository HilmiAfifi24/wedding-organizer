import { VendorStatus } from "@wo/shared-types";

export const VENDOR_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: VendorStatus | "ALL";
}> = [
  { label: "Semua Status", value: "ALL" },
  { label: "Pending Verification", value: VendorStatus.PENDING_VERIFICATION },
  { label: "Approved", value: VendorStatus.APPROVED },
  { label: "Rejected", value: VendorStatus.REJECTED },
  { label: "Suspended", value: VendorStatus.SUSPENDED },
];
