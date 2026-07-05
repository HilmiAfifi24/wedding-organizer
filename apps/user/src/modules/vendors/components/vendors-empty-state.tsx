import { Card, CardContent, CardTitle } from "@wo/ui-components";

export function VendorsEmptyState() {
  return (
    <Card className="rounded-[28px] border-dashed border-white/10 bg-card">
      <CardContent className="py-12 text-center">
        <CardTitle className="text-2xl text-white">Belum ada vendor yang cocok</CardTitle>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Coba ubah kata kunci pencarian, rating, atau rentang harga untuk melihat vendor lain yang tersedia.
        </p>
      </CardContent>
    </Card>
  );
}
