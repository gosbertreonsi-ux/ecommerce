export const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");