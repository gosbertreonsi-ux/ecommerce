/** E-Shop's existing currency; do not hardcode sample product prices. */
export function formatTZS(price: number): string {
  return `TZS ${price.toLocaleString("en-TZ", { maximumFractionDigits: 0 })}`;
}
