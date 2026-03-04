import { SellerGenerateContent } from "./components/SellerGenerateContent";

interface SellerGeneratePageProps {
  searchParams?: Promise<{ sellerId?: string | string[] }>;
}

export default async function SellerGeneratePage({ searchParams }: SellerGeneratePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawSellerId = resolvedSearchParams.sellerId;
  const initialSellerId = Array.isArray(rawSellerId) ? rawSellerId[0] ?? "" : rawSellerId ?? "";
  return <SellerGenerateContent initialSellerId={initialSellerId} />;
}
