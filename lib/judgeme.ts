// lib/judgeme.ts

export async function getProductReviews(productId: number | string) {
  const res = await fetch(
    `https://judge.me/api/v1/reviews?shop_domain=${process.env.SHOPIFY_DOMAIN}&product_external_id=${productId}`,
    {
      headers: {
        "X-Api-Token": process.env.JUDGEME_PRIVATE_TOKEN!,
      },
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Judge.me reviews");
  }

  return res.json();
}