/**
 * Generic fallback FAQ shown on a product page when the merchant hasn't
 * created a Shopify Page with handle "faq". Kept here (rather than inline
 * in the component) so the exact same copy backs both the rendered
 * accordion and the FAQPage JSON-LD — the two can never drift apart.
 */
export const GENERIC_PRODUCT_FAQ = [
  {
    question: "How long until I notice results?",
    answer: "Most people notice a difference within 2–4 weeks of consistent daily use.",
  },
  {
    question: "Can I take this with other supplements?",
    answer:
      "Yes — it's a single-ingredient formula, so it stacks cleanly with most other supplements. Check with your doctor if you're unsure.",
  },
  {
    question: "What if it's not right for me?",
    answer: "We offer a 30-day money-back guarantee — no forms, just email us.",
  },
];
