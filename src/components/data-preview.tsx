"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PREVIEW_STORAGE_KEY,
  REQUIRED_PREVIEW_FIELDS,
  type PreviewPayload
} from "@/lib/preview-storage";

export function DataPreview() {
  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const storedPayload = window.sessionStorage.getItem(PREVIEW_STORAGE_KEY);

    if (storedPayload) {
      try {
        setPayload(JSON.parse(storedPayload) as PreviewPayload);
      } catch {
        setPayload(null);
      }
    }

    setHasLoaded(true);
  }, []);

  if (!hasLoaded) {
    return null;
  }

  if (!payload || payload.rows.length === 0) {
    return (
      <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
        <section className="mx-auto max-w-4xl border border-ink/15 bg-white/70 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
            Data preview
          </p>
          <h1 className="mt-4 text-4xl font-black text-ink">No data loaded.</h1>
          <p className="mt-4 text-base leading-7 text-ink/70">
            Upload a CSV and confirm the required field mapping before opening the
            preview page.
          </p>
          <Link
            className="mt-6 inline-flex border border-ink bg-ink px-5 py-3 text-sm font-black text-cream transition hover:bg-moss"
            href="/"
          >
            Back to upload
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-ink/15 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
              Data preview
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-ink sm:text-5xl">
              Review the mapped Search Console data.
            </h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Rows loaded" value={String(payload.rowsLoaded)} />
            <SummaryCard label="Rows valid" value={String(payload.rowsValid ?? payload.rows.length)} />
            <SummaryCard label="Rows rejected" value={String(payload.rowsRejected ?? 0)} />
            <SummaryCard label="Columns detected" value={String(payload.columnsDetected)} />
          </div>
        </header>

        <section className="border border-ink/15 bg-white/75 p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-ink">First 10 rows</h2>
              <p className="mt-2 text-sm text-ink/62">{payload.fileName}</p>
            </div>
            <p className="text-sm font-semibold text-ink/60">
              Showing mapped columns only
            </p>
          </div>

          <div className="mt-5 overflow-x-auto border border-ink/10 bg-white">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-ink text-cream">
                <tr>
                  {REQUIRED_PREVIEW_FIELDS.map((field) => (
                    <th className="whitespace-nowrap px-3 py-3 font-bold" key={field}>
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payload.rows.slice(0, 10).map((row, rowIndex) => (
                  <tr className="border-t border-ink/10" key={`${payload.fileName}-${rowIndex}`}>
                    {REQUIRED_PREVIEW_FIELDS.map((field) => (
                      <td className="max-w-sm truncate px-3 py-3 text-ink/76" key={field}>
                        {row[field] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link className="text-sm font-bold text-moss hover:text-ink" href="/">
              &lt;- Back to field mapping
            </Link>
            <Link
              className="border border-ink bg-ink px-5 py-3 text-sm font-black text-cream transition hover:bg-moss"
              href="/opportunities"
            >
              Continue to opportunity analysis
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-44 border border-ink/10 bg-white/75 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-moss">{label}</p>
      <p className="mt-2 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}
