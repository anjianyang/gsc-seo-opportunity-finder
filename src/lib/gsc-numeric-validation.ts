export type GscNumericField = "clicks" | "impressions" | "ctr" | "position";

export type GscFieldMapping = Record<"query" | "page" | GscNumericField, string>;

export type NumericValidationResult = {
  invalidRowCount: number;
  invalidFields: GscNumericField[];
};

const NUMERIC_FIELDS: GscNumericField[] = ["clicks", "impressions", "ctr", "position"];

export function validateGscNumericFields(
  rows: Record<string, string>[],
  mapping: GscFieldMapping,
): NumericValidationResult {
  const invalidFields = new Set<GscNumericField>();
  let invalidRowCount = 0;

  rows.forEach((row) => {
    const rowHasInvalidValue = NUMERIC_FIELDS.some((field) => {
      const value = row[mapping[field]];
      const numericValue = parseGscNumber(value, field);
      const isInvalid =
        Number.isNaN(numericValue) ||
        !Number.isFinite(numericValue) ||
        ((field === "clicks" || field === "impressions") && numericValue < 0);

      if (isInvalid) {
        invalidFields.add(field);
      }

      return isInvalid;
    });

    if (rowHasInvalidValue) {
      invalidRowCount += 1;
    }
  });

  return {
    invalidRowCount,
    invalidFields: Array.from(invalidFields),
  };
}

function parseGscNumber(value: string | undefined, field: GscNumericField): number {
  if (typeof value !== "string") {
    return Number.NaN;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return Number.NaN;
  }

  if (field === "ctr") {
    return Number(trimmedValue.replace("%", "").replace(",", "."));
  }

  if (field === "position") {
    return Number(trimmedValue.replace(",", "."));
  }

  return Number(trimmedValue.replace(/[, ]/g, ""));
}
