import type { PreviewRow } from "./preview-storage";

export type RawMappedRow = Record<keyof PreviewRow, string>;

export type CleanGscResult = {
  rows: PreviewRow[];
  rowsLoaded: number;
  rowsValid: number;
  rowsRejected: number;
};

export function cleanGscRows(rows: RawMappedRow[]): CleanGscResult {
  const cleanedRows = rows
    .map(cleanGscRow)
    .filter((row): row is PreviewRow => row !== null);

  return {
    rows: cleanedRows,
    rowsLoaded: rows.length,
    rowsValid: cleanedRows.length,
    rowsRejected: rows.length - cleanedRows.length
  };
}

function cleanGscRow(row: RawMappedRow): PreviewRow | null {
  const query = String(row.query ?? "").trim();
  const page = String(row.page ?? "").trim();
  const clicks = parseIntegerLikeValue(row.clicks);
  const impressions = parseIntegerLikeValue(row.impressions);
  const ctr = parseCtrValue(row.ctr);
  const position = parsePositionValue(row.position);

  if (!query || !page) {
    return null;
  }

  if (clicks === null || impressions === null || ctr === null || position === null) {
    return null;
  }

  return {
    query,
    page,
    clicks: String(clicks),
    impressions: String(impressions),
    ctr: String(ctr),
    position: String(position)
  };
}

function parseIntegerLikeValue(value: string) {
  const cleanedValue = String(value ?? "").replace(/[^0-9.-]/g, "");
  const parsed = Number(cleanedValue);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed);
}

function parseCtrValue(value: string) {
  const rawValue = String(value ?? "").trim();
  const cleanedValue = rawValue.replace(/,/g, ".").replace(/[^0-9.% -]/g, "");
  const parsed = Number(cleanedValue.replace("%", "").trim());

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  if (cleanedValue.includes("%")) {
    return parsed;
  }

  if (parsed <= 0.05) {
    return parsed * 100;
  }

  return parsed;
}

function parsePositionValue(value: string) {
  const cleanedValue = String(value ?? "").trim().replace(",", ".").replace(/[^0-9.-]/g, "");
  const parsed = Number(cleanedValue);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}
