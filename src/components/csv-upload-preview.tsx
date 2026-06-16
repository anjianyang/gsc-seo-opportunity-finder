"use client";

import Papa from "papaparse";
import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import { cleanGscRows, type RawMappedRow } from "@/lib/gsc-data-cleaning";
import {
  PREVIEW_STORAGE_KEY,
  REQUIRED_PREVIEW_FIELDS,
  type PreviewPayload,
  type PreviewRow
} from "@/lib/preview-storage";

type CsvRow = Record<string, string>;

type RequiredField = "query" | "page" | "clicks" | "impressions" | "ctr" | "position";

type ParseState = {
  fileName: string;
  fields: string[];
  rows: CsvRow[];
  totalRows: number;
};

type FieldMapping = Record<RequiredField, string>;

type MappingValidation = {
  isValid: boolean;
  duplicateFields: Set<string>;
};

const REQUIRED_FIELDS: Array<{
  key: RequiredField;
  label: string;
  aliases: string[];
}> = [
  {
    key: "query",
    label: "Query",
    aliases: ["query", "queries", "search query", "top query", "keyword"]
  },
  {
    key: "page",
    label: "Page",
    aliases: ["page", "url", "landing page"]
  },
  {
    key: "clicks",
    label: "Clicks",
    aliases: ["clicks", "click"]
  },
  {
    key: "impressions",
    label: "Impressions",
    aliases: ["impressions", "impression"]
  },
  {
    key: "ctr",
    label: "CTR",
    aliases: ["ctr", "average ctr", "click through rate", "click-through rate"]
  },
  {
    key: "position",
    label: "Position",
    aliases: ["position", "average position", "avg position"]
  }
];

const EMPTY_MAPPING: FieldMapping = {
  query: "",
  page: "",
  clicks: "",
  impressions: "",
  ctr: "",
  position: ""
};

export function CsvUploadPreview() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParseState | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>(EMPTY_MAPPING);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const mappingValidation = useMemo(
    () => getMappingValidation(fieldMapping),
    [fieldMapping]
  );

  function parseFile(file: File) {
    setError(null);
    setValidationError(null);
    setPreview(null);
    setFieldMapping(EMPTY_MAPPING);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a .csv file exported from Google Search Console.");
      return;
    }

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const fields = result.meta.fields?.filter(Boolean) ?? [];

        if (fields.length === 0) {
          setError("No CSV headers were found. Please check the exported file.");
          return;
        }

        setPreview({
          fileName: file.name,
          fields,
          rows: result.data,
          totalRows: result.data.length
        });
        setFieldMapping(detectFieldMapping(fields));
      },
      error: () => {
        setError("We could not read this CSV. Please export it again from Google Search Console.");
      }
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      parseFile(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      parseFile(file);
    }
  }

  function handleContinueToPreview() {
    if (!preview || !mappingValidation.isValid) {
      return;
    }

    if (!fieldMapping.query || !fieldMapping.page) {
      setValidationError("Required GSC fields missing");
      return;
    }

    const cleanResult = cleanGscRows(
      preview.rows.map((row) => mapRowForPreview(row, fieldMapping))
    );

    if (cleanResult.rowsValid === 0) {
      setValidationError("Required GSC fields missing");
      return;
    }

    const payload: PreviewPayload = {
      fileName: preview.fileName,
      rowsLoaded: cleanResult.rowsLoaded,
      rowsValid: cleanResult.rowsValid,
      rowsRejected: cleanResult.rowsRejected,
      columnsDetected: REQUIRED_PREVIEW_FIELDS.length,
      rows: cleanResult.rows
    };

    window.sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(payload));
    window.location.href = "/preview";
  }

  return (
    <section className="border border-ink/15 bg-white/70 p-5 shadow-sm backdrop-blur sm:p-6">
      <div
        className={[
          "flex min-h-72 flex-col items-center justify-center border-2 border-dashed p-8 text-center transition",
          isDragging
            ? "border-moss bg-leaf/15"
            : "border-ink/20 bg-cream/70 hover:border-moss"
        ].join(" ")}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          accept=".csv,text/csv"
          className="sr-only"
          onChange={handleFileChange}
          type="file"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
          Local CSV upload
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-ink">
          Drop your GSC CSV here, or choose a file.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-ink/68">
          This milestone parses the CSV, detects required GSC fields, and lets you
          fix mappings manually. Scoring and reports are intentionally out of scope.
        </p>
        <button
          className="mt-6 border border-ink bg-ink px-5 py-3 text-sm font-black text-cream transition hover:bg-moss"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          Choose CSV file
        </button>
      </div>

      {error ? (
        <div className="mt-5 border border-clay/40 bg-clay/10 p-4 text-sm font-semibold text-clay">
          {error}
        </div>
      ) : null}

      {preview ? (
        <div className="mt-6 flex flex-col gap-6">
          <FieldMappingPanel
            fieldMapping={fieldMapping}
            fields={preview.fields}
            mappingValidation={mappingValidation}
            onConfirm={handleContinueToPreview}
            onMappingChange={(key, value) => {
              setValidationError(null);
              setFieldMapping((current) => ({ ...current, [key]: value }));
            }}
          />
          {validationError ? (
            <div className="border border-clay/40 bg-clay/10 p-4 text-sm font-semibold text-clay">
              {validationError}
            </div>
          ) : null}
          <div className="border border-ink/10 bg-cream p-4 text-sm font-semibold text-ink/70">
            Confirm all required fields to open the data preview page.
          </div>
        </div>
      ) : null}
    </section>
  );
}

function FieldMappingPanel({
  fieldMapping,
  fields,
  mappingValidation,
  onConfirm,
  onMappingChange
}: {
  fieldMapping: FieldMapping;
  fields: string[];
  mappingValidation: MappingValidation;
  onConfirm: () => void;
  onMappingChange: (key: RequiredField, value: string) => void;
}) {
  return (
    <div className="border border-ink/15 bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-black text-ink">Field mapping</h3>
          <p className="mt-2 text-sm leading-6 text-ink/68">
            We tried to detect the required GSC fields automatically. Fix any missing
            fields before moving forward.
          </p>
        </div>
        <div
          className={[
            "w-fit border px-3 py-2 text-sm font-black",
            mappingValidation.isValid
              ? "border-moss/30 bg-leaf/15 text-moss"
              : "border-clay/40 bg-clay/10 text-clay"
          ].join(" ")}
        >
          {mappingValidation.isValid ? "✓ Ready for next step" : "⚠ Missing or duplicate fields"}
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {REQUIRED_FIELDS.map((field) => {
          const mappedField = fieldMapping[field.key];
          const isDuplicate = mappedField ? mappingValidation.duplicateFields.has(mappedField) : false;

          return (
            <label
              className="grid gap-3 border border-ink/10 bg-cream/70 p-4 sm:grid-cols-[12rem_minmax(0,1fr)_8rem] sm:items-center"
              key={field.key}
            >
              <div>
                <p className="text-sm font-black text-ink">{field.label}</p>
                <p className="mt-1 text-xs text-ink/55">{field.key}</p>
              </div>

              <select
                className="w-full border border-ink/20 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-moss"
                onChange={(event) => onMappingChange(field.key, event.target.value)}
                value={mappedField}
              >
                <option value="">Select CSV column</option>
                {fields.map((csvField) => (
                  <option key={csvField} value={csvField}>
                    {csvField}
                  </option>
                ))}
              </select>

              <span
                className={[
                  "text-sm font-black",
                  mappedField && !isDuplicate ? "text-moss" : "text-clay"
                ].join(" ")}
              >
                {mappedField && !isDuplicate
                  ? "✓ Identified"
                  : isDuplicate
                    ? "⚠ Duplicate"
                    : "⚠ Missing"}
              </span>
            </label>
          );
        })}
      </div>

      <button
        className={[
          "mt-5 w-full border px-5 py-3 text-sm font-black transition sm:w-auto",
          mappingValidation.isValid
            ? "border-ink bg-ink text-cream hover:bg-moss"
            : "cursor-not-allowed border-ink/15 bg-ink/10 text-ink/40"
        ].join(" ")}
        disabled={!mappingValidation.isValid}
        onClick={onConfirm}
        type="button"
      >
        Continue to data preview
      </button>
    </div>
  );
}

function detectFieldMapping(fields: string[]): FieldMapping {
  return REQUIRED_FIELDS.reduce<FieldMapping>((mapping, requiredField) => {
    const matchedField = fields.find((field) =>
      requiredField.aliases.some((alias) => normalizeFieldName(alias) === normalizeFieldName(field))
    );

    return {
      ...mapping,
      [requiredField.key]: matchedField ?? ""
    };
  }, EMPTY_MAPPING);
}

function normalizeFieldName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getMappingValidation(fieldMapping: FieldMapping): MappingValidation {
  const selectedFields = REQUIRED_FIELDS.map((field) => fieldMapping[field.key]).filter(Boolean);
  const duplicateFields = selectedFields.reduce<Set<string>>((duplicates, field) => {
    const usageCount = selectedFields.filter((selectedField) => selectedField === field).length;

    if (usageCount > 1) {
      duplicates.add(field);
    }

    return duplicates;
  }, new Set<string>());
  const hasAllRequiredFields = REQUIRED_FIELDS.every((field) => fieldMapping[field.key]);

  return {
    isValid: hasAllRequiredFields && duplicateFields.size === 0,
    duplicateFields
  };
}

function mapRowForPreview(row: CsvRow, fieldMapping: FieldMapping): RawMappedRow {
  return REQUIRED_PREVIEW_FIELDS.reduce<RawMappedRow>((mappedRow, field) => {
    mappedRow[field] = row[fieldMapping[field]] ?? "";
    return mappedRow;
  }, {
    query: "",
    page: "",
    clicks: "",
    impressions: "",
    ctr: "",
    position: ""
  });
}
