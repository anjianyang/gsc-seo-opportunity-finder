# 机会评分逻辑

第一版建议使用规则算法，不依赖 AI。

## CTR Opportunity Score

目标：找出排名不错但点击率偏低的词。

适用场景：

- 修改 SEO title
- 修改 meta description
- 增加年份、数字、利益点
- 提升搜索结果吸引力

参考维度：

- impressions 越高，分数越高
- position 越靠前，分数越高
- ctr 越低，分数越高

示例公式：

```text
score = log(impressions + 1) * positionWeight * ctrGapWeight
```

## Ranking Boost Score

目标：找出排名 8–20，最有机会冲首页的关键词。

适用场景：

- 补充内容深度
- 加内部链接
- 更新页面
- 增加 FAQ
- 增加对比、教程、模板段落

参考维度：

- position 在 8–20 之间
- impressions 不低
- clicks 有一定基础更好

## Content Refresh Score

目标：找出值得更新的页面。

第一版如果只有单次 CSV，先弱化这个功能。

后续如果支持历史报告，可以对比：

- clicks 下降
- impressions 仍然存在
- position 下降
- CTR 下降

## Keyword Cluster Score

目标：找出一个页面覆盖多个相关关键词的情况。

可以提示：

- 这个页面适合扩展内容
- 这些 query 可以组成 FAQ
- 某些 query 可能应该拆成独立页面

## Cannibalization Warning

目标：发现多个页面竞争同一 query。

规则示例：

- 同一个 query 出现在多个 page
- 多个 page 都有 impressions
- clicks 分散

提示：

- 检查搜索意图是否重复
- 考虑合并页面
- 考虑加强主页面内链

