"use client";

import { useState } from "react";
import { Button, Input } from "@wo/ui-components";

import {
  RATING_FILTER_OPTIONS,
  VENDOR_SORT_OPTIONS,
} from "../constants";
import { useVendorFilters } from "../hooks/use-vendor-filters";
import type { PublicVendorFilterOption } from "../types";
import type { VendorDiscoveryQuery } from "../schemas/vendor-discovery";

export function VendorsFilterBar({
  categories,
  cities,
  query,
}: {
  categories: PublicVendorFilterOption[];
  cities: PublicVendorFilterOption[];
  query: Partial<VendorDiscoveryQuery>;
}) {
  const { isPending, submitFilters, resetFilters } = useVendorFilters();
  const [search, setSearch] = useState(query.search ?? "");
  const [categoryId, setCategoryId] = useState(query.categoryId ?? "");
  const [city, setCity] = useState(query.city ?? "");
  const [priceMin, setPriceMin] = useState(
    typeof query.priceMin === "number" ? String(query.priceMin) : ""
  );
  const [priceMax, setPriceMax] = useState(
    typeof query.priceMax === "number" ? String(query.priceMax) : ""
  );
  const [rating, setRating] = useState(
    typeof query.rating === "number" ? String(query.rating) : ""
  );
  const [sortBy, setSortBy] = useState(query.sortBy ?? "newest");

  return (
    <div className="rounded-[28px] border border-white/80 bg-white/88 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama vendor, kategori, atau kota"
          className="h-11 rounded-2xl border-slate-200 bg-white"
        />

        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">All Cities</option>
          {cities.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <Input
          value={priceMin}
          onChange={(event) => setPriceMin(event.target.value)}
          inputMode="numeric"
          placeholder="Min price"
          className="h-11 rounded-2xl border-slate-200 bg-white"
        />

        <Input
          value={priceMax}
          onChange={(event) => setPriceMax(event.target.value)}
          inputMode="numeric"
          placeholder="Max price"
          className="h-11 rounded-2xl border-slate-200 bg-white"
        />

        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
        >
          {RATING_FILTER_OPTIONS.map((item) => (
            <option key={item.label} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Sort by</label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as VendorDiscoveryQuery["sortBy"])}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          >
            {VENDOR_SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setSearch("");
              setCategoryId("");
              setCity("");
              setPriceMin("");
              setPriceMax("");
              setRating("");
              setSortBy("newest");
              resetFilters();
            }}
            disabled={isPending}
          >
            Reset
          </Button>
          <Button
            type="button"
            className="rounded-full bg-rose-600 text-white hover:bg-rose-700"
            onClick={() =>
              submitFilters({
                search,
                categoryId,
                city,
                priceMin: priceMin ? Number(priceMin) : undefined,
                priceMax: priceMax ? Number(priceMax) : undefined,
                rating: rating ? Number(rating) : undefined,
                sortBy,
                page: 1,
              })
            }
            disabled={isPending}
          >
            {isPending ? "Updating..." : "Apply Filters"}
          </Button>
        </div>
      </div>
    </div>
  );
}
