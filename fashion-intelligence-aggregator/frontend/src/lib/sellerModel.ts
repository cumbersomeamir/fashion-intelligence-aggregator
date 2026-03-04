import mongoose, { Schema } from "mongoose";

const imageAssetSchema = new Schema(
  {
    assetId: { type: String, required: true },
    url: { type: String, required: true },
    key: { type: String },
    label: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sellerProductSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    images: { type: [imageAssetSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const photoshootSchema = new Schema(
  {
    photoshootId: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String },
    referenceImageUrl: { type: String },
    generatedImageUrl: { type: String, required: true },
    generatedImageKey: { type: String },
    prompt: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sellerSchema = new Schema(
  {
    sellerId: { type: String, required: true, unique: true, index: true },
    ownerUserId: { type: String, index: true },
    ownerEmail: { type: String, index: true },

    businessName: { type: String, required: true },
    ownerName: { type: String },
    businessEmail: { type: String },
    businessPhone: { type: String },
    businessCategory: { type: String },
    website: { type: String },
    address: { type: String },
    description: { type: String },

    businessImages: { type: [imageAssetSchema], default: [] },
    products: { type: [sellerProductSchema], default: [] },
    photoshoots: { type: [photoshootSchema], default: [] },

    storageFolders: {
      base: { type: String },
      businessImages: { type: String },
      products: { type: String },
      photoshoots: { type: String },
    },
  },
  { timestamps: true }
);

sellerSchema.index({ ownerUserId: 1, updatedAt: -1 });
sellerSchema.index({ businessEmail: 1, updatedAt: -1 });

export const SellerModel =
  mongoose.models?.Seller ?? mongoose.model("Seller", sellerSchema, "seller");
