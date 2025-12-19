# 发布规范

## 版本号规则
- 使用语义化版本：`vMAJOR.MINOR.PATCH`
- 版本号以 `VERSION.txt` 为准

## 发布步骤
1) 修改 `VERSION.txt` 为本次版本号（例如 `v0.1.1`）
2) 更新 `release.yml` 作为发布说明
3) 执行一键发布：

```bash
npm run release
```

脚本会自动打包、提交、推送、打 tag，并触发 GitHub Release。
