"use client";

import Link from "next/link";

import type {
  AdminDashboardOverviewDTO,
  DashboardKpiSummaryDTO,
  DashboardQuickActionDTO,
  DashboardRecentActivityDTO,
  DashboardStatusMetricDTO,
  DashboardTimeRange,
} from "@wo/shared-types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wo/ui-components";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  DASHBOARD_CHART_COLORS,
  DASHBOARD_TIME_RANGE_OPTIONS,
  KPI_ICON_BY_KEY,
  formatAverageRating,
  formatCompactNumber,
  formatDashboardMetricLabel,
  formatDateTime,
  getStatusTone,
} from "../constants";
import { useDashboardOverview } from "../hooks/use-dashboard-overview";

type DashboardOverviewProps = {
  initialData: AdminDashboardOverviewDTO;
  initialError?: string | null;
  actorName?: string | null;
};

const OverviewIcon = ({ kind }: { kind: "users" | "vendors" | "bookings" | "payments" | "reviews" | "alert" }) => {
  const iconClassName = "h-5 w-5";

  switch (kind) {
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClassName}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a8.966 8.966 0 00-12 0M12 15a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
        </svg>
      );
    case "vendors":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClassName}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M4.5 21V8.25m15 12.75V8.25M8.25 21V4.5h7.5V21" />
        </svg>
      );
    case "bookings":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClassName}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 2.25v3M15.75 2.25v3M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25M3 9.75h18" />
        </svg>
      );
    case "payments":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClassName}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5m-18 0A2.25 2.25 0 014.5 6h15a2.25 2.25 0 012.25 2.25m-18 0v7.5A2.25 2.25 0 004.5 18h15a2.25 2.25 0 002.25-2.25v-7.5m-12 4.5h3" />
        </svg>
      );
    case "reviews":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClassName}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.75.75 0 011.04 0l2.057 2.084 2.88.418a.75.75 0 01.416 1.279l-2.084 2.03.492 2.868a.75.75 0 01-1.088.79L12 11.858l-2.577 1.11a.75.75 0 01-1.088-.79l.492-2.868-2.084-2.03a.75.75 0 01.416-1.279l2.88-.418 2.057-2.084z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconClassName}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zM12 16.5h.008v.008H12V16.5z" />
        </svg>
      );
  }
};

const RangeSwitcher = ({
  value,
  onChange,
  disabled,
}: {
  value: DashboardTimeRange;
  onChange: (value: DashboardTimeRange) => void;
  disabled: boolean;
}) => (
  <div className="flex flex-wrap gap-2">
    {DASHBOARD_TIME_RANGE_OPTIONS.map((option) => (
      <Button
        key={option.value}
        type="button"
        size="sm"
        variant={value === option.value ? "primary" : "outline"}
        onClick={() => void onChange(option.value)}
        disabled={disabled}
      >
        {option.label}
      </Button>
    ))}
  </div>
);

const KpiGrid = ({ items }: { items: DashboardKpiSummaryDTO[] }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
    {items.map((item) => (
      <Card key={item.key} className="border border-slate-800 bg-slate-900/60">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-300">
              <OverviewIcon kind={KPI_ICON_BY_KEY[item.key] ?? "alert"} />
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={item.href}>Buka</Link>
            </Button>
          </div>
          <div>
            <CardDescription className="text-slate-400">{item.title}</CardDescription>
            <CardTitle className="mt-2 text-3xl text-slate-50">{formatCompactNumber(item.count)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-slate-500">
            {typeof item.trendPercentage === "number"
              ? `${item.trendPercentage > 0 ? "+" : ""}${item.trendPercentage}% vs previous period`
              : "Ringkasan operasional saat ini"}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);

const StatusList = ({ items }: { items: DashboardStatusMetricDTO[] }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {items.map((item) => (
      <div key={item.status} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant={getStatusTone(item.status)}>{item.label}</Badge>
          <span className="text-lg font-semibold text-slate-100">{formatCompactNumber(item.count)}</span>
        </div>
      </div>
    ))}
  </div>
);

const PieSummary = ({ data }: { data: DashboardStatusMetricDTO[] }) => (
  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="label" innerRadius={60} outerRadius={95} paddingAngle={3}>
          {data.map((entry, index) => (
            <Cell key={entry.status} fill={DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const BarSummary = ({ data }: { data: DashboardStatusMetricDTO[] }) => (
  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.status} fill={DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const RatingBarChart = ({ data }: { data: Array<{ rating: number; count: number }> }) => (
  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data.map((item) => ({ ...item, label: `${item.rating}★` }))}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const QuickActions = ({ items }: { items: DashboardQuickActionDTO[] }) => (
  <Card className="border border-slate-800 bg-slate-900/60">
    <CardHeader>
      <CardTitle className="text-slate-50">Quick Actions</CardTitle>
      <CardDescription className="text-slate-400">
        Shortcut ke modul operasional yang paling sering dipakai admin.
      </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-6 text-sm text-slate-400">
          Tidak ada quick action yang tersedia untuk permission akun ini.
        </div>
      ) : (
        items.map((item) => (
          <div key={item.key} className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
            <h3 className="font-semibold text-slate-100">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{item.description}</p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href={item.href}>Buka Modul</Link>
            </Button>
          </div>
        ))
      )}
    </CardContent>
  </Card>
);

const RecentActivities = ({ items }: { items: DashboardRecentActivityDTO[] | null | undefined }) => (
  <Card className="border border-slate-800 bg-slate-900/60">
    <CardHeader>
      <CardTitle className="text-slate-50">Recent Audit Logs</CardTitle>
      <CardDescription className="text-slate-400">
        Aktivitas terbaru yang dicatat sistem audit admin.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {!items || items.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-6 text-sm text-slate-400">
          Belum ada aktivitas audit yang bisa ditampilkan.
        </div>
      ) : (
        items.map((item) => (
          <Link
            key={item.id}
            href={item.detailPath}
            className="block rounded-lg border border-slate-800 bg-slate-950/70 p-4 transition hover:border-indigo-500/40 hover:bg-slate-950"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{formatDashboardMetricLabel(item.module)}</Badge>
              <Badge variant="default">{item.action}</Badge>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-100">
              {item.actorName || item.actorEmail || "Admin"} menjalankan aksi terhadap target {item.targetId}
            </p>
            <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
          </Link>
        ))
      )}
    </CardContent>
  </Card>
);

const PendingActions = ({
  items,
}: {
  items: AdminDashboardOverviewDTO["pendingActions"];
}) => (
  <Card className="border border-slate-800 bg-slate-900/60">
    <CardHeader>
      <CardTitle className="text-slate-50">Pending Actions</CardTitle>
      <CardDescription className="text-slate-400">
        Fokus operasional yang perlu segera ditindaklanjuti tim admin.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-6 text-sm text-slate-400">
          Tidak ada pending action kritikal saat ini.
        </div>
      ) : (
        items.map((item) => (
          <div key={item.key} className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.description}</p>
              </div>
              <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-sm font-semibold text-indigo-300">
                {formatCompactNumber(item.count)}
              </span>
            </div>
            <Button className="mt-4" variant="outline" asChild>
              <Link href={item.href}>{item.ctaLabel}</Link>
            </Button>
          </div>
        ))
      )}
    </CardContent>
  </Card>
);

export const DashboardOverview = ({
  initialData,
  initialError,
  actorName,
}: DashboardOverviewProps) => {
  const { data, timeRange, isRefreshing, error, updateTimeRange, refresh } =
    useDashboardOverview(initialData);

  const activeError = error ?? initialError ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-50">Dashboard Overview</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Command center operasional untuk memantau user, vendor, booking, pembayaran, review, dan aktivitas admin terbaru.
            Selamat bekerja, {actorName || "Admin"}.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end">
          <RangeSwitcher value={timeRange} onChange={updateTimeRange} disabled={isRefreshing} />
          <Button variant="ghost" size="sm" onClick={() => void refresh()} disabled={isRefreshing}>
            {isRefreshing ? "Menyegarkan..." : "Refresh"}
          </Button>
        </div>
      </div>

      {activeError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {activeError}
        </div>
      ) : null}

      {isRefreshing ? (
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
          Dashboard sedang diperbarui sesuai filter waktu terbaru.
        </div>
      ) : null}

      <KpiGrid items={data.kpis} />

      <div className="grid gap-4 xl:grid-cols-2">
        {data.bookings ? (
          <Card className="border border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-slate-50">Booking Overview</CardTitle>
              <CardDescription className="text-slate-400">
                Status booking dalam rentang waktu yang dipilih.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <StatusList items={data.bookings.statuses} />
              <BarSummary data={data.bookings.statuses} />
              <PieSummary data={data.bookings.statuses.filter((item) => item.count > 0)} />
            </CardContent>
          </Card>
        ) : null}

        {data.vendors ? (
          <Card className="border border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-slate-50">Vendor Overview</CardTitle>
              <CardDescription className="text-slate-400">
                Distribusi status vendor dan performa vendor teratas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <StatusList items={data.vendors.statuses} />
              <PieSummary data={data.vendors.statuses.filter((item) => item.count > 0)} />

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                  <h3 className="text-sm font-semibold text-slate-100">Top Vendors by Bookings</h3>
                  <div className="mt-4 space-y-3">
                    {data.vendors.topByBookings.length === 0 ? (
                      <p className="text-sm text-slate-400">Belum ada data booking vendor.</p>
                    ) : (
                      data.vendors.topByBookings.map((item, index) => (
                        <Link key={item.vendorId} href={item.href} className="flex items-center justify-between gap-3 text-sm">
                          <div>
                            <p className="font-medium text-slate-100">{index + 1}. {item.vendorName}</p>
                            <p className="text-slate-500">{item.metricLabel}</p>
                          </div>
                          <span className="font-semibold text-indigo-300">{formatCompactNumber(item.metricValue)}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                  <h3 className="text-sm font-semibold text-slate-100">Top Vendors by Ratings</h3>
                  <div className="mt-4 space-y-3">
                    {data.vendors.topByRatings.length === 0 ? (
                      <p className="text-sm text-slate-400">Belum ada rating vendor yang cukup.</p>
                    ) : (
                      data.vendors.topByRatings.map((item, index) => (
                        <Link key={item.vendorId} href={item.href} className="flex items-center justify-between gap-3 text-sm">
                          <div>
                            <p className="font-medium text-slate-100">{index + 1}. {item.vendorName}</p>
                            <p className="text-slate-500">{item.metricLabel}</p>
                          </div>
                          <span className="font-semibold text-amber-300">{item.metricValue.toFixed(1)}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {data.payments ? (
          <Card className="border border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-slate-50">Payment Overview</CardTitle>
              <CardDescription className="text-slate-400">
                Monitoring status bukti pembayaran sesuai rentang waktu aktif.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <StatusList items={data.payments.statuses} />
              <BarSummary data={data.payments.statuses} />
            </CardContent>
          </Card>
        ) : null}

        {data.reviews ? (
          <Card className="border border-slate-800 bg-slate-900/60">
            <CardHeader>
              <CardTitle className="text-slate-50">Review Overview</CardTitle>
              <CardDescription className="text-slate-400">
                Distribusi rating dan status review pada periode yang dipilih.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Average Rating</p>
                  <p className="mt-2 text-3xl font-semibold text-amber-300">
                    {formatAverageRating(data.reviews.averageRating)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Total Reviews in Range</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-50">
                    {formatCompactNumber(data.reviews.total)}
                  </p>
                </div>
              </div>
              <StatusList items={data.reviews.statuses} />
              <RatingBarChart data={data.reviews.ratingDistribution} />
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {data.permissions.auditLogs ? <RecentActivities items={data.recentActivities} /> : null}
        <PendingActions items={data.pendingActions} />
      </div>

      <QuickActions items={data.quickActions} />
    </div>
  );
};
