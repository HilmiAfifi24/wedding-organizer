"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { AdminAuditLogDetailDTO } from "@wo/shared-types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@wo/ui-components";

import {
  formatAuditModuleLabel,
  getAuditActionBadgeVariant,
  getAuditModuleBadgeVariant,
} from "../constants";
import { auditLogsApi } from "../services/audit-logs-api";
import { AuditJsonViewer } from "./audit-json-viewer";

type AuditLogDetailViewProps = {
  auditLogId: string;
};

const formatDateTime = (value: Date | string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const AuditLogDetailView = ({ auditLogId }: AuditLogDetailViewProps) => {
  const [auditLog, setAuditLog] = useState<AdminAuditLogDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await auditLogsApi.detail(auditLogId);
        if (!isMounted) {
          return;
        }

        setAuditLog(response);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Gagal memuat detail audit log");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      isMounted = false;
    };
  }, [auditLogId]);

  if (isLoading) {
    return (
      <div className="rounded-md border border-border/60 px-4 py-6 text-sm text-muted-foreground">
        Memuat detail audit log...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
        <Button variant="outline" asChild>
          <Link href="/audit-logs">Kembali ke daftar audit log</Link>
        </Button>
      </div>
    );
  }

  if (!auditLog) {
    return (
      <div className="rounded-md border border-border/60 px-4 py-6 text-sm text-muted-foreground">
        Audit log tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Detail Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            Audit ID: <span className="font-mono">{auditLog.id}</span>
          </p>
        </div>

        <div className="flex gap-2">
          {auditLog.targetPath ? (
            <Button variant="ghost" asChild>
              <Link href={auditLog.targetPath}>Buka Target Terkait</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/audit-logs">Kembali</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Module</p>
            <Badge variant={getAuditModuleBadgeVariant(auditLog.module)}>
              {formatAuditModuleLabel(auditLog.module)}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Action</p>
            <Badge variant={getAuditActionBadgeVariant(auditLog.action)}>{auditLog.action}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target ID</p>
            <p className="font-mono text-sm">{auditLog.targetId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created At</p>
            <p className="font-medium">{formatDateTime(auditLog.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Related Actor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Actor ID</p>
              <p className="font-mono text-sm">{auditLog.actorId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nama</p>
              <p className="font-medium">{auditLog.actorName || "Admin"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{auditLog.actorEmail}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">IP Address</p>
              <p className="font-medium">{auditLog.ipAddress || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">User Agent</p>
              <p className="break-words text-sm font-medium">{auditLog.userAgent || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Target ID</p>
              <p className="font-mono text-sm">{auditLog.targetId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Route</p>
              <p className="font-medium">{auditLog.targetPath || "-"}</p>
            </div>
            {auditLog.targetPath ? (
              <Button variant="outline" asChild>
                <Link href={auditLog.targetPath}>Lihat Entity Terkait</Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Route target tidak dapat diinferensikan dari modul ini.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground">
        Snapshot sebelum dan sesudah perubahan sudah disanitasi. Field sensitif seperti password, token, cookie, secret, dan session tidak ditampilkan.
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AuditJsonViewer title="Before Data" data={auditLog.beforeData} />
        <AuditJsonViewer title="After Data" data={auditLog.afterData} />
      </div>
    </div>
  );
};
