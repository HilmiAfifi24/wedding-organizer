"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import type { VendorDiscoveryQuery } from "../schemas/vendor-discovery";
import { buildVendorDiscoveryQueryString } from "../services/vendor-query-string";

export const useVendorFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const submitFilters = (next: Partial<VendorDiscoveryQuery>) => {
    const current = Object.fromEntries(searchParams.entries()) as Partial<VendorDiscoveryQuery>;
    const queryString = buildVendorDiscoveryQueryString(
      {
        ...current,
        page: 1,
      },
      next
    );

    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  };

  const resetFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  return {
    isPending,
    submitFilters,
    resetFilters,
  };
};
