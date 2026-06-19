# Deployment Guide

## Platform

Recommended platform: Vercel

## Vercel Settings

- Framework Preset: `Next.js`
- Root Directory: repository root
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty/default
- Development Command: `npm run dev`
- Node.js Version: `20.x`
- Environment Variables: none required for the current MVP

## Local Build Verification

Run:

```powershell
npm.cmd install
npm.cmd run build
```

Expected result:

- Next.js production build completes successfully
- TypeScript validation passes
- Static pages are generated

## Runtime Notes

- The app runs fully in the browser for the current MVP.
- File parsing is local to the browser session.
- PDF export uses `window.print()`.
- No external API credentials are required.

## Post-Deploy Smoke Test

After deployment:

1. Open the live URL.
2. Upload a supported GSC sample file.
3. Confirm field mapping.
4. Continue to data preview.
5. Continue to opportunity analysis.
6. Confirm Executive Summary and opportunities render.
7. Click `Download PDF Report`.
8. Save as PDF and confirm the report is readable.

