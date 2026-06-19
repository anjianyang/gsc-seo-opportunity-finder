# Project Summary

## Project

GSC SEO Opportunity Finder is a browser-based Next.js tool that turns Google Search Console export files into an actionable SEO opportunity report.

The current MVP is local-first. Users upload an export file, confirm field mapping, preview cleaned data, detect SEO opportunities, review a consultant-style report, and export the report as a PDF.

## Current Product Scope

- Local browser upload and parsing
- CSV, TSV, TXT, XLSX, and XLS support
- Google Search Console field auto-detection
- Manual field mapping
- Data preview
- Local numeric data validation and cleaning
- Rule-based SEO opportunity detection
- Dynamic Opportunity Score
- Consultant-style SEO report
- Rule-based 14-day SEO action plan
- Browser-native PDF export through `window.print()`

## Supported GSC Fields

Required fields:

- `query`
- `page`
- `clicks`
- `impressions`
- `ctr`
- `position`

## Current Limitations

- No Google Search Console API
- No user accounts
- No database
- No payment flow
- No AI-generated recommendations in the current MVP
- Data is stored only in the current browser session

## Deployment Readiness

The project uses standard Next.js build scripts and does not require a custom server. It is suitable for Vercel deployment with the default Next.js preset.

