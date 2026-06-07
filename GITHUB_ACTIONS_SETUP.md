# GitHub Actions 每日更新落地价

本项目已经包含每日自动更新脚本：

- 工作流：`.github/workflows/update-latest-deals.yml`
- 抓取脚本：`scripts/fetch_latest_deals.py`
- 来源配置：`data/sources.json`
- 输出数据：`data/latest-deals.json`

## 运行方式

推送到 GitHub 后，Actions 会在每天 UTC 08:20 自动运行，也可以在 GitHub Actions 页面点击 `Run workflow` 手动运行。

## 数据规则

脚本只抓取 `data/sources.json` 中配置的公开 URL。公开网络线索会写入：

- `vehiclePrice`：裸车价
- `outTheDoorPrice`：落地价
- `verification: "pending"`：等待人工核验
- `sourceUrl`：公开来源

不要抓取需要登录、绕过验证、包含个人隐私或受版权限制的票据页面。真实票据应通过用户上传后脱敏入库。

## 添加新来源

在 `data/sources.json` 追加：

```json
{
  "name": "Source name",
  "url": "https://example.com/public-feed.json",
  "brand": "toyota",
  "model": "camry",
  "modelName": "Toyota Camry",
  "defaultTrim": "SE",
  "city": "Public",
  "state": "US"
}
```

脚本会提取页面文本中的价格线索并合并到 `data/latest-deals.json`。
