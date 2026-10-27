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
    <div className="relative border-b p-4">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-7 size-4 -translate-y-1/2" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}
