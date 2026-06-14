import { Card, CardContent, CardTitle } from "@wo/ui-components";

export function VendorsEmptyState() {
  return (
    <Card className="rounded-[28px] border-dashed border-slate-200 bg-white/80">
      <CardContent className="py-12 text-center">
        <CardTitle className="text-2xl text-slate-950">Belum ada vendor yang cocok</CardTitle>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Coba ubah kata kunci pencarian, rating, atau rentang harga untuk melihat vendor lain yang tersedia.
        </p>
      </CardContent>
    </Card>
  );
}
