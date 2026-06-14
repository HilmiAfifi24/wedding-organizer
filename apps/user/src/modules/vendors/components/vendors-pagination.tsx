import Link from "next/link";
import { Button } from "@wo/ui-components";

import type { VendorDiscoveryQuery } from "../schemas/vendor-discovery";
import { buildVendorDiscoveryQueryString } from "../services/vendor-query-string";

export function VendorsPagination({
  page,
  totalPages,
  query,
}: {
  page: number;
  totalPages: number;
  query: Partial<VendorDiscoveryQuery>;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const createHref = (nextPage: number) => {
    const queryString = buildVendorDiscoveryQueryString(query, { page: nextPage });
    return queryString ? `/vendors?${queryString}` : "/vendors";
  };

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-[28px] border border-white/80 bg-white/85 px-4 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:flex-row">
      <p className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={createHref(Math.max(1, page - 1))}>Previous</Link>
          </Button>
        ) : (
          <Button variant="outline" className="rounded-full" disabled>
            Previous
          </Button>
        )}
        {page < totalPages ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={createHref(Math.min(totalPages, page + 1))}>Next</Link>
          </Button>
        ) : (
          <Button variant="outline" className="rounded-full" disabled>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
