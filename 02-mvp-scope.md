# MVP 范围

## 必做功能

### CSV 上传

- 支持拖拽上传
- 支持常见 GSC CSV 字段
- 自动识别字段名
- 上传失败时给出清晰提示

### 数据清洗

- 处理百分比 CTR
- 处理 position 数字格式
- 过滤无效行
- 支持 query 维度和 page 维度

### 机会识别

#### 高曝光低点击

适合优化标题和描述。

规则示例：

- impressions 高于全表中位数
- position 小于等于 10
- ctr 低于同排名段平均水平

#### 排名 8–20

适合补内容、加内链、增强页面质量。

规则示例：

- position >= 8
- position <= 20
- impressions 不低

#### 排名 3–10 但 CTR 低

适合改标题、增加年份、利益点、差异化表达。

#### 页面级机会

按 page 聚合：

- 总 impressions
- 总 clicks
- 平均 CTR
- 平均 position
- 相关 queries 数量

#### 关键词聚类

第一版可以简单按相同 page 聚合，不做复杂 NLP。

## 可选功能

- 导出 CSV
- 导出 PDF
- 复制优化清单
- 示例报告
- 邮箱收集
- 付费解锁完整报告

## 暂不做

- Google Search Console API
- Chrome 插件
- 多用户账号系统
- AI 自动写全文
- 大型 SEO 平台功能

