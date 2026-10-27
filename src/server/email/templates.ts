import "server-only";

export function escapeEmailHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Escapes user text and keeps its paragraph/line breaks in HTML emails. */
export function emailTextToHtml(value: string): string {
  return value
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        `<p>${escapeEmailHtml(paragraph).replaceAll("\n", "<br />")}</p>`,
    )
    .join("");
}
