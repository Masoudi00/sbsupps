export async function getProductReviews(productId: number | string) {
  try {
    const res = await fetch(
      `https://judge.me/api/v1/reviews?shop_domain=${process.env.SHOPIFY_DOMAIN}&product_external_id=${productId}`,
      {
        headers: {
          "X-Api-Token": process.env.JUDGEME_PRIVATE_TOKEN ?? "",
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      console.error("Judge.me request failed:", res.status);
      return { reviews: [] };
    }

    return await res.json();
  } catch (err) {
    console.error("Judge.me error:", err);
    return { reviews: [] };
  }
}