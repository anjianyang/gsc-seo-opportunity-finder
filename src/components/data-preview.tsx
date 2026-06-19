"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PREVIEW_STORAGE_KEY } from "@/lib/preview-storage";

type PreviewRow = {
  query?: string;
  page?: string;
  clicks?: string;
  impressions?: string;
  ctr?: string;
  position?: string;
  [key: string]: string | undefined;
};

type PreviewPayload = {
  fields?: string[];
  columns?: string[];
  rows?: PreviewRow[];
  rawRows?: PreviewRow[];
  mappedRows?: PreviewRow[];
  cleanedRows?: PreviewRow[];
  mapping?: Record<string, string>;
  fieldMapping?: Record<string, string>;
  rowsLoaded?: number;
  rowsValid?: number;
  rowsRejected?: number;
  columnsDetected?: number;
  validationSummary?: {
    rowsLoaded?: number;
    rowsValid?: number;
    rowsRejected?: number;
    columnsDetected?: number;
  };
};

const PREVIEW_COLUMNS = ["query", "page", "clicks", "impressions", "ctr", "position"] as const;

export function DataPreview() {
  const router = useRouter();
  const [payload, setPayload] = useState<PreviewPayload | null>(null);

  useEffect(() => {
    const storedPayload = window.sessionStorage.getItem(PREVIEW_STORAGE_KEY);

    if (!storedPayload) {
      setPayload(null);
      return;
    }

    try {
      setPayload(JSON.parse(storedPayload) as PreviewPayload);
    } catch {
      setPayload(null);
    }
  }, []);

  const mappedRows = useMemo(() => getMappedRows(payload), [payload]);
  const summary = useMemo(() => getSummary(payload, mappedRows), [payload, mappedRows]);
  const previewRows = mappedRows.slice(0, 10);

  if (!payload || mappedRows.length === 0) {
    return (
      <main className="min-h-screen bg-[#f3f5e9] px-6 py-12 text-[#18221b] md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl rounded-sm border border-[#18221b]/15 bg-white/65 p-8 shadow-sm">
          <h1 className="text-4xl font-black">Data Preview</h1>
          <p className="mt-5 text-lg text-[#3f463f]">No data loaded.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f5e9] px-6 py-12 text-[#18221b] md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[#d7d4c8] pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#2f6f43]">
            Data Preview
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-tight">
            Review the first 10 mapped rows.
          </h1>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <SummaryCard label="Rows Loaded" value={summary.rowsLoaded} />
          <SummaryCard label="Rows Valid" value={summary.rowsValid} />
          <SummaryCard label="Rows Rejected" value={summary.rowsRejected} />
          <SummaryCard label="Columns Detected" value={summary.columnsDetected} />
        </section>

        <section className="mt-8 overflow-hidden rounded-sm border border-[#18221b]/15 bg-white/65 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-[#162219] text-[#fffdf6]">
                <tr>
                  {PREVIEW_COLUMNS.map((column) => (
                    <th key={column} className="px-4 py-4 font-black uppercase tracking-[0.12em]">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={`${row.query ?? "row"}-${index}`} className="border-t border-[#e4dfd1]">
                    {PREVIEW_COLUMNS.map((column) => (
                      <td key={column} className="max-w-[320px] px-4 py-4 align-top text-[#283228]">
                        {row[column] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="bg-[#162219] px-8 py-4 text-sm font-black text-[#fffdf6] shadow-[6px_6px_0_#c6a15b] transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#c6a15b]"
            onClick={() => router.push("/opportunities")}
          >
            Continue to opportunity analysis
          </button>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-[#18221b]/15 bg-white/65 p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#55724e]">{label}</p>
      <p className="mt-3 text-4xl font-black text-[#18221b]">{value}</p>
    </div>
  );
}

function getSummary(payload: PreviewPayload | null, mappedRows: PreviewRow[]) {
  const rowsLoaded =
    payload?.rowsLoaded ??
    payload?.validationSummary?.rowsLoaded ??
    payload?.rows?.length ??
    payload?.rawRows?.length ??
    mappedRows.length;

  return {
    rowsLoaded,
    rowsValid:
      payload?.rowsValid ??
      payload?.validationSummary?.rowsValid ??
      payload?.cleanedRows?.length ??
      payload?.mappedRows?.length ??
      mappedRows.length,
    rowsRejected: payload?.rowsRejected ?? payload?.validationSummary?.rowsRejected ?? 0,
    columnsDetected:
      payload?.columnsDetected ??
      payload?.validationSummary?.columnsDetected ??
      payload?.columns?.length ??
      payload?.fields?.length ??
      PREVIEW_COLUMNS.length,
  };
}

function getMappedRows(payload: PreviewPayload | null): PreviewRow[] {
  if (!payload) {
    return [];
  }

  if (payload.cleanedRows?.length) {
    return payload.cleanedRows;
  }

  if (payload.mappedRows?.length) {
    return payload.mappedRows;
  }

  const sourceRows = payload.rows ?? payload.rawRows ?? [];
  const mapping = payload.mapping ?? payload.fieldMapping;

  if (!mapping) {
    return sourceRows;
  }

  return sourceRows.map((row) => ({
    query: row[mapping.query] ?? "",
    page: row[mapping.page] ?? "",
    clicks: row[mapping.clicks] ?? "",
    impressions: row[mapping.impressions] ?? "",
    ctr: row[mapping.ctr] ?? "",
    position: row[mapping.position] ?? "",
  }));
}
