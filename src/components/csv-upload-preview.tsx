"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

import { validateGscNumericFields } from "@/lib/gsc-numeric-validation";
import { PREVIEW_STORAGE_KEY } from "@/lib/preview-storage";

type RequiredField = "query" | "page" | "clicks" | "impressions" | "ctr" | "position";
type ParsedRow = Record<string, string>;
type FieldMapping = Record<RequiredField, string>;
type SupportedExtension = "csv" | "tsv" | "txt" | "xlsx" | "xls";

type ParsedFile = {
  fields: string[];
  rows: ParsedRow[];
};

const REQUIRED_FIELDS: RequiredField[] = [
  "query",
  "page",
  "clicks",
  "impressions",
  "ctr",
  "position",
];

const SUPPORTED_EXTENSIONS: SupportedExtension[] = ["csv", "tsv", "txt", "xlsx", "xls"];

const FIELD_ALIASES: Record<RequiredField, string[]> = {
  query: ["query", "search query", "top query", "keyword"],
  page: ["page", "url", "landing page"],
  clicks: ["clicks"],
  impressions: ["impressions"],
  ctr: ["ctr", "click through rate"],
  position: ["position", "average position"],
};

const EMPTY_MAPPING: FieldMapping = {
  query: "",
  page: "",
  clicks: "",
  impressions: "",
  ctr: "",
  position: "",
};

export function CsvUploadPreview() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<FieldMapping>(EMPTY_MAPPING);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const missingFields = useMemo(
    () => REQUIRED_FIELDS.filter((field) => !mapping[field]),
    [mapping],
  );

  const hasRequiredFields = missingFields.length === 0;
  const uploadStatus = isParsing
    ? "Parsing..."
    : fileName
      ? fields.length > 0
        ? "Ready for mapping"
        : `Selected: ${fileName}`
      : "No file selected";

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError("");
    setIsParsing(true);
    setFileName(file.name);

    try {
      const extension = getFileExtension(file.name);

      if (!isSupportedExtension(extension)) {
        throw new Error("Unsupported file type");
      }

      const parsedFile =
        extension === "xlsx" || extension === "xls"
          ? await parseSpreadsheetFile(file)
          : await parseDelimitedTextFile(file, extension);

      if (parsedFile.rows.length === 0 || parsedFile.fields.length === 0) {
        throw new Error(extension === "xlsx" || extension === "xls" ? "No worksheet data found" : "Empty file");
      }

      setFields(parsedFile.fields);
      setRows(parsedFile.rows);
      setMapping(detectFieldMapping(parsedFile.fields));
    } catch (caughtError) {
      setFields([]);
      setRows([]);
      setMapping(EMPTY_MAPPING);
      setError(caughtError instanceof Error ? caughtError.message : "Failed to parse file");
    } finally {
      setIsParsing(false);
    }
  }

  function handleContinueToPreview() {
    setError("");

    if (!hasRequiredFields) {
      setError("Required GSC fields missing");
      return;
    }

    const numericValidation = validateGscNumericFields(rows, mapping);

    if (numericValidation.invalidRowCount > 0) {
      setError("Invalid numeric values detected");
      return;
    }

    const mappedRows = rows.map((row) => mapRow(row, mapping));

    const previewPayload = {
      fields,
      columns: fields,
      mapping,
      fieldMapping: mapping,
      rows,
      rawRows: rows,
      mappedRows,
      cleanedRows: mappedRows,
      validationSummary: {
        rowsLoaded: rows.length,
        rowsValid: mappedRows.length,
        rowsRejected: 0,
      },
    };

    window.sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(previewPayload));
    router.push("/preview");
  }

  return (
    <section className="grid w-full gap-8">
      <div
        className="w-full rounded-sm border border-[#18221b]/15 bg-white/65 p-6 shadow-sm"
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
      >
        <div
          className={`flex min-h-[220px] w-full flex-col items-center justify-center border-2 border-dashed px-8 py-10 text-center transition ${
            isDragging
              ? "border-[#2f6f43] bg-[#edf5e8]"
              : "border-[#c9c4b6] bg-[#fbf8ee]"
          }`}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#c9c4b6] bg-[#fffdf6] text-2xl text-[#2f6f43]">
            ↑
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#55724e]">
            Upload
          </p>
          <h2 className="max-w-3xl text-balance text-3xl font-black leading-tight text-[#18221b] md:text-4xl">
            Drop your GSC export here.
          </h2>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,.xls"
          hidden
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
          <button
            type="button"
            className="mt-6 inline-flex items-center justify-center bg-[#162219] px-8 py-4 text-sm font-black text-[#fffdf6] shadow-[6px_6px_0_#c6a15b] transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#c6a15b]"
            onClick={() => inputRef.current?.click()}
          >
          {isParsing ? "Parsing..." : "Choose file"}
          </button>
          <div className="mt-5 w-full max-w-2xl rounded-sm border border-[#e4dfd1] bg-[#fffdf6] px-4 py-3 text-sm">
            <p className="font-black text-[#18221b]">{uploadStatus}</p>
            {fileName && !isParsing ? (
              <p className="mt-1 truncate text-xs font-semibold text-[#667066]">{fileName}</p>
            ) : null}
          </div>
          <p className="mt-3 max-w-2xl text-pretty text-xs font-semibold leading-5 text-[#667066]">
            Supports CSV, TSV, TXT, XLSX, and XLS. Files are parsed locally in your browser.
          </p>
          {error ? (
            <div className="mt-6 w-full max-w-2xl border border-[#b6463d] bg-[#fff3ef] px-5 py-4 text-sm font-bold text-[#8f241b]">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      {fields.length > 0 ? (
        <div className="w-full rounded-sm border border-[#18221b]/15 bg-white/65 p-6 shadow-sm">
          <div className="border-b border-[#ded9ca] pb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#55724e]">
              Field mapping
            </p>
            <h2 className="mt-3 text-2xl font-black text-[#18221b]">
              Confirm detected GSC fields
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#596159]">
              We auto-detected common Google Search Console columns. Adjust any
              field before continuing.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {REQUIRED_FIELDS.map((field) => (
              <label
                key={field}
                className="grid gap-4 rounded-sm border border-[#e4dfd1] bg-[#fbf8ee] p-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center"
              >
                <span className="flex items-center justify-between gap-3 md:block">
                  <span className="text-sm font-black uppercase tracking-[0.12em] text-[#18221b]">
                    {field}
                  </span>
                  <span
                    className={`text-xs font-black uppercase tracking-[0.12em] md:mt-2 md:block ${
                      mapping[field] ? "text-[#2f6f43]" : "text-[#a15f16]"
                    }`}
                  >
                    {mapping[field] ? "✓ Identified" : "⚠ Missing"}
                  </span>
                </span>
                <select
                  className="w-full rounded-none border border-[#cfc8b8] bg-[#fffdf6] px-3 py-3 text-sm font-semibold text-[#18221b] outline-none transition focus:border-[#2f6f43] focus:ring-2 focus:ring-[#dbe8d4]"
                  value={mapping[field]}
                  onChange={(event) =>
                    setMapping((currentMapping) => ({
                      ...currentMapping,
                      [field]: event.target.value,
                    }))
                  }
                >
                  <option value="">Select column</option>
                  {fields.map((fieldName) => (
                    <option key={fieldName} value={fieldName}>
                      {fieldName}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div
            className={`mt-6 border px-5 py-4 text-sm font-bold ${
              hasRequiredFields
                ? "border-[#b9d1ad] bg-[#edf5e8] text-[#2f6f43]"
                : "border-[#e2c898] bg-[#fff7df] text-[#8a5a0a]"
            }`}
          >
            {hasRequiredFields ? "Ready for next step" : "Missing or duplicate fields"}
          </div>

          <div className="mt-5 rounded-sm border border-[#e4dfd1] bg-[#fbf8ee] p-4 text-sm leading-7 text-[#3f463f]">
            <strong className="text-[#18221b]">Rows loaded:</strong> {rows.length}
            <br />
            <strong className="text-[#18221b]">Columns detected:</strong> {fields.length}
          </div>

          <button
            type="button"
            className="mt-6 w-full bg-[#162219] px-8 py-4 text-sm font-black text-[#fffdf6] shadow-[6px_6px_0_#c6a15b] transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[8px_8px_0_#c6a15b] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
            disabled={!hasRequiredFields}
            onClick={handleContinueToPreview}
          >
            Continue to data preview
          </button>
        </div>
      ) : null}
    </section>
  );
}

async function parseDelimitedTextFile(
  file: File,
  extension: SupportedExtension,
): Promise<ParsedFile> {
  const text = await file.text();

  if (!text.trim()) {
    throw new Error("Empty file");
  }

  const delimiter = extension === "tsv" || (extension === "txt" && text.includes("\t")) ? "\t" : "";

  return new Promise((resolve, reject) => {
    Papa.parse<ParsedRow>(text, {
      delimiter,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0 && result.data.length === 0) {
          reject(new Error("Failed to parse file"));
          return;
        }

        resolve({
          fields: (result.meta.fields ?? []).filter(Boolean),
          rows: normalizeRows(result.data),
        });
      },
      error: () => reject(new Error("Failed to parse file")),
    });
  });
}

async function parseSpreadsheetFile(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();

  if (buffer.byteLength === 0) {
    throw new Error("Empty file");
  }

  try {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new Error("No worksheet data found");
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
      raw: false,
    });

    if (rows.length === 0) {
      throw new Error("No worksheet data found");
    }

    return {
      fields: Object.keys(rows[0] ?? {}).filter(Boolean),
      rows: normalizeRows(rows),
    };
  } catch (caughtError) {
    if (caughtError instanceof Error && caughtError.message === "No worksheet data found") {
      throw caughtError;
    }

    throw new Error("Failed to parse file");
  }
}

function detectFieldMapping(fields: string[]): FieldMapping {
  return REQUIRED_FIELDS.reduce<FieldMapping>((detectedMapping, requiredField) => {
    const aliases = FIELD_ALIASES[requiredField].map(normalizeFieldName);
    const matchedField = fields.find((field) => aliases.includes(normalizeFieldName(field)));

    return {
      ...detectedMapping,
      [requiredField]: matchedField ?? "",
    };
  }, EMPTY_MAPPING);
}

function mapRow(row: ParsedRow, mapping: FieldMapping) {
  return {
    query: row[mapping.query] ?? "",
    page: row[mapping.page] ?? "",
    clicks: row[mapping.clicks] ?? "",
    impressions: row[mapping.impressions] ?? "",
    ctr: row[mapping.ctr] ?? "",
    position: row[mapping.position] ?? "",
  };
}

function normalizeRows(rows: Record<string, unknown>[]): ParsedRow[] {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, value == null ? "" : String(value)]),
    ),
  );
}

function normalizeFieldName(fieldName: string) {
  return fieldName.trim().toLowerCase();
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isSupportedExtension(extension: string): extension is SupportedExtension {
  return SUPPORTED_EXTENSIONS.includes(extension as SupportedExtension);
}
