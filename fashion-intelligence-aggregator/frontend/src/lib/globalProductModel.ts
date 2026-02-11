import mongoose, { Schema } from "mongoose";

const globalProductSchema = new Schema(
  {
    product_id: { type: String },
    product_link: { type: String },
    title: { type: String, required: true },
    source: { type: String },
    source_icon: { type: String },
    price: { type: String },
    extracted_price: { type: Number },
    old_price: { type: String },
    extracted_old_price: { type: Number },
    rating: { type: Number },
    reviews: { type: Number },
    thumbnail: { type: String },
    serpapi_thumbnail: { type: String },
    tag: { type: String },
    extensions: { type: [String] },
    delivery: { type: String },
    serpapi_immersive_product_api: { type: String },
    position: { type: Number },
    searchQuery: { type: String, index: true },
    country: { type: String, index: true },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

globalProductSchema.index({ product_id: 1 }, { sparse: true });
globalProductSchema.index({ product_link: 1 }, { sparse: true });

export const GlobalProductModel =
  mongoose.models?.GlobalProduct ??
  mongoose.model("GlobalProduct", globalProductSchema, "GlobalDatabase");
