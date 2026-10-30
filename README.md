# E-Shop — permanent Cloudinary product photos (Phase 1)

This is a patch for the existing `gosbertreonsi-ux/ecommerce` project on the `deploy-preview` branch. It changes the **backend image storage only**, retaining all existing routes, frontend components, themes, ProductImage columns, and Neon data.

## 1. Get Cloudinary credentials

Create a free Cloudinary account: https://cloudinary.com/pricing
In the Cloudinary Console, locate your **Cloud name, API key, and API secret** under Settings > API Keys.
**Never share the API secret or push it to GitHub.**

## 2. Back up the three files to be replaced

From PowerShell in the project root:

```powershell
Copy-Item backend/src/middlewares/upload.middleware.ts backend/src/middlewares/upload.middleware.ts.bak
Copy-Item backend/src/modules/admin/products/product-image.service.ts backend/src/modules/admin/products/product-image.service.ts.bak
```

Copy the three files from this patch into the matching paths. `backend/src/config/cloudinary.ts` is new. The other two replace the existing files. Prefer extracting the ZIP to a temporary location first to inspect differences.

## 3. Install the cloud SDK

```powershell
cd "C:\Users\H P\ecommerce-system\backend"
npm install cloudinary
```

This updates both package.json and package-lock.json. Keep both changes in your commit.

## 4. Set backend environment variables locally and in Render

```dotenv
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_secret"
```

In Render: eshop-api-preview > Environment. Add the 3 credentials as private values. **Do not set VITE_ variables for these secrets.**

You do not need to modify Prisma schema or run a migration.

## 5. Test the build locally

```powershell
cd "C:\Users\H P\ecommerce-system\backend"
npx prisma generate
npm run build
```

If building locally, make sure your backend `.env` still contains a valid DIRECT_URL and DATABASE_URL for Prisma.

## 6. Commit and deploy

```powershell
cd "C:\Users\H P\ecommerce-system"
git status
git add backend/src/config/cloudinary.ts backend/src/middlewares/upload.middleware.ts backend/src/modules/admin/products/product-image.service.ts backend/package.json backend/package-lock.json
git commit -m "Store E-Shop product images in Cloudinary"
git push origin deploy-preview
```

Your backend's Render auto-deploy will rebuild. Confirm the deployment reports Live.

## 7. Test image persistence

1. Log in as your private E-Shop admin.
2. Go to `/admin/products` on the deployed website.
3. Edit one seeded product, e.g. Modern Desk Lamp.
4. Upload a genuine product photo that you own or are licensed to use (JPEG/PNG/WebP/GIF, max 5 MB).
5. Mark it primary and save.
6. Check the product on the public storefront: its `imageUrl` should start with `https://res.cloudinary.com/`.
7. Trigger a redeploy or revisit later: the image should remain visible.
8. Try deletion: only images uploaded by this patch are removed from Cloudinary.

Existing `placehold.co` placeholder URLs remain until you replace them manually. Existing `/uploads/...` paths are not automatically migrated; they may already have disappeared from the old Render disk.

## Notes

* This code preserves the existing admin-only API route and the form field name `images`.
* Do not copy `.bak` files to Git or commit them. The existing backend `.gitignore` ignores `.env`, not `.bak`.
* For production, add periodic cleanup/reconciliation for orphaned assets if needed, and monitor free-plan usage limits.
* This patch has no database schema changes. Test on your preview before production rollout.
