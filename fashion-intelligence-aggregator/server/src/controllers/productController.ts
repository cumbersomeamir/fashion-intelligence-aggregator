import type { Request, Response } from "express";
import * as productService from "../services/productService.js";

export function getProducts(_req: Request, res: Response): void {
  const products = productService.getAllProducts();
  res.json(products);
}

export function getProductById(req: Request, res: Response): void {
  const { id } = req.params;
  const product = productService.getProductById(id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
}
