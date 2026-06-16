import type { PreviewRow } from "./preview-storage";

export type OpportunityPriority = "High" | "Medium" | "Low";
export type TrafficGainLevel = "High" | "Medium" | "Low";

export type OpportunityType =
  | "High Impression Low CTR"
  | "Position 8-20"
  | "Position 3-10 Low CTR"
  | "Multiple Keywords On Same Page";

export type SeoOpportunity = {
  id: string;
  score: number;
  impressionScore: number;
  positionScore: number;
  ctrScore: number;
  bonusScore: number;
  type: OpportunityType;
  priority: OpportunityPriority;
  keyword: string;
  page: string;
  impressions?: number;
  ctr?: number;
  position?: number;
  keywordCount?: number;
  whyThisMatters: string;
  recommendedAction: string;
  recommendedActions: string[];
  actionPriority: OpportunityPriority;
  expectedImpact: string;
  estimatedTrafficGain: TrafficGainLevel;
  estimatedEffort: string;
};

export function detectSeoOpportunities(rows: PreviewRow[]): SeoOpportunity[] {
  const scoringContext = buildScoringContext(rows);
  const highImpressionLowCtr = detectHighImpressionLowCtr(rows, scoringContext);
  const position8To20 = detectPosition8To20(rows, scoringContext);
  const position3To10LowCtr = detectPosition3To10LowCtr(rows, scoringContext);
  const keywordClusters = detectKeywordClusters(rows, scoringContext);

  return [
    ...highImpressionLowCtr,
    ...position3To10LowCtr,
    ...position8To20,
    ...keywordClusters
  ].sort(sortByPriorityThenScore);
}

function detectHighImpressionLowCtr(
  rows: PreviewRow[],
  scoringContext: ScoringContext
): SeoOpportunity[] {
  return rows
    .map((row) => ({
      row,
      impressions: parseNumber(row.impressions),
      ctr: parseNumber(row.ctr),
      position: parseNumber(row.position)
    }))
    .filter(({ impressions, ctr }) => impressions >= 1000 && ctr < 1)
    .map<SeoOpportunity>(({ row, impressions, ctr, position }, index) =>
      withScoreBreakdown({
        base: {
          id: `high-impression-low-ctr-${index}-${row.query}`,
          type: "High Impression Low CTR",
          keyword: row.query,
          page: row.page,
          impressions,
          ctr: ctr / 100,
          position,
          whyThisMatters:
            "This keyword already receives meaningful search visibility, but the CTR is below 1%. The page is being seen, yet it is not earning enough clicks from that demand.",
          recommendedAction:
            "Rewrite the SEO title and meta description to make the result more specific, benefit-led, and aligned with search intent.",
          recommendedActions: [
            "Rewrite title tag",
            "Improve meta description",
            "Add benefit-driven wording",
            "Match search intent"
          ],
          actionPriority: "High",
          expectedImpact: "CTR lift of 20%-50% on the affected query if the snippet better matches buyer intent.",
          estimatedTrafficGain: "High",
          estimatedEffort: "1-2 hours"
        },
        ctr,
        impressions,
        page: row.page,
        position,
        scoringContext
      })
    );
}

function detectPosition8To20(rows: PreviewRow[], scoringContext: ScoringContext): SeoOpportunity[] {
  return rows
    .map((row) => ({
      row,
      impressions: parseNumber(row.impressions),
      ctr: parseNumber(row.ctr),
      position: parseNumber(row.position)
    }))
    .filter(({ position }) => position >= 8 && position <= 20)
    .map<SeoOpportunity>(({ row, impressions, ctr, position }, index) =>
      withScoreBreakdown({
        base: {
          id: `position-8-20-${index}-${row.query}`,
          type: "Position 8-20",
          keyword: row.query,
          page: row.page,
          impressions,
          ctr: ctr / 100,
          position,
          whyThisMatters:
            "This keyword is ranking between positions 8 and 20, which means Google already sees the page as relevant but not strong enough yet.",
          recommendedAction:
            "Expand the page section around this query, add internal links from related pages, and make the search intent more explicit.",
          recommendedActions: [
            "Expand content",
            "Add FAQ section",
            "Improve internal links",
            "Add supporting entities"
          ],
          actionPriority: "Medium",
          expectedImpact: "Potential ranking lift into stronger page-one visibility after content and internal link improvements.",
          estimatedTrafficGain: "Medium",
          estimatedEffort: "Half day"
        },
        ctr,
        impressions,
        page: row.page,
        position,
        scoringContext
      })
    );
}

function detectPosition3To10LowCtr(
  rows: PreviewRow[],
  scoringContext: ScoringContext
): SeoOpportunity[] {
  return rows
    .map((row) => ({
      row,
      impressions: parseNumber(row.impressions),
      position: parseNumber(row.position),
      ctr: parseNumber(row.ctr)
    }))
    .filter(({ position, ctr }) => position >= 3 && position <= 10 && ctr < 1)
    .map<SeoOpportunity>(({ row, impressions, position, ctr }, index) =>
      withScoreBreakdown({
        base: {
          id: `position-3-10-low-ctr-${index}-${row.query}`,
          type: "Position 3-10 Low CTR",
          keyword: row.query,
          page: row.page,
          impressions,
          position,
          ctr: ctr / 100,
          whyThisMatters:
            "This keyword already ranks in a visible position, but CTR is below 1%. That usually points to a weak title, meta description, or search result promise.",
          recommendedAction:
            "Update the title and meta description, then add stronger above-the-fold copy that mirrors what the searcher wants.",
          recommendedActions: [
            "Optimize title",
            "Improve snippet CTR",
            "Add schema markup"
          ],
          actionPriority: "High",
          expectedImpact: "CTR lift of 20%-50% without needing to create a new page.",
          estimatedTrafficGain: "High",
          estimatedEffort: "1-2 hours"
        },
        ctr,
        impressions,
        page: row.page,
        position,
        scoringContext
      })
    );
}

function detectKeywordClusters(rows: PreviewRow[], scoringContext: ScoringContext): SeoOpportunity[] {
  const pageToQueries = rows.reduce<Map<string, Set<string>>>((groups, row) => {
    if (!row.page || !row.query) {
      return groups;
    }

    const queries = groups.get(row.page) ?? new Set<string>();
    queries.add(row.query);
    groups.set(row.page, queries);
    return groups;
  }, new Map<string, Set<string>>());

  return Array.from(pageToQueries.entries())
    .filter(([, queries]) => queries.size > 1)
    .map<SeoOpportunity>(([page, queries], index) => {
      const pageRows = rows.filter((row) => row.page === page);
      const impressions = pageRows.reduce((total, row) => total + parseNumber(row.impressions), 0);
      const weightedPosition = getWeightedPosition(pageRows);
      const averageCtr = getAverageCtr(pageRows);

      return withScoreBreakdown({
        base: {
          id: `keyword-cluster-${index}-${page}`,
          type: "Multiple Keywords On Same Page",
          keyword: Array.from(queries).slice(0, 3).join(", "),
          page,
          impressions,
          ctr: averageCtr / 100,
          position: weightedPosition,
          keywordCount: queries.size,
          whyThisMatters:
            "Multiple queries are landing on the same page, which means the page can become a stronger topic hub instead of treating each keyword separately.",
          recommendedAction:
            "Add sections, FAQs, comparison copy, and internal links that cover the major keyword variations on the page.",
          recommendedActions: [
            "Create keyword cluster",
            "Merge overlapping content",
            "Strengthen topical authority"
          ],
          actionPriority: "Medium",
          expectedImpact: "Better coverage across the whole keyword group and clearer page relevance for search engines and users.",
          estimatedTrafficGain: "Medium",
          estimatedEffort: "1 day"
        },
        ctr: averageCtr,
        impressions,
        page,
        position: weightedPosition,
        scoringContext
      });
    });
}

type ScoringContext = {
  maxImpressions: number;
  pageKeywordCounts: Map<string, number>;
};

type ScoreInput = {
  base: Omit<
    SeoOpportunity,
    "score" | "priority" | "impressionScore" | "positionScore" | "ctrScore" | "bonusScore"
  >;
  ctr: number;
  impressions: number;
  page: string;
  position: number;
  scoringContext: ScoringContext;
};

function withScoreBreakdown({
  base,
  ctr,
  impressions,
  page,
  position,
  scoringContext
}: ScoreInput): SeoOpportunity {
  const impressionScore = getImpressionScore(impressions, scoringContext.maxImpressions);
  const positionScore = getPositionScore(position);
  const ctrScore = getCtrOpportunityScore(ctr);
  const bonusScore = getPageAuthorityBonus(scoringContext.pageKeywordCounts.get(page) ?? 0);
  const score = impressionScore + positionScore + ctrScore + bonusScore;

  return {
    ...base,
    bonusScore,
    ctrScore,
    impressionScore,
    positionScore,
    priority: getPriority(score),
    score
  };
}

function buildScoringContext(rows: PreviewRow[]): ScoringContext {
  const maxImpressions = Math.max(...rows.map((row) => parseNumber(row.impressions)), 1);
  const pageKeywordCounts = rows.reduce<Map<string, Set<string>>>((groups, row) => {
    const queries = groups.get(row.page) ?? new Set<string>();
    queries.add(row.query);
    groups.set(row.page, queries);
    return groups;
  }, new Map<string, Set<string>>());

  return {
    maxImpressions,
    pageKeywordCounts: new Map(
      Array.from(pageKeywordCounts.entries()).map(([page, queries]) => [page, queries.size])
    )
  };
}

function getImpressionScore(impressions: number, maxImpressions: number) {
  if (impressions <= 0) {
    return 0;
  }

  return Math.round((Math.log10(impressions + 1) / Math.log10(maxImpressions + 1)) * 40);
}

function getPositionScore(position: number) {
  if (position >= 3 && position <= 10) {
    return 30;
  }

  if (position >= 11 && position <= 20) {
    return 20;
  }

  if (position > 20) {
    return 10;
  }

  return 15;
}

function getCtrOpportunityScore(ctr: number) {
  if (ctr <= 0) {
    return 20;
  }

  if (ctr < 0.5) {
    return 18;
  }

  if (ctr < 1) {
    return 15;
  }

  if (ctr < 2) {
    return 8;
  }

  return 0;
}

function getPageAuthorityBonus(keywordCount: number) {
  if (keywordCount >= 5) {
    return 10;
  }

  if (keywordCount >= 3) {
    return 7;
  }

  if (keywordCount >= 2) {
    return 4;
  }

  return 0;
}

function getPriority(score: number): OpportunityPriority {
  if (score >= 80) {
    return "High";
  }

  if (score >= 55) {
    return "Medium";
  }

  return "Low";
}

function getWeightedPosition(rows: PreviewRow[]) {
  const totalImpressions = rows.reduce((total, row) => total + parseNumber(row.impressions), 0);

  if (totalImpressions <= 0) {
    return 0;
  }

  return rows.reduce((total, row) => {
    return total + parseNumber(row.position) * parseNumber(row.impressions);
  }, 0) / totalImpressions;
}

function getAverageCtr(rows: PreviewRow[]) {
  if (rows.length === 0) {
    return 0;
  }

  return rows.reduce((total, row) => total + parseNumber(row.ctr), 0) / rows.length;
}

function sortByPriorityThenScore(a: SeoOpportunity, b: SeoOpportunity) {
  const priorityRank: Record<OpportunityPriority, number> = {
    High: 3,
    Medium: 2,
    Low: 1
  };

  return priorityRank[b.priority] - priorityRank[a.priority] || b.score - a.score;
}

function parseNumber(value: string): number {
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}
