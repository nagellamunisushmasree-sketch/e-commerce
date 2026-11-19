export function getProductImageUrl(imageUrl) {
  if (!imageUrl) return null;

  if (imageUrl.startsWith('/uploads/')) {
    return new URL(
      imageUrl,
      import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    ).href;
  }

  return imageUrl;
}
