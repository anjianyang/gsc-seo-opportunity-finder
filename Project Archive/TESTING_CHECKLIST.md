# Testing Checklist

## Upload Formats

Test these sample formats from `public/samples/`:

- CSV: `gsc-high-impression-low-ctr.csv`
- TSV: `gsc-keyword-cluster.tsv`
- TXT: `gsc-near-page-one.txt`
- XLSX: `gsc-good-performance.xlsx`
- XLS: `gsc-real-world-sample.xls`

Expected:

- File is accepted
- Fields are detected
- Manual mapping remains available
- Preview page shows rows and summary metrics

## Required Fields

Confirm these fields map correctly:

- `query`
- `page`
- `clicks`
- `impressions`
- `ctr`
- `position`

## Opportunity Detection

Confirm reports can detect:

- High Impression Low CTR
- Position 8-20
- Position 3-10 Low CTR
- Multiple Keywords On Same Page
- Position 11-20 Opportunity

## Negative Upload Tests

Use `public/samples/errors/`:

- `gsc-missing-required-fields.csv`: should show `Required GSC fields missing`
- `gsc-empty-file.csv`: should show `Empty file`
- `gsc-invalid-numeric-values.csv`: should trigger invalid numeric validation
- `gsc-invalid-numeric-values.xls`: should show `Invalid numeric values detected`
- `gsc-unsupported-format.json`: should show `Unsupported file type`
- `gsc-no-worksheet-data.xlsx`: should show `No worksheet data found`

## PDF Export

On `/opportunities`:

1. Click `Download PDF Report`.
2. Choose `Save as PDF`.
3. Confirm the report includes:
   - Executive Summary
   - Top Opportunities
   - All Opportunities
   - 14-Day SEO Action Plan
4. Confirm the PDF has no visible buttons or browser overlay artifacts where print CSS can hide them.
5. Confirm the All Opportunities table is readable.

## Build Check

Run:

```powershell
npm.cmd run build
```

Expected:

- Build completes successfully
- TypeScript checks pass
- Static pages generate successfully

