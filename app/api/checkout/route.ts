import { NextRequest, NextResponse } from "next/server";
import { createCheckout, isShopifyConfigured } from "@/lib/shopify";

export async function POST(req: NextRequest) {
  if (!isShopifyConfigured) {
    return NextResponse.json(
      { error: "Shopify isn't configured yet. Add SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN to .env.local." },
      { status: 501 }
    );
  }

  const body = await req.json().catch(() => null);
  const lines = body?.lines as { merchandiseId: string; quantity: number }[] | undefined;

  if (!lines?.length) {
    return NextResponse.json({ error: "No line items provided." }, { status: 400 });
  }

  const checkoutUrl = await createCheckout(lines);
  if (!checkoutUrl) {
    return NextResponse.json({ error: "Could not create checkout." }, { status: 502 });
  }

  return NextResponse.json({ checkoutUrl });
}
