# E-Shop Mobile — website design alignment (Lesson 01 refinement)

This is a **small UI-only patch** for the React Native + Expo mobile project made in Lesson 01. It follows the real E-Shop website's layout and visual language instead of using the generic starter look.

## Replace only these paths in your existing project

| File | Change |
| --- | --- |
| `mobile/src/app/index.tsx` | Editorial homepage: original headline/copy, hero image, categories, philosophy, featured selection, closing banner and footer, working product search and filters |
| `mobile/src/components/ProductCard.tsx` | Unboxed portrait product cards and working left/right gallery arrows with legible `1 / 3` counters |
| `mobile/src/app/product/[id].tsx` | Product detail page styles, gallery counters, thumbnails and variants in the same brand style |
| `mobile/assets/e-shop-lion.png` | Transparent PNG export of the E-Shop lion SVG you supplied (React Native Image-compatible asset) |

**Nothing in the website or backend is changed.** The original mobile `ShopTheme.tsx`, `api.ts`, `product.ts` and `.env` stay as they are. No additional packages are required for this patch.

### Apply in PowerShell

From `C:\Users\H P\ecommerce-system`, place the ZIP file in that directory and run:

```powershell
Expand-Archive -Path ".\E-Shop-Mobile-Web-Design-Alignment.zip" -DestinationPath "." -Force
cd .\mobile
npx expo start --web --clear
```

If a Metro instance is already running, stop it with `Ctrl+C` before restarting. After the browser preview loads, reopen the Basalt preview if you want a phone frame.

### What stays functional

- Existing Express API and real database products and images
- Theme switching, product navigation, search, category filters and pull-to-refresh
- Product variants and variant-by-image-alt-text selection, no new API requests

### Still separate mobile lessons

- The website's promotional video/audio and scrolling anime overlays require native implementations and are not reproduced in this patch.
- Authentication, server-connected cart, checkout and payments have not yet been added to the mobile app.
- The website's custom fonts may not be installed on every phone. Georgia/native serif is a temporary fallback, so visual alignment is close but not yet pixel-identical.
- Website CSS and DOM effects cannot directly run inside React Native.

### Learn what changed

1. `FlatList` replaces a DOM page and includes editorial sections using `ListHeaderComponent` and `ListFooterComponent`.
2. `Image` with `resizeMode="cover"` emulates `object-fit: cover`.
3. `Pressable` replaces anchors and buttons; `expo-router` handles navigation.
4. Native `StyleSheet` recreates margins, borders and typography from your existing `storefront.css` and `dark-mode.css`.
5. Brand art stored as PNG is loaded locally, whereas remote product images are delivered by your existing Express API.
