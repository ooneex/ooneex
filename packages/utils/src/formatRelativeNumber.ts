export const formatRelativeNumber = (num: number, config?: { precision?: number; lang?: string }): string => {
  return new Intl.NumberFormat(config?.lang ?? "en-GB", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: config?.precision ?? 1,
  }).format(num);
};
