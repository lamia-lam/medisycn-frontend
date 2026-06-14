export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export function getStockStatus(
  stockQty: number,
  lowStockThreshold: number,
): StockStatus {
  if (stockQty === 0) return "Out of Stock";
  if (stockQty <= lowStockThreshold) return "Low Stock";
  return "In Stock";
}

export function statusToSlug(status: StockStatus): string {
  return status.toLowerCase().replace(/ /g, "-");
}
