"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { detectSeoOpportunities, type SeoOpportunity } from "../lib/opportunity-detection";
import { PREVIEW_STORAGE_KEY, type PreviewPayload } from "../lib/preview-storage";

export function OpportunitiesView() {
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

  const opportunities = useMemo(
    () => (payload ? detectSeoOpportunities(payload.rows) : []),
    [payload]
  );
  const reportSummary = useMemo(() => buildReportSummary(opportunities), [opportunities]);

  if (!hasLoaded) {
    return null;
  }

  if (!payload || payload.rows.length === 0) {
    return (
      <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
        <section className="mx-auto max-w-4xl border border-ink/15 bg-white/70 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
            SEO Opportunity Report
          </p>
          <h1 className="mt-4 text-4xl font-black text-ink">No data loaded.</h1>
          <p className="mt-4 text-base leading-7 text-ink/70">
            Upload a CSV, confirm field mapping, and review the data preview before
            opening opportunity analysis.
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
        <header className="border-b border-ink/15 pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
            SEO Consultant Report
          </p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-black leading-tight text-ink sm:text-5xl">
                SEO Opportunity Report from your Search Console CSV.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-ink/70">
                This browser-only report turns mapped CSV rows into a prioritized SEO
                action plan. It explains why each opportunity matters, what to do
                first, expected upside, and estimated effort.
              </p>
            </div>
            <div className="flex flex-col gap-3 print:hidden sm:flex-row lg:flex-col">
              <button
                className="border border-ink bg-ink px-5 py-3 text-sm font-black text-cream transition hover:bg-moss"
                onClick={() => window.print()}
                type="button"
              >
                Download PDF Report
              </button>
              <Link className="text-sm font-bold text-moss hover:text-ink" href="/preview">
                &lt;- Back to data preview
              </Link>
            </div>
          </div>
        </header>

        <ExecutiveSummary payload={payload} summary={reportSummary} />

        <ReportSection
          eyebrow="Top Opportunities"
          title="Start with these first."
          description="These are the highest-priority actions based on the current rule engine and CSV data."
        >
          {opportunities.length === 0 ? (
            <EmptyReportState />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {opportunities.slice(0, 4).map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}
        </ReportSection>

        <ReportSection
          eyebrow="All Opportunities"
          title="Full prioritized list."
          description="Sorted by priority first, then by opportunity score."
        >
          {opportunities.length === 0 ? (
            <EmptyReportState />
          ) : (
            <OpportunityTable opportunities={opportunities} />
          )}
        </ReportSection>

        <ReportSection
          eyebrow="14-Day SEO Action Plan"
          title="What to do over the next two weeks."
          description="This sequence turns the detected opportunities into a practical implementation plan."
        >
          <ActionPlan />
        </ReportSection>
      </div>
    </main>
  );
}

function ExecutiveSummary({
  payload,
  summary
}: {
  payload: PreviewPayload;
  summary: ReportSummary;
}) {
  return (
    <section className="border border-ink/15 bg-white/75 p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
            Executive Summary
          </p>
          <h2 className="mt-2 text-2xl font-black text-ink">The shortest path to action.</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-ink/64">
          The report favors actions that are specific, local to the current site, and
          realistic to complete without extra tools.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Rows Valid" value={String(payload.rowsValid ?? payload.rows.length)} />
        <SummaryCard label="Rows Rejected" value={String(payload.rowsRejected ?? 0)} />
        <SummaryCard label="Opportunities Found" value={String(summary.total)} />
        <SummaryCard label="High Priority Opportunities" value={String(summary.highPriority)} />
        <SummaryCard label="Medium Priority Opportunities" value={String(summary.mediumPriority)} />
        <SummaryCard label="Estimated Traffic Gain" value={summary.estimatedTrafficGain} />
        <SummaryCard label="Average Opportunity Score" value={String(summary.averageOpportunityScore)} />
        <SummaryCard label="Top Opportunity Score" value={String(summary.topOpportunityScore)} />
        <SummaryCard label="Highest Potential Page" value={summary.highestPotentialPage} />
        <SummaryCard label="Recommended First Action" value={summary.recommendedFirstAction} />
        <SummaryCard label="Biggest Opportunity" value={summary.biggestOpportunity} />
        <SummaryCard label="Fastest Win" value={summary.fastestWin} />
      </div>
    </section>
  );
}

function ReportSection({
  children,
  description,
  eyebrow,
  title
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="border border-ink/15 bg-white/75 p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black text-ink">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/64">{description}</p>
      </div>
      {children}
    </section>
  );
}

function OpportunityCard({ opportunity }: { opportunity: SeoOpportunity }) {
  return (
    <article className="border border-ink/12 bg-cream/75 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-moss">
            {opportunity.type}
          </p>
          <h3 className="mt-2 text-xl font-black leading-tight text-ink">
            {opportunity.keyword || opportunity.page}
          </h3>
          <p className="mt-2 max-w-xl truncate text-sm text-ink/60">{opportunity.page}</p>
        </div>
        <div className="flex gap-2">
          <Badge tone={opportunity.priority === "High" ? "high" : "medium"}>
            {opportunity.priority}
          </Badge>
          <Badge tone="score">{opportunity.score}</Badge>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <ScoreBreakdown opportunity={opportunity} />
        <DetailBlock title="Why This Matters" text={opportunity.whyThisMatters} />
        <ActionList actions={opportunity.recommendedActions} />
        <DetailBlock title="Expected Impact" text={opportunity.expectedImpact} />
        <DetailBlock title="Action Priority" text={opportunity.actionPriority} />
        <DetailBlock title="Estimated Traffic Gain" text={opportunity.estimatedTrafficGain} />
        <DetailBlock title="Estimated Effort" text={opportunity.estimatedEffort} />
      </div>

      <p className="mt-5 border-t border-ink/10 pt-4 text-sm font-semibold text-ink/70">
        {formatOpportunityDetails(opportunity)}
      </p>
    </article>
  );
}

function OpportunityTable({ opportunities }: { opportunities: SeoOpportunity[] }) {
  return (
    <div className="overflow-x-auto border border-ink/10 bg-white">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-ink text-cream">
          <tr>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Opportunity Score</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Impression Score</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Position Score</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">CTR Score</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Bonus Score</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Opportunity Type</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Priority</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Keyword</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Page</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Action Priority</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Traffic Gain</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Expected Impact</th>
            <th className="whitespace-nowrap px-3 py-3 font-bold">Effort</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity) => (
            <tr className="border-t border-ink/10" key={opportunity.id}>
              <td className="px-3 py-3 font-black text-ink">{opportunity.score}</td>
              <td className="px-3 py-3 text-ink/78">{opportunity.impressionScore}</td>
              <td className="px-3 py-3 text-ink/78">{opportunity.positionScore}</td>
              <td className="px-3 py-3 text-ink/78">{opportunity.ctrScore}</td>
              <td className="px-3 py-3 text-ink/78">{opportunity.bonusScore}</td>
              <td className="px-3 py-3 text-ink/78">{opportunity.type}</td>
              <td className="px-3 py-3">
                <Badge tone={opportunity.priority === "High" ? "high" : "medium"}>
                  {opportunity.priority}
                </Badge>
              </td>
              <td className="max-w-sm truncate px-3 py-3 text-ink/78">
                {opportunity.keyword || "-"}
              </td>
              <td className="max-w-md truncate px-3 py-3 text-ink/78">
                {opportunity.page || "-"}
              </td>
              <td className="px-3 py-3">
                <Badge tone={opportunity.actionPriority === "High" ? "high" : "medium"}>
                  {opportunity.actionPriority}
                </Badge>
              </td>
              <td className="px-3 py-3 text-ink/78">{opportunity.estimatedTrafficGain}</td>
              <td className="max-w-md px-3 py-3 text-ink/68">{opportunity.expectedImpact}</td>
              <td className="whitespace-nowrap px-3 py-3 text-ink/68">
                {opportunity.estimatedEffort}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionPlan() {
  const steps = [
    {
      days: "Day 1-3",
      title: "Optimize High Impression Low CTR",
      body: "Rewrite title tags, improve meta descriptions, add benefit-driven wording, and make the snippet match search intent for high-impression keywords."
    },
    {
      days: "Day 4-7",
      title: "Optimize Position 3-10 Low CTR",
      body: "Optimize titles, improve snippet CTR, and add schema markup where relevant for keywords already ranking in visible positions."
    },
    {
      days: "Day 8-10",
      title: "Optimize Position 8-20",
      body: "Expand content, add FAQ sections, improve internal links, and add supporting entities for keywords close to stronger page-one visibility."
    },
    {
      days: "Day 11-14",
      title: "Handle Keyword Clustering",
      body: "Create keyword clusters, merge overlapping content, and strengthen topical authority on pages that already rank for multiple related queries."
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {steps.map((step) => (
        <article className="border border-ink/12 bg-cream/75 p-5" key={step.days}>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-moss">{step.days}</p>
          <h3 className="mt-2 text-xl font-black text-ink">{step.title}</h3>
          <p className="mt-3 text-sm leading-6 text-ink/68">{step.body}</p>
        </article>
      ))}
    </div>
  );
}

function ScoreBreakdown({ opportunity }: { opportunity: SeoOpportunity }) {
  const items = [
    { label: "Impression Score", value: opportunity.impressionScore, max: 40 },
    { label: "Position Score", value: opportunity.positionScore, max: 30 },
    { label: "CTR Score", value: opportunity.ctrScore, max: 20 },
    { label: "Bonus Score", value: opportunity.bonusScore, max: 10 }
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div className="border border-ink/10 bg-white/70 p-3" key={item.label}>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-moss">
            {item.label}
          </p>
          <p className="mt-1 text-lg font-black text-ink">
            {item.value}/{item.max}
          </p>
        </div>
      ))}
    </div>
  );
}

function DetailBlock({ text, title }: { text: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-moss">{title}</p>
      <p className="mt-1 text-sm leading-6 text-ink/70">{text}</p>
    </div>
  );
}

function ActionList({ actions }: { actions: string[] }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-moss">
        Recommended Action
      </p>
      <ul className="mt-2 grid gap-2 text-sm font-semibold text-ink/72">
        {actions.map((action) => (
          <li className="border border-ink/10 bg-white/70 px-3 py-2" key={action}>
            {action}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "high" | "medium" | "score" }) {
  const className =
    tone === "high"
      ? "border-clay/30 bg-clay/10 text-clay"
      : tone === "medium"
        ? "border-moss/30 bg-leaf/15 text-moss"
        : "border-ink/20 bg-white text-ink";

  return (
    <span className={`inline-flex h-fit border px-2 py-1 text-xs font-black ${className}`}>
      {children}
    </span>
  );
}

function EmptyReportState() {
  return (
    <div className="border border-ink/10 bg-cream p-5 text-sm font-semibold text-ink/70">
      No opportunities matched the current MVP rules.
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-28 border border-ink/10 bg-cream/75 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-moss">{label}</p>
      <p className="mt-2 text-lg font-black leading-snug text-ink">{value}</p>
    </div>
  );
}

type ReportSummary = {
  total: number;
  highPriority: number;
  mediumPriority: number;
  estimatedTrafficGain: string;
  averageOpportunityScore: number;
  topOpportunityScore: number;
  highestPotentialPage: string;
  recommendedFirstAction: string;
  biggestOpportunity: string;
  fastestWin: string;
};

function buildReportSummary(opportunities: SeoOpportunity[]): ReportSummary {
  const highPriority = opportunities.filter((opportunity) => opportunity.priority === "High").length;
  const mediumPriority = opportunities.filter((opportunity) => opportunity.priority === "Medium").length;
  const highestPriorityOpportunity = opportunities[0];
  const fastestWin = getFastestWin(opportunities);

  return {
    total: opportunities.length,
    highPriority,
    mediumPriority,
    estimatedTrafficGain: estimateTrafficGain(opportunities),
    averageOpportunityScore: getAverageOpportunityScore(opportunities),
    topOpportunityScore: opportunities[0]?.score ?? 0,
    highestPotentialPage: getHighestPotentialPage(opportunities),
    recommendedFirstAction: highestPriorityOpportunity
      ? highestPriorityOpportunity.recommendedActions[0]
      : "Upload more GSC rows or widen the analysis window.",
    biggestOpportunity: highestPriorityOpportunity
      ? `${highestPriorityOpportunity.type}: ${highestPriorityOpportunity.keyword || highestPriorityOpportunity.page}`
      : "No opportunities found",
    fastestWin: fastestWin
      ? `${fastestWin.recommendedActions[0]}: ${fastestWin.keyword || fastestWin.page}`
      : "No fast win found"
  };
}

function getAverageOpportunityScore(opportunities: SeoOpportunity[]) {
  if (opportunities.length === 0) {
    return 0;
  }

  return Math.round(
    opportunities.reduce((total, opportunity) => total + opportunity.score, 0) /
      opportunities.length
  );
}

function getHighestPotentialPage(opportunities: SeoOpportunity[]) {
  if (opportunities.length === 0) {
    return "No opportunities found";
  }

  const pageScores = opportunities.reduce<Map<string, number>>((scores, opportunity) => {
    scores.set(opportunity.page, (scores.get(opportunity.page) ?? 0) + opportunity.score);
    return scores;
  }, new Map<string, number>());

  return Array.from(pageScores.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "No page found";
}

function getFastestWin(opportunities: SeoOpportunity[]) {
  return opportunities.find((opportunity) => opportunity.estimatedEffort === "1-2 hours");
}

function estimateTrafficGain(opportunities: SeoOpportunity[]) {
  const highCount = opportunities.filter((opportunity) => opportunity.priority === "High").length;
  const mediumCount = opportunities.filter((opportunity) => opportunity.priority === "Medium").length;
  const lowEstimate = highCount * 15 + mediumCount * 5;
  const highEstimate = highCount * 45 + mediumCount * 20;

  if (opportunities.length === 0) {
    return "0 clicks/month";
  }

  return `${lowEstimate}-${highEstimate} clicks/month`;
}

function formatOpportunityDetails(opportunity: SeoOpportunity) {
  if (opportunity.type === "High Impression Low CTR") {
    return `CTR ${formatCtr(opportunity.ctr)} · ${opportunity.impressions} impressions`;
  }

  if (opportunity.type === "Position 8-20") {
    return `Position ${formatNumber(opportunity.position)}`;
  }

  if (opportunity.type === "Position 3-10 Low CTR") {
    return `Position ${formatNumber(opportunity.position)} · CTR ${formatCtr(opportunity.ctr)}`;
  }

  return `${opportunity.keywordCount ?? 0} keywords on the same page`;
}

function formatCtr(value?: number) {
  if (typeof value !== "number") {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function formatNumber(value?: number) {
  if (typeof value !== "number") {
    return "-";
  }

  return value.toFixed(1);
}
