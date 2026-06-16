# Changelog

## MVP1 - Project Skeleton and CSV Upload

- Created Next.js + TypeScript project structure
- Added homepage UI
- Added local CSV upload with drag-and-drop support
- Added Papa Parse CSV parsing
- Displayed detected fields and first 10 rows
- Added privacy note and example report entry

## MVP2 - Field Detection and Mapping

- Added automatic detection for required GSC fields
- Added support for common field aliases
- Added manual field mapping UI
- Added identified, missing, and duplicate mapping states
- Blocked continuation until required fields are mapped

## MVP3 - Data Preview Page

- Added `/preview`
- Stored mapped CSV data in browser session storage
- Displayed mapped rows in a standard GSC column table
- Added rows and columns summary
- Added next-step placeholder for opportunity analysis

## MVP4 - Opportunity Detection Engine

- Added local rule-based SEO opportunity detection
- Implemented High Impression Low CTR detection
- Implemented Position 8-20 detection
- Implemented Position 3-10 Low CTR detection
- Implemented Multiple Keywords On Same Page detection
- Added `/opportunities`

## MVP5 - SEO Consultant Report

- Upgraded opportunities page into report layout
- Added Executive Summary
- Added Top Opportunities
- Added All Opportunities
- Added 14-Day SEO Action Plan
- Added why/action/impact/effort explanations

## MVP6 - PDF Report Export

- Added Download PDF Report button
- Implemented browser-native PDF export through `window.print()`
- Added print-specific CSS
- Kept export local in the browser

## MVP7 - Real GSC CSV Compatibility

- Added expanded field alias compatibility
- Added local data cleaning module
- Added CTR normalization
- Added position normalization
- Added click and impression cleaning
- Added rows loaded, rows valid, and rows rejected summaries
- Added required field error handling

## MVP8 - Dynamic Opportunity Score

- Replaced fixed opportunity scores with dynamic scoring
- Added Impression Score
- Added Position Score
- Added CTR Score
- Added Page Authority Bonus
- Added average score, top score, and highest potential page summaries

## MVP9 - SEO Action Plan

- Added rule-based SEO action plan generation
- Added recommended action lists by opportunity type
- Added Action Priority
- Added Estimated Traffic Gain
- Added Recommended First Action
- Added Biggest Opportunity
- Added Fastest Win
