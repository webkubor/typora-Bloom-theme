# 发布规范

## 版本号规则
- 使用语义化版本：`vMAJOR.MINOR.PATCH`
- 版本号以 `VERSION.txt` 为准

## 发布步骤
1) 修改 `VERSION.txt` 为本次版本号（例如 `v0.1.1`）
2) 更新 `release.yml` 作为发布说明
3) 打 tag 并推送：

```bash
git tag "$(cat VERSION.txt)"
git push origin "$(cat VERSION.txt)"
```

GitHub Action 会读取 `release.yml` 生成 Release 内容。
