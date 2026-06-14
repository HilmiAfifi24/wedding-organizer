import type { PublicVendorListItemDTO } from "../types";
import { VendorCard } from "./vendor-card";

export function VendorsGrid({ items }: { items: PublicVendorListItemDTO[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((vendor) => (
        <VendorCard key={vendor.id} vendor={vendor} />
      ))}
    </div>
  );
}
