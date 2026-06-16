# MVP 开发拆解

## 文档目的

这份文档把现有产品文档翻译成可执行的开发蓝图，目标是回答 5 个问题：

1. 第一版到底做什么，不做什么
2. 用户第一次使用时会经过哪些页面和步骤
3. 前端、数据处理、评分逻辑应该怎么拆模块
4. 哪些任务必须先做，哪些可以延后
5. 什么结果算 MVP 可上线验证

## 一句话目标

用户上传一份 Google Search Console Performance CSV，在 30 秒内看到一份可执行的 SEO 机会清单，并愿意继续查看完整报告或留下邮箱。

## MVP 成功标准

- 用户能顺利上传标准 GSC CSV
- 系统能识别并清洗核心字段
- 系统能输出至少 3 类高价值机会
- 结果页能让用户快速理解“为什么这是机会”
- 免费版能展示前 20 条机会
- 页面能清楚说明“数据只在本地浏览器处理”

## 明确边界

### 这一版必须做

- 单页 Web App
- 手动上传 CSV
- 浏览器本地解析 CSV
- query 级和 page 级分析
- Top opportunities 列表
- 高曝光低点击机会
- 排名 8–20 机会
- 基础 cannibalization 提示
- 免费版前 20 条结果
- 示例 CSV / 示例报告

### 这一版明确不做

- Google Search Console API
- 用户账号系统
- 历史项目管理
- Chrome 插件
- PDF 导出
- AI 自动写全文
- 多人协作 / Agency 功能

## 建议用户路径

### 路径 A：真实用户

1. 打开首页
2. 看到一句话价值说明和隐私承诺
3. 上传 GSC CSV
4. 系统解析并校验字段
5. 进入分析中状态
6. 查看 Top opportunities 和分类结果
7. 尝试复制建议或解锁完整报告
8. 留邮箱或点击付费入口

### 路径 B：还没准备数据的用户

1. 打开首页
2. 看到示例报告入口
3. 先理解结果长什么样
4. 下载示例 CSV 或回去导出自己的 GSC 数据

## 页面拆解

### 1. Landing Page

目标：让用户愿意上传 CSV。

必须包含：

- 核心标题
- 一句话解释“能找出什么机会”
- 隐私说明
- 上传入口
- 示例报告入口
- 支持字段说明
- FAQ：如何从 GSC 导出 CSV

验收标准：

- 用户 10 秒内能理解工具用途
- 用户能在首屏看到上传按钮
- 用户能看到“不上传服务器”的承诺

### 2. Upload State

目标：让上传和解析过程尽量无脑。

必须包含：

- 拖拽上传区域
- 文件名和大小展示
- CSV 格式校验
- 缺字段报错
- 解析中 loading 状态

验收标准：

- 常见 GSC CSV 能直接导入
- 缺少 `query/page/clicks/impressions/ctr/position` 时有明确报错
- 错误提示能告诉用户下一步怎么修

### 3. Results Page

目标：让用户快速看到“先改哪里最值”。

建议分区：

- Summary cards
- Top opportunities
- CTR opportunities
- Ranking 8–20 opportunities
- Page-level opportunities
- Cannibalization warnings
- Upgrade / export CTA

验收标准：

- 用户能在 30 秒内看懂第一批建议
- 每条建议都能看到 page、query、核心指标、机会原因
- 免费版默认只展示前 20 条

### 4. Example Report Page

目标：降低用户首次使用门槛，帮助推广和 SEO。

必须包含：

- 示例站点数据
- 示例机会解读
- 上传 CTA

## 数据流拆解

```text
CSV 上传
-> 字段识别
-> 原始行解析
-> 数值清洗
-> 无效行过滤
-> query 级机会打分
-> page 级聚合
-> cannibalization 检测
-> 结果排序
-> 免费版裁剪
-> 前端展示
```

## 模块拆解

### A. CSV 输入模块

职责：

- 接收文件
- 读取文本
- 识别表头
- 输出标准化原始记录

输入：

- CSV 文件

输出：

- `RawGscRow[]`

建议字段结构：

```ts
type RawGscRow = {
  query: string
  page: string
  clicks: string | number
  impressions: string | number
  ctr: string | number
  position: string | number
}
```

### B. 数据标准化模块

职责：

- 去掉空行
- 统一 CTR 百分比格式
- 统一 position / clicks / impressions 数字格式
- 去除异常值
- 输出可计算记录

输出：

```ts
type GscRow = {
  query: string
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}
```

### C. 评分引擎模块

职责：

- 计算不同机会类型的 score
- 给出 opportunity reason
- 输出统一结果结构

建议结果结构：

```ts
type OpportunityType =
  | "ctr"
  | "rank-boost"
  | "page"
  | "cannibalization"

type OpportunityItem = {
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

### D. 聚合分析模块

职责：

- 按 `page` 聚合统计
- 识别一个 page 下多个 query
- 识别一个 query 对应多个 page

### E. 结果展示模块

职责：

- 展示 summary
- 展示分类列表
- 控制免费版条数
- 提供复制 / 导出入口

## 评分规则落地建议

### 1. CTR Opportunity

筛选条件建议：

- `impressions >= 全表中位数`
- `position <= 10`
- `ctr < 同排名区间平均值`

展示建议：

- 原因：曝光高，但点击率偏低
- 行动：优化标题、描述、年份、利益点

### 2. Ranking Boost

筛选条件建议：

- `position >= 8`
- `position <= 20`
- `impressions` 高于最低门槛

展示建议：

- 原因：接近首页，继续优化可能更快见效
- 行动：补内容、加 FAQ、加内链、强化搜索意图匹配

### 3. Page Opportunity

按 page 聚合后输出：

- 总 impressions
- 总 clicks
- 平均 CTR
- 平均 position
- 关联 query 数量

展示建议：

- 原因：这个页面承担多个关键词流量机会
- 行动：优先作为本周更新页面

### 4. Cannibalization Warning

筛选条件建议：

- 相同 query 对应多个 page
- 多个 page 都有 impressions
- clicks 分散明显

展示建议：

- 原因：多个页面可能在抢同一搜索意图
- 行动：检查是否要合并页面或强化主页面

## 前端信息架构建议

### 顶部摘要区

- 上传记录数
- 有效 query 数
- 有效 page 数
- 发现机会总数

### 核心结果区

- Top 20 Opportunities
- CTR Opportunities
- Ranking 8–20 Opportunities
- Page Opportunities
- Cannibalization Warnings

### 底部转化区

- 解锁完整报告
- 留邮箱获取模板
- 查看示例报告

## 开发任务拆解

## Phase 0：产品和素材准备

- 确定产品名
- 准备示例 CSV
- 写首页文案
- 写隐私承诺
- 定义免费版与完整报告的边界

交付物：

- 首页低保真结构
- 示例数据文件
- 结果页文案草稿

## Phase 1：本地 CSV 分析 MVP

- 搭建前端项目骨架
- 完成 CSV 上传组件
- 完成字段识别和错误提示
- 完成数据清洗逻辑
- 完成 CTR / Ranking 两类基础评分
- 完成结果列表和 summary cards

交付物：

- 能处理真实 GSC CSV 的本地 Web App

## Phase 2：结果增强

- 增加 page 聚合视图
- 增加 cannibalization 检测
- 增加示例报告页
- 增加“复制建议”能力
- 增加免费版 Top 20 限制

交付物：

- 可拿给外部用户试用的 MVP

## Phase 3：验证转化

- 增加邮箱收集
- 增加完整报告解锁入口
- 增加简单支付页或支付按钮
- 埋点上传率 / 付费转化率

交付物：

- 可以验证付费意愿的上线版本

## 建议技术方案

如果目标是最快上线验证，建议优先选轻量前端栈：

- `Next.js`：方便做首页、工具页、示例页和后续 SEO 页面
- `TypeScript`：避免 CSV 解析和评分逻辑出错
- `Papa Parse`：处理 CSV 上传和解析
- `Zod`：做字段校验和数据结构校验
- `Tailwind CSS`：快速搭界面

原因很简单：

- 页面和工具可以放在同一项目里
- 早期几乎不需要后端
- 后续加 SEO 落地页更顺手

## 建议目录结构

```text
src/
  app/
    page.tsx
    report/page.tsx
    example/page.tsx
  components/
    upload/
    report/
    ui/
  lib/
    csv/
      parse-gsc-csv.ts
      normalize-gsc-row.ts
      detect-gsc-columns.ts
    scoring/
      score-ctr-opportunities.ts
      score-ranking-opportunities.ts
      score-page-opportunities.ts
      detect-cannibalization.ts
    reporting/
      build-report.ts
  types/
    gsc.ts
    opportunity.ts
```

## 最小验收清单

- 上传一份标准 GSC CSV 后不会报错
- 至少能识别 80% 以上常见格式
- 至少能输出 20 条排序合理的机会
- 每条机会都有“为什么”和“建议做什么”
- 结果页在桌面和移动端都可读
- 首页能清楚表达隐私承诺和工具价值

## 当前最推荐的下一步

先不要急着做支付和 AI。

最划算的顺序是：

1. 先定技术栈和项目骨架
2. 先把 CSV 解析和评分链路跑通
3. 再做结果页和示例报告
4. 最后再补转化组件

如果要进入真正开发阶段，下一份最应该补的文档是：

- 技术实施方案
- 数据类型定义
- 页面线框图
- 首批开发任务列表
