import { Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import type { PublicVendorPortfolioItemDTO } from "../types";

export function VendorPortfolioSection({
  portfolio,
}: {
  portfolio: PublicVendorPortfolioItemDTO[];
}) {
  return (
    <Card className="rounded-[28px] border-white/10 bg-card shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Portfolio Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        {portfolio.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {portfolio.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                <div className="aspect-[4/3] bg-white/5">
                  {item.mediaType === "IMAGE" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.mediaUrl} alt={item.title || "Portfolio"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-400">
                      Video portfolio tersedia pada tautan media vendor.
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="text-base font-semibold text-white">{item.title || "Portfolio Vendor"}</h3>
                  <p className="text-sm leading-6 text-slate-300">
                    {item.description || "Vendor belum menambahkan deskripsi untuk portfolio ini."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Belum ada portfolio publik yang tersedia.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
