import { VendorDetailSkeleton } from "@/modules/vendors/components/vendor-detail-skeleton";

export default function VendorDetailLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.16),_transparent_26%),linear-gradient(160deg,_#fff7ed_0%,_#fff1f2_48%,_#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <VendorDetailSkeleton />
      </div>
    </div>
  );
}
