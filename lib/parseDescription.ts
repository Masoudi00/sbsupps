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

export type ExtractedBadge = { label: string };

/**
 * Some Shopify descriptions embed a "trust badge" icon grid (Gluten-free,
 * Vegan, Non-GMO, etc.) from a third-party app whose own CSS isn't loaded
 * on this headless storefront — so instead of a tidy row, it renders as a
 * broken stack of raw <img> tags one per line.
 *
 * Rather than fight unknown app CSS, this detects that pattern (a run of
 * several images with short `alt` attributes — those alt attributes are
 * exactly the badge labels the app already wrote) and extracts them so
 * they can be rendered with our own styling instead. The matched <img>
 * tags are stripped from the returned html so they aren't ALSO rendered
 * raw and broken.
 *
 * Deliberately conservative: only triggers when there's a confident,
 * repeated pattern (4+ short-alt images making up most of the images in
 * this chunk of html) — a single unrelated inline photo won't be touched.
 */
export function extractBadgeGrid(html: string): { badges: ExtractedBadge[]; html: string } {
  if (!html?.trim()) return { badges: [], html };

  const imgRegex = /<img\b[^>]*>/gi;
  const allImgs = [...html.matchAll(imgRegex)];
  if (allImgs.length < 4) return { badges: [], html };

  const altRegex = /\balt=["']([^"']*)["']/i;
  const candidates = allImgs
    .map((m) => ({ tag: m[0], alt: m[0].match(altRegex)?.[1]?.trim() ?? "" }))
    .filter((c) => c.alt.length > 0 && c.alt.length <= 30);

  // Require most images in this chunk to match, so we're confident this is
  // a badge grid and not, say, one product photo with unrelated alt text.
  if (candidates.length < 4 || candidates.length < allImgs.length * 0.6) {
    return { badges: [], html };
  }

  let cleanedHtml = html;
  for (const c of candidates) cleanedHtml = cleanedHtml.replace(c.tag, "");

  return { badges: candidates.map((c) => ({ label: c.alt })), html: cleanedHtml };
}
