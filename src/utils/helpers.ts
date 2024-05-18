export function formatNumber(value: any) {
  return (value || "0").toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}