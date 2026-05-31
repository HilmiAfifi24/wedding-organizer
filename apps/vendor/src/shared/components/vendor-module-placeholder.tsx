import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

interface VendorModulePlaceholderProps {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export function VendorModulePlaceholder({
  title,
  description,
  ctaHref = "/onboarding",
  ctaLabel = "Lengkapi Onboarding",
}: VendorModulePlaceholderProps) {
  return (
    <Card className="border border-white/10 bg-slate-950/65 text-slate-100 backdrop-blur">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-slate-400">{description}</p>
        <Button asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
