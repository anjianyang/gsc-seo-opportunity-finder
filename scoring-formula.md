# Opportunity Score Formula

## 文档目的

这份文档定义 MVP 中 `Opportunity Score` 的计算规则。

目标不是做一个神秘的黑盒分数，而是让用户在报告中能理解：

- 为什么这个机会被发现
- 为什么它排在前面
- 为什么两个关键词的分数不同
- 分数对应什么行动优先级

## 评分原则

1. 不使用黑盒评分。
2. 不使用 AI 判断分数。
3. 所有分数都由 GSC CSV 中的可见字段计算。
4. 每种机会类型有独立公式。
5. 分数范围统一为 `0-100`。
6. 报告中必须展示影响分数的关键原因。

## 输入字段

所有机会评分都基于标准 GSC 字段：

| Field | Meaning | Used For |
| --- | --- | --- |
| `query` | Search keyword | query-level opportunity and clustering |
| `page` | Landing page URL | page-level grouping and clustering |
| `clicks` | Organic clicks | existing traction and click proof |
| `impressions` | Search impressions | traffic upside |
| `ctr` | Click-through rate, normalized to `0-1` | click gap |
| `position` | Average ranking position | ranking distance and visibility |

## Shared Helper Scores

To keep formulas explainable, raw fields are converted into simple `0-1` helper scores.

## 1. Impression Score

Purpose: estimate traffic upside.

```text
impressionScore = min(1, log10(impressions + 1) / log10(maxImpressions + 1))
```

Where:

- `impressions` = impressions for the row or group
- `maxImpressions` = highest impressions in the analyzed CSV

Interpretation:

- Higher impressions means more potential traffic upside.
- Log scaling prevents one huge keyword from dominating every result.

## 2. CTR Gap Score

Purpose: estimate how under-clicked a query is for its ranking position.

```text
ctrGapScore = clamp((expectedCtr - actualCtr) / expectedCtr, 0, 1)
```

Where:

- `actualCtr` = row CTR normalized to `0-1`
- `expectedCtr` = expected CTR for the ranking band

Suggested expected CTR table for MVP:

| Position Range | Expected CTR |
| --- | ---: |
| 1-2 | 18% |
| 3-4 | 10% |
| 5-7 | 4% |
| 8-10 | 2% |
| 11-20 | 0.8% |
| 21+ | 0.3% |

Interpretation:

- If actual CTR is much lower than expected, the gap score is high.
- If actual CTR is close to or above expected, the gap score is low.

## 3. Position Visibility Score

Purpose: reward queries that are already visible enough to act on.

```text
positionVisibilityScore = clamp((21 - position) / 20, 0, 1)
```

Interpretation:

- Position 1 gets a high visibility score.
- Position 10 still gets a meaningful score.
- Position 20 is low but not zero.
- Position 21+ is usually not a fast CTR opportunity.

## 4. Rank Boost Score

Purpose: prioritize keywords close enough to page one to improve.

```text
rankBoostScore = clamp((21 - position) / 13, 0, 1)
```

Only applied to position `8-20`.

Interpretation:

- Position 8 scores higher than position 20.
- The closer the keyword is to page one, the more actionable it is.

## 5. Click Proof Score

Purpose: reward keywords that already have some evidence of demand.

```text
clickProofScore = min(1, log10(clicks + 1) / log10(maxClicks + 1))
```

Interpretation:

- A keyword with some clicks may be more reliable than a keyword with zero clicks.
- Log scaling keeps high-click keywords from overpowering the formula.

## 6. Cluster Size Score

Purpose: reward pages that rank for multiple related queries.

```text
clusterSizeScore = min(1, queryCount / targetClusterSize)
```

Suggested MVP default:

```text
targetClusterSize = 5
```

Interpretation:

- A page with 5 or more meaningful queries gets full cluster size credit.
- A page with only 2 queries gets partial credit.

## Global Score Interpretation

| Score | Meaning | Action |
| ---: | --- | --- |
| 90+ | Must handle immediately | Put in the first optimization batch |
| 70-89 | High priority | Schedule within the next 7-14 days |
| 50-69 | Medium priority | Consider after higher-impact actions |
| <50 | Low priority | Do not act on this in MVP report |

## Tie-Breaking Rules

When two opportunities have the same or similar score, sort by:

1. Higher estimated traffic gain
2. Higher commercial intent
3. Lower implementation effort
4. Higher impressions
5. Better current position

Commercial intent is not a hidden score in MVP. It should be represented by a simple label if used:

- `commercial`
- `mixed`
- `informational`

For the first version, commercial intent can be manually inferred only in sample reports. In product scoring, keep the formula based on GSC fields.

# Formula 1 - High Impression Low CTR

## Goal

Find keywords that already have search visibility but are not earning enough clicks.

This usually means the title, meta description, search result positioning, or page promise is not compelling enough.

## Input Fields

| Field | Role |
| --- | --- |
| `query` | Identifies the keyword |
| `page` | Identifies the page to optimize |
| `clicks` | Existing click performance |
| `impressions` | Traffic upside |
| `ctr` | Actual click-through rate |
| `position` | Determines expected CTR |

## Eligibility Rules

A row can enter this opportunity type when:

```text
impressions >= medianImpressions
position <= 10
actualCtr < expectedCtrByPosition(position)
```

## Weights

| Component | Weight | Why It Matters |
| --- | ---: | --- |
| `impressionScore` | 40% | More impressions mean more upside |
| `ctrGapScore` | 40% | Bigger CTR gap means easier click growth |
| `positionVisibilityScore` | 20% | Better rankings are easier to convert into clicks |

## Formula

```text
rawScore =
  impressionScore * 0.40 +
  ctrGapScore * 0.40 +
  positionVisibilityScore * 0.20

opportunityScore = round(rawScore * 100)
```

## Score Explanation

A high score means:

- The keyword already gets many impressions.
- The page already ranks well enough to be seen.
- CTR is far below what is expected for that ranking range.

## Report Explanation Template

```text
This opportunity ranks high because the page is already visible in search,
but the CTR is below the expected range for its average position.
Improving the title and meta description could convert existing impressions
into more clicks without needing a new page.
```

## Example Difference

Keyword A:

```text
query = pet grooming equipment
impressions = 25,700
ctr = 0.43%
position = 5.6
score = 94
```

Keyword B:

```text
query = adjustable grooming arm
impressions = 3,800
ctr = 0.92%
position = 7.7
score = 58
```

Why Keyword A scores higher:

- It has far more impressions.
- Its CTR gap is larger.
- It is tied to a broad commercial category page.
- Improving it can create more traffic from existing visibility.

Keyword B still has value, but it has lower upside because impressions are smaller and CTR is less severely underperforming.

# Formula 2 - Position 8-20

## Goal

Find keywords close enough to page one that content expansion, internal links, or page improvements may move them into stronger visibility.

## Input Fields

| Field | Role |
| --- | --- |
| `query` | Identifies the keyword |
| `page` | Identifies the page to improve |
| `clicks` | Existing traction |
| `impressions` | Traffic upside |
| `ctr` | Secondary signal |
| `position` | Core ranking distance signal |

## Eligibility Rules

A row can enter this opportunity type when:

```text
position >= 8
position <= 20
impressions >= minimumImpressionThreshold
```

Suggested MVP default:

```text
minimumImpressionThreshold = max(100, medianImpressions * 0.50)
```

## Weights

| Component | Weight | Why It Matters |
| --- | ---: | --- |
| `rankBoostScore` | 40% | Closer to page one is more actionable |
| `impressionScore` | 35% | More impressions mean more upside |
| `clickProofScore` | 15% | Existing clicks reduce uncertainty |
| `ctrGapScore` | 10% | Low CTR may indicate snippet improvement potential |

## Formula

```text
rawScore =
  rankBoostScore * 0.40 +
  impressionScore * 0.35 +
  clickProofScore * 0.15 +
  ctrGapScore * 0.10

opportunityScore = round(rawScore * 100)
```

## Score Explanation

A high score means:

- The keyword ranks between positions 8 and 20.
- It has enough impressions to justify work.
- It is close enough that focused improvements may move it higher.
- It has some click proof or CTR upside.

## Report Explanation Template

```text
This opportunity ranks high because the keyword is close to page one
and already receives meaningful impressions. The page likely needs stronger
topical coverage, better internal links, or more specific sections to match
the search intent.
```

## Example Difference

Keyword A:

```text
query = mobile dog grooming equipment
impressions = 6,400
clicks = 21
position = 16.7
score = 87
```

Keyword B:

```text
query = thinning shears for dog grooming
impressions = 3,200
clicks = 12
position = 17.4
score = 62
```

Why Keyword A scores higher:

- It has double the impressions.
- It maps to a broader equipment use case.
- Improving the parent equipment page can also support related categories.
- It has stronger commercial expansion potential.

Keyword B is still relevant, but it has narrower demand and lower total upside.

# Formula 3 - Position 3-10 Low CTR

## Goal

Find keywords that already rank on page one or near the top of page one but are not earning enough clicks.

This is the fastest CTR optimization category.

## Input Fields

| Field | Role |
| --- | --- |
| `query` | Identifies the keyword |
| `page` | Identifies the page to optimize |
| `clicks` | Existing click performance |
| `impressions` | Traffic upside |
| `ctr` | Actual click-through rate |
| `position` | Expected CTR band |

## Eligibility Rules

A row can enter this opportunity type when:

```text
position >= 3
position <= 10
impressions >= minimumImpressionThreshold
actualCtr < expectedCtrByPosition(position)
```

Position `1-2` is excluded in MVP because changing high-performing titles may carry more downside risk.

## Weights

| Component | Weight | Why It Matters |
| --- | ---: | --- |
| `ctrGapScore` | 45% | Bigger click gap means more immediate upside |
| `impressionScore` | 35% | More impressions mean more possible clicks |
| `positionVisibilityScore` | 20% | Better ranking means the snippet is already visible |

## Formula

```text
rawScore =
  ctrGapScore * 0.45 +
  impressionScore * 0.35 +
  positionVisibilityScore * 0.20

opportunityScore = round(rawScore * 100)
```

## Score Explanation

A high score means:

- The keyword already ranks in a visible range.
- The page has enough impressions to matter.
- CTR is meaningfully below the expected CTR for that position.

## Report Explanation Template

```text
This opportunity ranks high because the page already appears in a strong
ranking position, but users are not clicking at the expected rate.
The fastest action is to improve the search snippet and page promise.
```

## Example Difference

Keyword A:

```text
query = high velocity dog dryer
impressions = 14,200
ctr = 0.49%
position = 5.7
score = 91
```

Keyword B:

```text
query = grooming arm for dog grooming table
impressions = 5,200
ctr = 1.10%
position = 6.2
score = 54
```

Why Keyword A scores higher:

- It has much higher impressions.
- Its CTR is far below the expected CTR for position 5-7.
- The query is a high-intent product category.

Keyword B ranks well, but its CTR is healthier and impressions are lower, so the incremental upside is smaller.

# Formula 4 - Keyword Cluster

## Goal

Find pages that already rank for multiple related keywords and can be improved as stronger topical hubs.

This is a page-level opportunity, not a single-keyword opportunity.

## Input Fields

| Field | Role |
| --- | --- |
| `page` | Grouping key |
| `query` | Counts and lists related keywords |
| `clicks` | Total page traction |
| `impressions` | Total page upside |
| `ctr` | Weighted average CTR |
| `position` | Weighted average position |

## Eligibility Rules

A page can enter this opportunity type when:

```text
queryCount >= 3
totalImpressions >= minimumClusterImpressions
averagePosition <= 20
```

Suggested MVP default:

```text
minimumClusterImpressions = max(500, medianPageImpressions * 0.50)
```

## Aggregation Rules

For each `page`:

```text
totalClicks = sum(clicks)
totalImpressions = sum(impressions)
weightedCtr = totalClicks / totalImpressions
weightedPosition = sum(position * impressions) / totalImpressions
queryCount = count(unique query)
```

## Weights

| Component | Weight | Why It Matters |
| --- | ---: | --- |
| `impressionScore` | 35% | Page-level traffic upside |
| `clusterSizeScore` | 25% | More related queries means stronger hub potential |
| `positionVisibilityScore` | 25% | The page is already visible for the cluster |
| `ctrGapScore` | 15% | Weak CTR suggests snippet or page intent mismatch |

## Formula

```text
rawScore =
  impressionScore * 0.35 +
  clusterSizeScore * 0.25 +
  positionVisibilityScore * 0.25 +
  ctrGapScore * 0.15

opportunityScore = round(rawScore * 100)
```

## Score Explanation

A high score means:

- One page is already ranking for several related queries.
- The page has meaningful combined impressions.
- The page could become a stronger hub with better sections, FAQs, comparisons, and internal links.

## Report Explanation Template

```text
This opportunity ranks high because one page already appears for multiple
related searches. Improving the page can lift several keywords at once,
instead of optimizing each query separately.
```

## Example Difference

Cluster A:

```text
page = /collections/dog-grooming-tables
queryCount = 5
totalImpressions = 45,500
weightedCtr = 0.66%
weightedPosition = 9.6
score = 89
```

Cluster B:

```text
page = /collections/grooming-scissors
queryCount = 3
totalImpressions = 14,700
weightedCtr = 0.44%
weightedPosition = 13.8
score = 61
```

Why Cluster A scores higher:

- It has more than 3x the impressions.
- It has more query variants.
- Its average position is stronger.
- It covers a larger commercial product category.

Cluster B is valid, but it should wait until higher-upside category pages are handled.

# Explaining Why One Opportunity Ranks First

The report should never show only:

```text
Opportunity Score: 94
```

It should show the reason behind the score:

```text
This opportunity ranks first because it combines high impressions,
strong current position, and a large CTR gap. The page already appears
for a commercial keyword, but users are not clicking at the expected rate.
That makes title and meta description optimization a fast, low-effort win.
```

## Recommended Report Fields

For every opportunity card, show:

| Field | Example |
| --- | --- |
| Opportunity Score | `94 / 100` |
| Main reason | `High impressions + strong ranking + low CTR` |
| Primary driver | `CTR gap` |
| Expected upside | `+197 clicks/month` |
| Suggested action | `Rewrite title and meta description` |
| Priority label | `Must handle immediately` |

## Human-Readable Score Drivers

Use plain explanations:

| Driver | User-Friendly Explanation |
| --- | --- |
| High impression score | Many people already see this result |
| High CTR gap score | The page gets fewer clicks than expected |
| High rank boost score | The keyword is close to stronger visibility |
| High cluster score | One page can improve several keywords at once |
| High click proof score | The keyword already brings some traffic |

# MVP Implementation Notes

## Required Functions

Suggested files:

- `src/lib/scoring/score-high-impression-low-ctr.ts`
- `src/lib/scoring/score-ranking-8-20.ts`
- `src/lib/scoring/score-ranking-3-10-low-ctr.ts`
- `src/lib/scoring/score-same-page-keyword-clusters.ts`
- `src/lib/scoring/scoring-utils.ts`

## Utility Functions

Suggested helper functions:

```ts
function clamp(value: number, min: number, max: number): number
function getExpectedCtr(position: number): number
function getImpressionScore(impressions: number, maxImpressions: number): number
function getCtrGapScore(actualCtr: number, expectedCtr: number): number
function getPositionVisibilityScore(position: number): number
function getRankBoostScore(position: number): number
function getClickProofScore(clicks: number, maxClicks: number): number
function getClusterSizeScore(queryCount: number, targetClusterSize: number): number
```

## Output Requirements

Each scoring function should return not only a number, but also the explanation drivers.

Recommended structure:

```ts
type ScoreBreakdown = {
  score: number
  priority: "critical" | "high" | "medium" | "low"
  primaryDriver: string
  factors: Array<{
    label: string
    value: number
    weight: number
    explanation: string
  }>
}
```

This makes the report explainable and helps the user understand why the top opportunity deserves attention first.

# Summary

Opportunity Score is a transparent priority score, not a black box.

The score answers:

```text
How much upside exists, how close is the page to capturing it,
and how clear is the next action?
```

For MVP, the best score is not necessarily the keyword with the most impressions. The best score is the opportunity with the strongest combination of:

- meaningful impressions
- visible ranking
- clear CTR or ranking gap
- realistic next action
- enough upside to justify work today
