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
    <Card className="overflow-hidden border-white/10 bg-card shadow-2xl backdrop-blur">
      <CardHeader className="border-b border-white/10 bg-white/5">
        <CardTitle className="text-2xl text-white">{title}</CardTitle>
        <CardDescription className="max-w-2xl text-sm leading-6 text-slate-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-6 md:grid-cols-3">
        {bullets.map((item) => (
          <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm leading-6 text-slate-300">{item}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
