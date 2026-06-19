export type OpportunityPriority = "High" | "Medium" | "Low";

export type OpportunityType =
  | "High Impression Low CTR"
  | "Position 8-20"
  | "Position 3-10 Low CTR"
  | "Multiple Keywords On Same Page"
  | "Keyword Cluster"
  | "Position 11-20 Opportunity";

export type GscAnalysisRow = {
  query: string;
  page: string;
  clicks: number | string;
  impressions: number | string;
  ctr: number | string;
  position: number | string;
};

export type OpportunityScoreBreakdown = {
  impressionScore: number;
  positionScore: number;
  ctrScore: number;
  bonusScore: number;
};

export type Opportunity = {
  id: string;
  opportunityScore: number;
  score: number;
  impressionScore: number;
  positionScore: number;
  ctrScore: number;
  bonusScore: number;
  scoreBreakdown: OpportunityScoreBreakdown;
  opportunityType: OpportunityType;
  type: OpportunityType;
  title: OpportunityType;
  priority: OpportunityPriority;
  actionPriority: OpportunityPriority;
  keyword: string;
  query: string;
  page: string;
  clicks?: number;
  impressions: number;
  ctr: number;
  position: number;
  keywordCount?: number;
  whyThisMatters: string;
  recommendedAction: string;
  recommendedActions: string[];
  expectedImpact: string;
  estimatedImpact: "Low" | "Medium" | "High";
  estimatedTrafficGain: "Low" | "Medium" | "High";
  estimatedEffort: string;
};

export type SeoOpportunity = Opportunity;
export type CleanOpportunity = Opportunity;

const POSITION_11_TO_20_ACTIONS = [
  "Expand content",
  "Improve internal linking",
  "Add FAQ section",
  "Strengthen topical authority",
  "Optimize title and headings",
];

export function detectOpportunities(rows: GscAnalysisRow[]): CleanOpportunity[] {
  const normalizedRows = rows.map(normalizeRow).filter((row) => row.query && row.page);
  const pageKeywordCounts = getPageKeywordCounts(normalizedRows);
  const opportunities: Opportunity[] = [];

  normalizedRows.forEach((row, index) => {
    const pageKeywordCount = pageKeywordCounts.get(row.page) ?? 1;

    if (row.impressions >= 1000 && row.ctr < 1) {
      opportunities.push(
        createOpportunity({
          row,
          index,
          pageKeywordCount,
          type: "High Impression Low CTR",
          priority: "High",
          whyThisMatters:
            "This keyword already receives meaningful search visibility, but the current snippet is not earning enough clicks.",
          recommendedActions: [
            "Rewrite title tag",
            "Improve meta description",
            "Add benefit-driven wording",
            "Match search intent",
          ],
          expectedImpact: "CTR improvement and incremental traffic from existing impressions.",
          estimatedEffort: "1-2 hours",
          estimatedTrafficGain: "High",
        }),
      );
    }

    if (row.position >= 8 && row.position <= 20) {
      opportunities.push(
        createOpportunity({
          row,
          index,
          pageKeywordCount,
          type: "Position 8-20",
          priority: "Medium",
          whyThisMatters:
            "This keyword is close to stronger visibility and can often improve with focused on-page enhancements.",
          recommendedActions: [
            "Expand content",
            "Add FAQ section",
            "Improve internal links",
            "Add supporting entities",
          ],
          expectedImpact: "Potential ranking lift toward page-one visibility.",
          estimatedEffort: "Half day",
          estimatedTrafficGain: "Medium",
        }),
      );
    }

    if (row.position >= 3 && row.position <= 10 && row.ctr < 1) {
      opportunities.push(
        createOpportunity({
          row,
          index,
          pageKeywordCount,
          type: "Position 3-10 Low CTR",
          priority: "High",
          whyThisMatters:
            "This keyword is already ranking well, but the search snippet is underperforming compared with its position.",
          recommendedActions: ["Optimize title", "Improve snippet CTR", "Add schema markup"],
          expectedImpact: "More clicks from rankings the site already owns.",
          estimatedEffort: "1-2 hours",
          estimatedTrafficGain: "High",
        }),
      );
    }

    if (row.position >= 11 && row.position <= 20) {
      opportunities.push(
        createOpportunity({
          row,
          index,
          pageKeywordCount,
          type: "Position 11-20 Opportunity",
          priority: row.impressions >= 1000 ? "High" : "Medium",
          whyThisMatters:
            "This keyword is already close to page one rankings. Improving content depth, internal linking, topical authority and on-page optimization may push it into the top 10 results where traffic increases significantly.",
          recommendedActions: POSITION_11_TO_20_ACTIONS,
          expectedImpact:
            "Potential first-page ranking improvement and substantial traffic growth.",
          estimatedEffort: "2-4 hours",
          estimatedTrafficGain: "High",
          positionScoreOverride: 20,
          ctrScoreOverride: 0,
          bonusScoreOverride: 5,
        }),
      );
    }
  });

  Array.from(pageKeywordCounts.entries()).forEach(([page, keywordCount], index) => {
    if (keywordCount <= 1) {
      return;
    }

    const pageRows = normalizedRows.filter((row) => row.page === page);
    const representativeRow = pageRows.sort((a, b) => b.impressions - a.impressions)[0];

    opportunities.push(
      createOpportunity({
        row: representativeRow,
        index,
        pageKeywordCount: keywordCount,
        type: "Multiple Keywords On Same Page",
        priority: "Medium",
        keyword: `${keywordCount} related keywords`,
        whyThisMatters:
          "Multiple related queries are already mapped to the same page, which indicates topical authority that can be strengthened.",
        recommendedActions: [
          "Create keyword cluster",
          "Merge overlapping content",
          "Strengthen topical authority",
        ],
        expectedImpact: "Higher topical relevance and broader long-tail visibility.",
        estimatedEffort: "1 day",
        estimatedTrafficGain: "Medium",
        keywordCount,
      }),
    );
  });

  return deduplicateAndRankOpportunities(opportunities);
}

export function detectSeoOpportunities(rows: GscAnalysisRow[]): SeoOpportunity[] {
  return detectOpportunities(rows);
}

export function deduplicateAndRankOpportunities(
  opportunities: Opportunity[],
): CleanOpportunity[] {
  const bestByQueryPage = new Map<string, Opportunity>();

  opportunities.forEach((opportunity) => {
    const key = createQueryPageKey(opportunity);
    const existingOpportunity = bestByQueryPage.get(key);

    if (
      !existingOpportunity ||
      compareOpportunities(opportunity, existingOpportunity) < 0
    ) {
      bestByQueryPage.set(key, opportunity);
    }
  });

  return Array.from(bestByQueryPage.values()).sort(compareOpportunities);
}

export type OpportunityPageGroup = {
  page: string;
  opportunities: CleanOpportunity[];
  topOpportunityScore: number;
  totalImpressions: number;
};

export function groupOpportunitiesByPage(
  opportunities: CleanOpportunity[],
): OpportunityPageGroup[] {
  const groups = new Map<string, CleanOpportunity[]>();

  opportunities.forEach((opportunity) => {
    const currentGroup = groups.get(opportunity.page) ?? [];
    currentGroup.push(opportunity);
    groups.set(opportunity.page, currentGroup);
  });

  return Array.from(groups.entries())
    .map(([page, pageOpportunities]) => {
      const sortedPageOpportunities = [...pageOpportunities].sort(compareOpportunities);

      return {
        page,
        opportunities: sortedPageOpportunities,
        topOpportunityScore: sortedPageOpportunities[0]?.opportunityScore ?? 0,
        totalImpressions: sortedPageOpportunities.reduce(
          (total, opportunity) => total + opportunity.impressions,
          0,
        ),
      };
    })
    .sort(
      (a, b) =>
        compareNumberDesc(a.topOpportunityScore, b.topOpportunityScore) ||
        compareNumberDesc(a.totalImpressions, b.totalImpressions) ||
        a.page.localeCompare(b.page),
    );
}

export function calculateOpportunityScore({
  impressions,
  position,
  ctr,
  pageKeywordCount = 1,
  positionScoreOverride,
  ctrScoreOverride,
  bonusScoreOverride,
}: {
  impressions: number;
  position: number;
  ctr: number;
  pageKeywordCount?: number;
  positionScoreOverride?: number;
  ctrScoreOverride?: number;
  bonusScoreOverride?: number;
}) {
  const scoreBreakdown = calculateScoreBreakdown({
    impressions,
    position,
    ctr,
    pageKeywordCount,
    positionScoreOverride,
    ctrScoreOverride,
    bonusScoreOverride,
  });

  return scoreBreakdown.impressionScore + scoreBreakdown.positionScore + scoreBreakdown.ctrScore + scoreBreakdown.bonusScore;
}

function createOpportunity({
  row,
  index,
  pageKeywordCount,
  type,
  priority,
  keyword = row.query,
  whyThisMatters,
  recommendedActions,
  expectedImpact,
  estimatedEffort,
  estimatedTrafficGain,
  keywordCount,
  positionScoreOverride,
  ctrScoreOverride,
  bonusScoreOverride,
}: {
  row: NormalizedRow;
  index: number;
  pageKeywordCount: number;
  type: OpportunityType;
  priority: OpportunityPriority;
  keyword?: string;
  whyThisMatters: string;
  recommendedActions: string[];
  expectedImpact: string;
  estimatedEffort: string;
  estimatedTrafficGain: "Low" | "Medium" | "High";
  keywordCount?: number;
  positionScoreOverride?: number;
  ctrScoreOverride?: number;
  bonusScoreOverride?: number;
}): Opportunity {
  const scoreBreakdown = calculateScoreBreakdown({
    impressions: row.impressions,
    position: row.position,
    ctr: row.ctr,
    pageKeywordCount,
    positionScoreOverride,
    ctrScoreOverride,
    bonusScoreOverride,
  });
  const opportunityScore =
    scoreBreakdown.impressionScore +
    scoreBreakdown.positionScore +
    scoreBreakdown.ctrScore +
    scoreBreakdown.bonusScore;

  return {
    id: `${slugify(type)}-${index}-${slugify(row.query || row.page)}`,
    opportunityScore,
    score: opportunityScore,
    impressionScore: scoreBreakdown.impressionScore,
    positionScore: scoreBreakdown.positionScore,
    ctrScore: scoreBreakdown.ctrScore,
    bonusScore: scoreBreakdown.bonusScore,
    scoreBreakdown,
    opportunityType: type,
    type,
    title: type,
    priority,
    actionPriority: priority,
    keyword,
    query: row.query,
    page: row.page,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
    keywordCount,
    whyThisMatters,
    recommendedAction: recommendedActions.join("; "),
    recommendedActions,
    expectedImpact,
    estimatedImpact: estimatedTrafficGain,
    estimatedTrafficGain,
    estimatedEffort,
  };
}

function calculateScoreBreakdown({
  impressions,
  position,
  ctr,
  pageKeywordCount,
  positionScoreOverride,
  ctrScoreOverride,
  bonusScoreOverride,
}: {
  impressions: number;
  position: number;
  ctr: number;
  pageKeywordCount: number;
  positionScoreOverride?: number;
  ctrScoreOverride?: number;
  bonusScoreOverride?: number;
}): OpportunityScoreBreakdown {
  return {
    impressionScore: calculateImpressionScore(impressions),
    positionScore: positionScoreOverride ?? calculatePositionScore(position),
    ctrScore: ctrScoreOverride ?? calculateCtrScore(ctr),
    bonusScore: bonusScoreOverride ?? calculatePageAuthorityBonus(pageKeywordCount),
  };
}

function calculateImpressionScore(impressions: number) {
  if (impressions >= 10000) return 40;
  if (impressions >= 5000) return 34;
  if (impressions >= 2500) return 28;
  if (impressions >= 1000) return 22;
  if (impressions >= 500) return 14;
  return 8;
}

function calculatePositionScore(position: number) {
  if (position >= 3 && position <= 10) return 30;
  if (position >= 11 && position <= 20) return 20;
  if (position > 20) return 10;
  return 15;
}

function calculateCtrScore(ctr: number) {
  if (ctr < 0.5) return 20;
  if (ctr < 1) return 16;
  if (ctr < 2) return 10;
  if (ctr < 4) return 5;
  return 0;
}

function calculatePageAuthorityBonus(pageKeywordCount: number) {
  if (pageKeywordCount >= 5) return 10;
  if (pageKeywordCount >= 2) return 5;
  return 0;
}

type NormalizedRow = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

function normalizeRow(row: GscAnalysisRow): NormalizedRow {
  return {
    query: String(row.query ?? "").trim(),
    page: String(row.page ?? "").trim(),
    clicks: parseNumber(row.clicks),
    impressions: parseNumber(row.impressions),
    ctr: parseCtr(row.ctr),
    position: parsePosition(row.position),
  };
}

function parseNumber(value: number | string) {
  if (typeof value === "number") return value;
  return Number(String(value ?? "").replace(/[, ]/g, ""));
}

function parseCtr(value: number | string) {
  if (typeof value === "number") return value <= 1 ? value * 100 : value;
  const normalizedValue = String(value ?? "").trim();
  const numericValue = Number(normalizedValue.replace("%", "").replace(",", "."));
  return normalizedValue.includes("%") ? numericValue : numericValue <= 1 ? numericValue * 100 : numericValue;
}

function parsePosition(value: number | string) {
  if (typeof value === "number") return value;
  return Number(String(value ?? "").replace(",", "."));
}

function getPageKeywordCounts(rows: NormalizedRow[]) {
  return rows.reduce((counts, row) => {
    counts.set(row.page, (counts.get(row.page) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

function priorityWeight(priority: OpportunityPriority) {
  if (priority === "High") return 3;
  if (priority === "Medium") return 2;
  return 1;
}

function createQueryPageKey(opportunity: Opportunity) {
  return `${normalizeDedupValue(opportunity.keyword || opportunity.query)}::${normalizeDedupValue(
    opportunity.page,
  )}`;
}

function compareOpportunities(a: Opportunity, b: Opportunity) {
  return (
    compareNumberDesc(a.opportunityScore, b.opportunityScore) ||
    compareNumberDesc(a.impressions, b.impressions) ||
    compareNumberAsc(a.position, b.position) ||
    compareNumberAsc(a.ctr, b.ctr) ||
    a.page.localeCompare(b.page) ||
    a.keyword.localeCompare(b.keyword) ||
    a.type.localeCompare(b.type) ||
    a.id.localeCompare(b.id)
  );
}

function compareNumberDesc(a: number, b: number) {
  return b - a;
}

function compareNumberAsc(a: number, b: number) {
  return a - b;
}

function normalizeDedupValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
