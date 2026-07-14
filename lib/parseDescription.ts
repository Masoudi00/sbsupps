export type DescriptionSection = { heading: string; html: string };

/**
 * Splits Shopify's descriptionHtml into sections by its own h2/h3 headings
 * (preserving whatever structure the merchant already wrote). Falls back to
 * a single "Overview" section when the description is plain/unstructured
 * text, so callers always get at least one section back.
 */
export function parseDescriptionSections(html: string | undefined | null): DescriptionSection[] {
  if (!html?.trim()) return [];

  const headingRegex = /<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi;
  const matches = [...html.matchAll(headingRegex)];

  if (matches.length === 0) {
    return [{ heading: "Overview", html }];
  }

  const sections: DescriptionSection[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const heading = match[1].replace(/<[^>]+>/g, "").trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : html.length;
    const body = html.slice(start, end).trim();
    if (heading) sections.push({ heading, html: body });
  }

  // Anything before the first heading (e.g. an intro paragraph) becomes its own Overview section.
  const firstStart = matches[0].index ?? 0;
  const intro = html.slice(0, firstStart).trim();
  if (intro) sections.unshift({ heading: "Overview", html: intro });

  return sections.length ? sections : [{ heading: "Overview", html }];
}
