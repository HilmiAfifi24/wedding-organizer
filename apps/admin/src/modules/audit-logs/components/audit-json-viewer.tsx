"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

type AuditJsonViewerProps = {
  title: string;
  data: unknown;
};

const formatJson = (value: unknown) => {
  if (value === null || value === undefined) {
    return "Tidak ada snapshot.";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Snapshot tidak dapat ditampilkan.";
  }
};

export const AuditJsonViewer = ({ title, data }: AuditJsonViewerProps) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <pre className="max-h-[520px] overflow-auto rounded-lg border border-border/60 bg-background/60 p-4 text-xs leading-6 text-slate-200">
        {formatJson(data)}
      </pre>
    </CardContent>
  </Card>
);
