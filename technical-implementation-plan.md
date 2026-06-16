# Technical Implementation Plan

## 文档目的

这份文档基于 `09-mvp-build-plan.md`，把 MVP 拆成可开发、可验收、可控制范围的技术实施方案。

核心原则：

- 第一版优先验证“上传 GSC CSV 后能不能快速得到有用机会”
- 所有 CSV 数据默认只在用户浏览器本地处理
- 第一版不引入后端复杂度
- 每一步开发都要能独立验收

## 技术栈

### 推荐栈

- Framework: `Next.js`
- Language: `TypeScript`
- UI: `React`
- Styling: `Tailwind CSS`
- CSV parser: `Papa Parse`
- Validation: `Zod`
- State: React local state first
- Deployment: `Vercel`

### 选择理由

- `Next.js` 同时适合工具页、示例报告页、SEO 落地页
- `TypeScript` 能降低 CSV 字段、评分函数和报告结构的出错概率
- `Papa Parse` 能稳定处理常见 CSV 格式、表头和分隔符
- `Zod` 用来做字段映射和数据清洗后的结构校验
- 第一版无数据库、无登录、无服务端数据处理，部署成本低

## MVP 技术边界

### 第一版必须保持本地化

- CSV 文件在浏览器中读取
- CSV 内容不上传服务器
- 分析逻辑在浏览器中运行
- 报告结果在前端内存中生成

### 第一版不接入

- Google Search Console API
- Google OAuth
- 用户登录
- 数据库
- AI API
- 后端队列
- 文件存储
- 团队协作

## 页面结构

## 1. 上传页

路径建议：

- `src/app/page.tsx`

页面目标：

- 让用户上传 GSC Performance CSV
- 清楚说明“本地浏览器处理，不上传服务器”
- 给没有 CSV 的用户提供示例入口

核心组件：

- `src/components/upload/csv-upload-dropzone.tsx`
- `src/components/upload/upload-privacy-note.tsx`
- `src/components/upload/sample-report-link.tsx`

页面状态：

- 初始状态：等待上传
- 拖拽状态：文件悬停
- 读取状态：浏览器读取文件文本
- 解析成功：进入字段映射页
- 解析失败：展示错误和修复建议

独立验收标准：

- 可以选择或拖拽 `.csv` 文件
- 非 CSV 文件有明确错误提示
- 文件读取成功后能识别表头
- 页面明确显示本地处理承诺

## 2. 字段映射页

路径建议：

- `src/app/map-fields/page.tsx`

页面目标：

- 自动识别 GSC CSV 字段
- 允许用户修正常见字段命名差异
- 在进入报告前确认字段完整

核心组件：

- `src/components/mapping/field-mapping-form.tsx`
- `src/components/mapping/field-mapping-row.tsx`
- `src/components/mapping/mapping-validation-alert.tsx`

必需字段：

- `query`
- `page`
- `clicks`
- `impressions`
- `ctr`
- `position`

页面状态：

- 自动映射成功：允许继续分析
- 部分字段缺失：要求用户手动选择
- 字段重复选择：提示冲突
- 必需字段为空：禁止继续

独立验收标准：

- 标准 GSC CSV 可以自动映射全部字段
- 字段名大小写不同也能识别
- 缺字段时能指出缺少哪个字段
- 用户修正映射后能进入机会报告页

## 3. 机会报告页

路径建议：

- `src/app/report/page.tsx`

页面目标：

- 展示本次 CSV 的机会分析结果
- 按机会类型解释为什么值得优化
- 免费版默认展示 Top 20 机会

核心组件：

- `src/components/report/report-summary.tsx`
- `src/components/report/top-opportunities-table.tsx`
- `src/components/report/ctr-opportunities-section.tsx`
- `src/components/report/ranking-opportunities-section.tsx`
- `src/components/report/low-ctr-top-ranking-section.tsx`
- `src/components/report/keyword-clusters-section.tsx`
- `src/components/report/report-empty-state.tsx`

报告区块：

- Summary
- Top Opportunities
- High Impressions, Low CTR
- Ranking 8-20
- Ranking 3-10, Low CTR
- Same Page Keyword Clusters

独立验收标准：

- 上传并映射字段后能生成报告
- 报告展示有效行数、query 数、page 数、机会数
- Top Opportunities 按分数降序展示
- 每条机会包含 page、query、clicks、impressions、ctr、position、reason、action
- 免费版最多展示前 20 条机会

## CSV 字段兼容

## 必需字段

| 标准字段 | 含义 | 示例值 |
| --- | --- | --- |
| `query` | 搜索词 | `best seo tools` |
| `page` | 页面 URL | `https://example.com/seo-tools` |
| `clicks` | 点击数 | `120` |
| `impressions` | 展示数 | `5000` |
| `ctr` | 点击率 | `2.4%` or `0.024` |
| `position` | 平均排名 | `8.7` |

## 字段别名兼容

字段识别应忽略大小写、前后空格和常见分隔符差异。

建议兼容：

| 标准字段 | 可识别别名 |
| --- | --- |
| `query` | `query`, `queries`, `search query`, `top queries` |
| `page` | `page`, `pages`, `url`, `landing page` |
| `clicks` | `clicks`, `click` |
| `impressions` | `impressions`, `impression` |
| `ctr` | `ctr`, `average ctr`, `click through rate`, `click-through rate` |
| `position` | `position`, `average position`, `avg position` |

## 数据清洗规则

- `query` 必须是非空字符串
- `page` 必须是非空字符串
- `clicks` 转成非负整数
- `impressions` 转成非负整数
- `ctr` 统一转成 `0-1` 之间的小数
- `position` 转成正数
- `impressions <= 0` 的行默认过滤
- `position <= 0` 的行默认过滤
- 无法解析关键数值的行默认过滤

## 类型定义

建议文件：

- `src/types/gsc.ts`
- `src/types/opportunity.ts`
- `src/types/report.ts`

建议核心类型：

```ts
export type GscFieldKey =
  | "query"
  | "page"
  | "clicks"
  | "impressions"
  | "ctr"
  | "position"

export type RawGscRow = Record<string, string | number | null | undefined>

export type FieldMapping = Record<GscFieldKey, string>

export type GscRow = {
  query: string
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export type OpportunityType =
  | "high-impression-low-ctr"
  | "ranking-8-20"
  | "ranking-3-10-low-ctr"
  | "same-page-keyword-cluster"

export type OpportunityItem = {
  id: string
  type: OpportunityType
  score: number
  page: string
  query?: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  reason: string
  action: string
}
```

## 模块与文件路径

## App Routes

| 模块 | 文件路径 | 职责 |
| --- | --- | --- |
| 上传页 | `src/app/page.tsx` | CSV 上传入口 |
| 字段映射页 | `src/app/map-fields/page.tsx` | 字段确认和修正 |
| 机会报告页 | `src/app/report/page.tsx` | 展示分析结果 |
| 全局布局 | `src/app/layout.tsx` | 页面壳和 metadata |
| 全局样式 | `src/app/globals.css` | Tailwind 和基础样式 |

## CSV 模块

| 模块 | 文件路径 | 职责 |
| --- | --- | --- |
| CSV 解析 | `src/lib/csv/parse-gsc-csv.ts` | 调用 Papa Parse 输出原始行和表头 |
| 字段检测 | `src/lib/csv/detect-gsc-columns.ts` | 根据别名自动匹配字段 |
| 字段校验 | `src/lib/csv/validate-field-mapping.ts` | 检查必需字段和重复映射 |
| 行标准化 | `src/lib/csv/normalize-gsc-row.ts` | 把原始行转成 `GscRow` |
| 数据清洗 | `src/lib/csv/clean-gsc-rows.ts` | 过滤无效行，输出可分析数据 |

## Scoring 模块

| 模块 | 文件路径 | 职责 |
| --- | --- | --- |
| 高曝光低点击 | `src/lib/scoring/score-high-impression-low-ctr.ts` | 识别曝光高、排名较好但 CTR 低的机会 |
| 排名 8-20 | `src/lib/scoring/score-ranking-8-20.ts` | 识别接近首页的关键词 |
| 排名 3-10 低 CTR | `src/lib/scoring/score-ranking-3-10-low-ctr.ts` | 识别排名靠前但点击率偏低的关键词 |
| 同页面关键词聚类 | `src/lib/scoring/score-same-page-keyword-clusters.ts` | 找出同一页面覆盖多个 query 的机会 |
| 通用工具 | `src/lib/scoring/scoring-utils.ts` | median、percentile、normalizeScore 等工具 |

## Report 模块

| 模块 | 文件路径 | 职责 |
| --- | --- | --- |
| 报告构建 | `src/lib/reporting/build-opportunity-report.ts` | 汇总所有评分结果 |
| 结果排序 | `src/lib/reporting/sort-opportunities.ts` | 按 score 和优先级排序 |
| 免费版裁剪 | `src/lib/reporting/limit-free-report.ts` | 限制 Top 20 |
| 摘要统计 | `src/lib/reporting/build-report-summary.ts` | 统计 rows、queries、pages、opportunities |

## UI 组件

| 模块 | 文件路径 | 职责 |
| --- | --- | --- |
| 上传组件 | `src/components/upload/csv-upload-dropzone.tsx` | 文件选择和拖拽上传 |
| 隐私说明 | `src/components/upload/upload-privacy-note.tsx` | 本地处理说明 |
| 字段映射表单 | `src/components/mapping/field-mapping-form.tsx` | 字段映射交互 |
| 报告摘要 | `src/components/report/report-summary.tsx` | 顶部 summary cards |
| 机会表格 | `src/components/report/top-opportunities-table.tsx` | Top opportunities |
| 空状态 | `src/components/report/report-empty-state.tsx` | 无结果提示 |

## 评分逻辑函数

## 1. 高曝光低点击

文件：

- `src/lib/scoring/score-high-impression-low-ctr.ts`

函数建议：

```ts
export function scoreHighImpressionLowCtr(rows: GscRow[]): OpportunityItem[]
```

筛选条件：

- `impressions >= median(impressions)`
- `position <= 10`
- `ctr < expectedCtrByPosition(position)`

评分思路：

```text
score = log(impressions + 1) * positionWeight * ctrGapWeight
```

输出原因：

- 曝光量高，但 CTR 低于同排名段预期

输出行动：

- 优化 SEO title、meta description、年份、数字、利益点和差异化表达

独立验收标准：

- 输入包含高曝光、低 CTR、排名前 10 的数据时，能输出该机会
- 低曝光数据不会排到前面
- CTR 已经较高的数据不会被错误标记为优先机会

## 2. 排名 8-20

文件：

- `src/lib/scoring/score-ranking-8-20.ts`

函数建议：

```ts
export function scoreRanking8To20(rows: GscRow[]): OpportunityItem[]
```

筛选条件：

- `position >= 8`
- `position <= 20`
- `impressions >= minimumImpressionThreshold`

评分思路：

```text
score = log(impressions + 1) * rankDistanceWeight * clickProofWeight
```

输出原因：

- 关键词接近首页，继续优化可能更快带来增长

输出行动：

- 补充内容深度、增加 FAQ、加内部链接、优化搜索意图匹配

独立验收标准：

- 排名 8-20 的 query 能被识别
- 排名大于 20 的 query 不进入该类型
- 排名小于 8 的 query 不进入该类型

## 3. 排名 3-10 低 CTR

文件：

- `src/lib/scoring/score-ranking-3-10-low-ctr.ts`

函数建议：

```ts
export function scoreRanking3To10LowCtr(rows: GscRow[]): OpportunityItem[]
```

筛选条件：

- `position >= 3`
- `position <= 10`
- `impressions >= minimumImpressionThreshold`
- `ctr < expectedCtrByPosition(position)`

评分思路：

```text
score = log(impressions + 1) * ctrGapWeight * topPageWeight
```

输出原因：

- 已经在第一页附近，但搜索结果吸引力不足

输出行动：

- 改标题、改描述、增加年份、增加具体收益、增强差异化

独立验收标准：

- 排名 3-10 且 CTR 偏低的数据能被识别
- CTR 正常或偏高的数据不会被识别
- 排名 1-2 的数据不进入该类型，避免误导用户优先改高风险页面

## 4. 同页面关键词聚类

文件：

- `src/lib/scoring/score-same-page-keyword-clusters.ts`

函数建议：

```ts
export function scoreSamePageKeywordClusters(rows: GscRow[]): OpportunityItem[]
```

筛选条件：

- 按 `page` 聚合
- 同一 page 至少包含 `minClusterQueryCount` 个 query
- 聚合 impressions 高于最低门槛

评分思路：

```text
score = log(totalImpressions + 1) * queryCountWeight * averagePositionWeight
```

输出原因：

- 该页面已经覆盖多个相关搜索词，适合扩展内容或整理 FAQ

输出行动：

- 把高潜力 query 补进正文、FAQ、小标题或独立段落

独立验收标准：

- 同一 page 下多个 query 能聚合成一个页面级机会
- query 数太少的 page 不进入聚类机会
- 输出里能展示代表性 queries

## 报告生成流程

建议文件：

- `src/lib/reporting/build-opportunity-report.ts`

流程：

```text
Raw CSV file
-> parseGscCsv
-> detectGscColumns
-> validateFieldMapping
-> normalizeGscRows
-> cleanGscRows
-> scoreHighImpressionLowCtr
-> scoreRanking8To20
-> scoreRanking3To10LowCtr
-> scoreSamePageKeywordClusters
-> sortOpportunities
-> limitFreeReport
-> render report page
```

## 状态管理建议

第一版优先使用 React 本地状态。

建议状态：

- `uploadedFile`
- `rawRows`
- `headers`
- `fieldMapping`
- `cleanRows`
- `report`
- `error`

跨页面传递建议：

- MVP 阶段优先用单个客户端流程组件承载三步状态
- 路由可以保留为页面概念，但不要把 CSV 数据写入 URL
- 刷新页面后数据丢失可以接受

后续如果确实需要跨刷新保存，再考虑 `sessionStorage`。

## 开发顺序

## Step 1: 初始化项目骨架

目标：

- 建立 Next.js + TypeScript + Tailwind 项目
- 建好目录结构和基础页面

涉及文件：

- `src/app/page.tsx`
- `src/app/map-fields/page.tsx`
- `src/app/report/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`

独立验收：

- 本地能启动页面
- 三个页面路径可访问
- 页面之间暂时可以用占位内容

## Step 2: 定义核心类型

目标：

- 先固定数据契约，避免后续模块互相猜字段

涉及文件：

- `src/types/gsc.ts`
- `src/types/opportunity.ts`
- `src/types/report.ts`

独立验收：

- 所有核心类型可被导入
- `GscRow` 和 `OpportunityItem` 字段完整
- TypeScript 无类型错误

## Step 3: 实现 CSV 解析

目标：

- 浏览器本地读取 CSV 并输出 headers 和 raw rows

涉及文件：

- `src/lib/csv/parse-gsc-csv.ts`
- `src/components/upload/csv-upload-dropzone.tsx`

独立验收：

- 标准 CSV 能读取成功
- 能展示文件名、行数和表头
- 非 CSV 或空文件有错误提示

## Step 4: 实现字段自动识别和映射

目标：

- 自动识别 `query/page/clicks/impressions/ctr/position`
- 允许用户手动修正

涉及文件：

- `src/lib/csv/detect-gsc-columns.ts`
- `src/lib/csv/validate-field-mapping.ts`
- `src/components/mapping/field-mapping-form.tsx`

独立验收：

- 标准 GSC 表头能自动映射
- 别名字段能自动映射
- 缺字段、重复字段有错误提示

## Step 5: 实现数据标准化和清洗

目标：

- 把原始 CSV 行转成可计算的 `GscRow[]`

涉及文件：

- `src/lib/csv/normalize-gsc-row.ts`
- `src/lib/csv/clean-gsc-rows.ts`

独立验收：

- `2.4%` 能转成 `0.024`
- `0.024` 保持为 `0.024`
- clicks、impressions、position 能转成数字
- 无效行被过滤并能统计过滤数量

## Step 6: 实现高曝光低点击评分

目标：

- 输出第一类最核心机会

涉及文件：

- `src/lib/scoring/score-high-impression-low-ctr.ts`
- `src/lib/scoring/scoring-utils.ts`

独立验收：

- 高曝光、排名前 10、CTR 偏低的数据能被识别
- 每条结果包含 reason 和 action
- 结果按 score 降序排列

## Step 7: 实现排名 8-20 评分

目标：

- 输出接近首页的低垂果实关键词

涉及文件：

- `src/lib/scoring/score-ranking-8-20.ts`

独立验收：

- position 8-20 的 query 能进入结果
- position 超出范围的数据不会进入结果
- impressions 过低的数据不会排到前面

## Step 8: 实现排名 3-10 低 CTR 评分

目标：

- 输出排名不错但搜索结果吸引力不足的机会

涉及文件：

- `src/lib/scoring/score-ranking-3-10-low-ctr.ts`

独立验收：

- position 3-10 且 CTR 低的数据能进入结果
- CTR 达标的数据不会进入结果
- 输出行动建议聚焦标题和描述优化

## Step 9: 实现同页面关键词聚类

目标：

- 输出页面级扩展内容机会

涉及文件：

- `src/lib/scoring/score-same-page-keyword-clusters.ts`

独立验收：

- 同 page 多 query 能聚合
- 能展示代表性 queries
- 能输出 page 级 reason 和 action

## Step 10: 构建报告对象

目标：

- 汇总所有评分结果，生成统一报告

涉及文件：

- `src/lib/reporting/build-opportunity-report.ts`
- `src/lib/reporting/build-report-summary.ts`
- `src/lib/reporting/sort-opportunities.ts`
- `src/lib/reporting/limit-free-report.ts`

独立验收：

- 报告包含 summary、分类机会和 Top 20
- Top 20 按 score 降序
- 空数据能返回空状态而不是报错

## Step 11: 实现报告 UI

目标：

- 把报告对象展示成可读的机会报告

涉及文件：

- `src/app/report/page.tsx`
- `src/components/report/report-summary.tsx`
- `src/components/report/top-opportunities-table.tsx`
- `src/components/report/ctr-opportunities-section.tsx`
- `src/components/report/ranking-opportunities-section.tsx`
- `src/components/report/low-ctr-top-ranking-section.tsx`
- `src/components/report/keyword-clusters-section.tsx`

独立验收：

- 能看到 summary
- 能看到 Top Opportunities
- 能按类型查看机会
- 每条机会都有指标、原因和行动建议

## Step 12: 完成端到端手动验证

目标：

- 确认真实使用流程能走通

涉及文件：

- `public/samples/gsc-sample.csv`
- `src/app/page.tsx`
- `src/app/map-fields/page.tsx`
- `src/app/report/page.tsx`

独立验收：

- 使用示例 CSV 可以完整走完上传、映射、报告
- 使用字段缺失 CSV 可以看到清晰错误
- 使用空 CSV 不会导致页面崩溃
- 免费版只展示 Top 20

## 建议测试范围

第一版测试以核心纯函数为主。

建议测试文件：

- `src/lib/csv/detect-gsc-columns.test.ts`
- `src/lib/csv/normalize-gsc-row.test.ts`
- `src/lib/scoring/score-high-impression-low-ctr.test.ts`
- `src/lib/scoring/score-ranking-8-20.test.ts`
- `src/lib/scoring/score-ranking-3-10-low-ctr.test.ts`
- `src/lib/scoring/score-same-page-keyword-clusters.test.ts`
- `src/lib/reporting/build-opportunity-report.test.ts`

必须覆盖：

- 标准 GSC 字段
- 字段别名
- CTR 百分比和小数格式
- 无效行过滤
- 四类机会评分
- 空数据结果

## MVP 禁止进入清单

为了避免范围膨胀，以下功能禁止进入 MVP：

- Google Search Console API 接入
- Google OAuth 登录
- 用户注册 / 登录 / 密码系统
- 数据库保存项目
- 历史报告对比
- 多站点项目管理
- Chrome 插件
- AI title 生成
- AI content brief
- PDF 导出
- 团队成员管理
- Agency 工作台
- 自动定时抓取数据
- 后端 CSV 存储
- 大型 SEO crawler
- 关键词排名追踪
- 外链分析
- 竞品分析
- Stripe 订阅系统
- 复杂权限系统

## MVP 完成定义

MVP 完成时应该满足：

- 用户能上传 GSC CSV
- 用户能确认或修正字段映射
- 系统能本地清洗数据
- 系统能生成四类机会
- 报告页能展示 Top 20 免费机会
- 每条机会都有指标、原因和行动建议
- 页面明确承诺 CSV 不上传服务器
- 没有登录、数据库、Google API 和 AI 依赖
