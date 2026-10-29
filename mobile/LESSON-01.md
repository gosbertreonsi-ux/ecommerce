# E-Shop Mobile — Lesson 01: React Native foundations and API catalog

This is a **source-code patch** for a fresh Expo project; it is not a standalone Expo installation. The existing `backend/` and `frontend/` are unchanged.

## 0. Create the Expo project on Windows

Open PowerShell at your project root:

```powershell
cd "C:\Users\H P\ecommerce-system"
npx create-expo-app@latest mobile
```

Choose the stable SDK that matches the Expo Go app on your phone. Expo's October 2026 SDK 58 release notes say the store Expo Go version is transitioning; the default SDK 57 template is recommended for physical Expo Go during this period. The generated project already has Expo Router and TypeScript.

## 1. Copy the lesson files into mobile/

Extract the ZIP in the **project root**. It contains only `mobile/src/...`, `mobile/.env.example`, and this guide. Replace `mobile/src/app/_layout.tsx` and `mobile/src/app/index.tsx`; create the other new files. No other template files are required to be deleted for this lesson.

## 2. Configure API access from your phone

```powershell
ipconfig
```

Find your active Wi-Fi adapter's `IPv4 Address` (for example, `192.168.1.42`). From the same computer:

```powershell
Copy-Item .\mobile\.env.example .\mobile\.env
notepad .\mobile\.env
```

Change the example to your **real** PC IP, e.g.:

```ini
EXPO_PUBLIC_API_URL=http://192.168.1.42:5000/api
```

This is only an example, not your detected address. Test in your **phone's browser**:

```text
http://192.168.1.42:5000/api/products
```

The response should be JSON with `success: true` and product data. If that fails, make sure the backend is running and Windows Firewall allows access on a private network. Your phone and computer must be on a network that permits direct communication. Using `--tunnel` for Metro alone does **not** expose your local backend.

## 3. Start the backend and mobile app in separate terminals

Backend terminal:

```powershell
cd "C:\Users\H P\ecommerce-system\backend"
npm run dev
```

Mobile terminal:

```powershell
cd "C:\Users\H P\ecommerce-system\mobile"
npx expo start -c
```

Scan the QR code using Expo Go on an Android phone or follow Expo's iPhone instructions. Expo Go compatibility depends on the SDK version installed. To type-check:

```powershell
npx tsc --noEmit
```

## What the files teach

- `src/types/product.ts`: TypeScript contracts for data from the existing Express API.
- `src/lib/api.ts`: REST requests, error handling, API base URL, absolute uploaded-image URLs.
- `src/theme/ShopTheme.tsx`: React context and theme state; currently resets when app restarts.
- `src/components/ProductCard.tsx`: React Native `View`, `Text`, `Image`, `Pressable` and native styles.
- `src/app/index.tsx`: data fetching with hooks, pull-to-refresh, category filters, search, a two-column `FlatList` and theme toggle.
- `src/app/product/[id].tsx`: dynamic route, product gallery, next/previous images, stock-aware variant buttons.

## Known boundaries of this lesson

- Product browsing is live. Authentication, cart mutations, checkout, payment and persistent theme settings are planned lessons, **not** implemented here.
- Expo UI is native; copying a website's HTML/CSS or Anime DOM overlays directly will not work. We will adapt the animations later with React Native tools.
- Local `http://` is for development. Production should use a public HTTPS API endpoint.
- `EXPO_PUBLIC_` values are included in the app bundle. Do **not** put JWT secrets, DB passwords, or admin tokens in these variables.
- We only read public product endpoints; no changes are made to the existing Express API or database.

## Mini-exercises

1. In `src/theme/ShopTheme.tsx`, change `background` for dark mode. Observe the hot reload.
2. In `src/components/ProductCard.tsx`, change the product name font size.
3. In `src/app/index.tsx`, add an active `Only Featured` filter.
4. Select a product variant. Explain why the value changes selected SKU/stock but not price in this backend.

## Git

```powershell
cd "C:\Users\H P\ecommerce-system"
git switch -c feature/react-native-mobile
git add mobile
git commit -m "feat(mobile): build React Native catalog connected to existing API"
```

Check that `.env` is ignored before committing; Expo's generated project normally ignores environment files. If needed, add `mobile/.env` to your root `.gitignore`.
