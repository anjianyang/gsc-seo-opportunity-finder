export const PREVIEW_STORAGE_KEY = "gsc-seo-opportunity-preview";

export const REQUIRED_PREVIEW_FIELDS = [
  "query",
  "page",
  "clicks",
  "impressions",
  "ctr",
  "position"
] as const;

export type PreviewField = (typeof REQUIRED_PREVIEW_FIELDS)[number];

export type PreviewRow = Record<PreviewField, string>;

export type PreviewPayload = {
  fileName: string;
  rowsLoaded: number;
  rowsValid: number;
  rowsRejected: number;
  columnsDetected: number;
  rows: PreviewRow[];
};
