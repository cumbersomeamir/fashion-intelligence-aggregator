import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/db";
import { SellerModel } from "@/lib/sellerModel";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sellerId: string; productId: string }> }
) {
  const { sellerId, productId } = await params;
  if (!sellerId || !productId) {
    return NextResponse.json({ error: "sellerId and productId are required" }, { status: 400 });
  }

  try {
    await connectMongo();
    const doc = await SellerModel.findOneAndUpdate(
      { sellerId },
      { $pull: { products: { productId } } },
      { new: true }
    ).lean();

    if (!doc) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[seller/:sellerId/products/:productId DELETE]", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
