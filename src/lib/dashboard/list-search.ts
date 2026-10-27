export function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

export function matchesListSearch(query: string, fields: (string | null | undefined)[]) {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return true;

  return fields.some((field) => {
    const value = field?.trim().toLowerCase();
    return value ? value.includes(normalized) : false;
  });
}
