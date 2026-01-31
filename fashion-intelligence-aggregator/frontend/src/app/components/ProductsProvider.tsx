"use client";

import { useEffect } from "react";
import { useStore } from "@/state/store";
import { fetchProducts } from "@/lib/api";

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const { setProducts, setProductsLoading } = useStore();

  useEffect(() => {
    setProductsLoading(true);
    fetchProducts()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [setProducts, setProductsLoading]);

  return <>{children}</>;
}
