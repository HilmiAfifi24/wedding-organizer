export const isPdfFile = (url: string) =>
  url.startsWith("data:application/pdf") || url.toLowerCase().endsWith(".pdf");

export const isImageFile = (url: string) =>
  url.startsWith("data:image/") ||
  [".jpg", ".jpeg", ".png", ".webp"].some((suffix) => url.toLowerCase().endsWith(suffix));
