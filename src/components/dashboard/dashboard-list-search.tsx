"use client";

import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";

export function DashboardListSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative border-b border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] p-4">
      <Search className="pointer-events-none absolute top-1/2 left-7 size-4 -translate-y-1/2 text-zinc-400" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-full border-zinc-200 bg-[#f5f6f8] pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}
