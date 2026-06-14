import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@wo/ui-components";

export function UserModulePlaceholder({
  title,
  description,
  bullets,
}: {
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <Card className="overflow-hidden border-white/80 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <CardHeader className="border-b border-slate-100/80 bg-gradient-to-r from-rose-50 via-white to-amber-50">
        <CardTitle className="text-2xl text-slate-950">{title}</CardTitle>
        <CardDescription className="max-w-2xl text-sm leading-6 text-slate-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-6 md:grid-cols-3">
        {bullets.map((item) => (
          <div key={item} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-sm leading-6 text-slate-700">{item}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
