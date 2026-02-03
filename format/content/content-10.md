# 质量度量与持续改进

## 概述

代码质量需要量化、监控、持续改进。理解质量度量的核心在于掌握指标体系、CI/CD 门禁策略、持续优化机制。

**核心认知**：
- 无法度量的无法改进
- CI/CD 门禁是质量保障的最后防线
- 规范需要持续优化，而非一成不变

**后端类比**：
- 质量度量 ≈ 代码质量平台（SonarQube）
- CI 门禁 ≈ 自动化测试门禁
- 持续改进 ≈ DevOps 文化

---

## 代码质量指标

### Lint 错误率

**定义**：
```
Lint 错误率 = Lint 错误数 / 总代码行数 × 100%
```

**统计**：
```bash
# 统计 Lint 错误数
eslint src/**/*.js --format json | \
  jq '[.[] | .messages[]] | length'

# 统计代码行数
find src -name "*.js" | xargs wc -l | tail -1

# 计算错误率
# 例如：500 个错误 / 100000 行代码 = 0.5%
```

**健康基线**：
```
优秀：< 0.1%
良好：0.1% - 0.5%
一般：0.5% - 1%
较差：> 1%
```

---

### 格式化覆盖率

**定义**：
```
格式化覆盖率 = 符合 Prettier 格式的文件数 / 总文件数 × 100%
```

**检查**：
```bash
# 检查不符合格式的文件
prettier --check "src/**/*.{js,jsx,ts,tsx}" | grep "Code style issues found"

# 统计不符合格式的文件数
prettier --check "src/**/*.{js,jsx,ts,tsx}" 2>&1 | grep -c "Code style issues"
```

**目标**：100% 覆盖率

---

### 技术债量化

**SonarQube 指标体系**：

**1. 技术债比率**
```
技术债比率 = 修复技术债所需时间 / 开发时间 × 100%

健康基线：< 5%
```

**2. 代码重复率**
```
代码重复率 = 重复代码行数 / 总代码行数 × 100%

健康基线：< 3%
```

**3. 圈复杂度**
```
圈复杂度 = 代码的独立路径数

健康基线：
- 函数：< 10
- 文件：< 50
```

**4. 代码异味**
```
代码异味：不符合最佳实践的代码模式

分类：
- Bloaters（臃肿代码）
- Object-Orientation Abusers（面向对象滥用）
- Change Preventers（阻碍变更）
- Dispensables（可有可无）
- Couplers（过度耦合）
```

---

### 质量趋势跟踪

**建立质量仪表盘**：

```javascript
// 质量指标趋势
{
  "2024-01": {
    "lintErrors": 500,
    "codeSmells": 200,
    "duplication": 5,
    "coverage": 80
  },
  "2024-02": {
    "lintErrors": 400,
    "codeSmells": 180,
    "duplication": 4,
    "coverage": 82
  },
  "2024-03": {
    "lintErrors": 300,
    "codeSmells": 150,
    "duplication": 3,
    "coverage": 85
  }
}
```

**可视化**：
```
Lint 错误趋势图：
500 ┤
400 ┤  ●
300 ┤    ●
200 ┤      ●
100 ┤        ●
  0 ┼────────────►
    Jan Feb Mar Apr
```

**目标**：
- Lint 错误数：持续下降
- 代码质量：持续提升

**后端类比**：APM（Application Performance Monitoring）的指标监控。

---

## CI/CD 中的质量门禁

### 门禁策略

**阻断 vs 警告**：

| 检查项 | 级别 | 行为 | 适用场景 |
|--------|------|------|---------|
| ESLint error | 阻断 | 构建失败 | 严重质量问题 |
| ESLint warning | 警告 | 允许通过 | 建议改进 |
| Prettier | 阻断 | 构建失败 | 格式必须统一 |
| TypeScript | 阻断 | 构建失败 | 类型必须正确 |
| 代码覆盖率 | 阻断 | < 80% 失败 | 测试必须充分 |

---

### GitHub Actions 门禁配置

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      # 阻断性检查
      - name: ESLint Check
        run: npm run lint
      
      - name: Prettier Check
        run: npm run format:check
      
      - name: TypeScript Check
        run: npm run type-check
      
      - name: Test Coverage
        run: npm run test:coverage
      
      # 质量报告
      - name: Upload Coverage Report
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/lcov.info
      
      # 质量趋势分析
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

### 门禁策略的演进

**新项目（严格）**：
```yaml
- name: ESLint Check
  run: npm run lint -- --max-warnings 0  # 0 警告
```

**历史项目（宽松）**：
```yaml
- name: ESLint Check
  run: npm run lint -- --max-warnings 100  # 允许 100 个警告
  continue-on-error: true  # 不阻断构建
```

**渐进式收紧**：
```
Month 1: --max-warnings 100
Month 2: --max-warnings 80
Month 3: --max-warnings 60
...
Month 6: --max-warnings 0
```

---

### 质量趋势的跟踪

**每日质量报告**：
```bash
#!/bin/bash
# daily-quality-report.sh

DATE=$(date +%Y-%m-%d)

# 运行 ESLint
eslint src/**/*.js --format json > "reports/eslint-$DATE.json"

# 统计指标
ERRORS=$(jq '[.[] | .messages[] | select(.severity==2)] | length' "reports/eslint-$DATE.json")
WARNINGS=$(jq '[.[] | .messages[] | select(.severity==1)] | length' "reports/eslint-$DATE.json")

# 发送报告
echo "Date: $DATE" > "reports/summary-$DATE.txt"
echo "Errors: $ERRORS" >> "reports/summary-$DATE.txt"
echo "Warnings: $WARNINGS" >> "reports/summary-$DATE.txt"

# 如果错误数增加，发送警报
if [ $ERRORS -gt $PREV_ERRORS ]; then
  send_alert "质量下降：错误数从 $PREV_ERRORS 增加到 $ERRORS"
fi
```

**后端类比**：每日构建报告。

---

## 规范的持续优化

### 规范回顾与调整机制

**定期回顾**：
```
每季度：规范回顾会
  ↓
收集团队反馈
  ↓
评估规则合理性
  ↓
调整不合理规则
  ↓
更新规范文档
```

**回顾议题**：
1. 哪些规则执行困难？
2. 哪些规则经常被禁用？
3. 哪些规则违规率高？
4. 团队有什么改进建议？

---

### 团队反馈的收集与处理

**反馈渠道**：
```
1. 规范反馈表单
2. Code Review 中的讨论
3. 团队会议
4. 匿名问卷
```

**反馈模板**：
```markdown
## 规范反馈

**规则名称**：no-console

**问题描述**：
- 服务端代码需要使用 console.log 记录日志
- 目前规则禁止所有 console，导致频繁禁用

**建议**：
- 服务端代码允许 console
- 或者只禁止 console.log，允许 console.warn/error

**优先级**：高

**提出人**：@Alice
```

---

### 数据驱动的规则调整

**统计规则违规率**：
```bash
# 统计各规则违规次数
eslint src/**/*.js --format json | \
  jq '.[] | .messages[] | .ruleId' | \
  sort | uniq -c | sort -rn

# 输出示例
# 150 no-console
#  80 no-unused-vars
#  50 complexity
#  30 max-lines-per-function
```

**分析与决策**：
```
no-console 违规率高（150 次）
  ↓
分析原因：服务端代码需要日志
  ↓
调整规则：
{
  "overrides": [{
    "files": ["src/server/**"],
    "rules": {
      "no-console": "off"
    }
  }]
}
```

---

### 规范工具的升级策略

**工具升级流程**：
```
1. 评估新版本
   - 查看 Release Notes
   - 测试新功能
   - 评估破坏性变更

2. 制定升级计划
   - 影响范围分析
   - 迁移策略
   - 回滚方案

3. 小范围试点
   - 选择 1 个子项目
   - 升级并验证
   - 收集反馈

4. 全面推广
   - 通知团队
   - 统一升级
   - 监控问题

5. 问题修复
   - 及时响应问题
   - 调整配置
   - 更新文档
```

---

**升级示例：ESLint 7 → 8**

**Step 1：评估影响**
```bash
# 安装新版本
npm install eslint@8 --save-dev

# 运行检查
npm run lint 2>&1 | tee upgrade-report.txt

# 统计新增错误
grep "error" upgrade-report.txt | wc -l
```

**Step 2：制定迁移计划**
```markdown
## ESLint 8 升级计划

**影响范围**：
- 新增 50 个错误
- 主要是 React Hooks 规则

**迁移策略**：
- Week 1: 自动修复 40 个
- Week 2: 人工修复 10 个

**回滚方案**：
- 保留 package-lock.json
- 可快速回退到 v7
```

**Step 3：执行升级**
```bash
# 自动修复
npm run lint:fix

# 测试验证
npm test

# 提交代码
git commit -m "chore: upgrade eslint to v8"
```

---

## 深入一点：建立质量文化

### 质量文化的建立

**质量不是检查出来的，是设计出来的**

**文化要素**：
```
1. 团队共识
   - 质量是第一优先级
   - 规范不是限制，是保障

2. 持续改进
   - 定期回顾规范
   - 及时调整不合理规则

3. 自动化优先
   - 工具自动执行
   - 减少人工成本

4. 透明化度量
   - 质量指标公开
   - 趋势可视化

5. 正向激励
   - 表彰高质量代码
   - 分享最佳实践
```

---

### 从"被动遵守"到"主动追求"

**被动遵守**：
```
开发者：因为 CI 不通过，被迫修复
心态：应付检查
效果：质量基线
```

**主动追求**：
```
开发者：主动追求代码质量
心态：自我要求
效果：持续提升
```

**转变策略**：
1. 展示质量价值（效率提升、Bug 减少）
2. 降低执行成本（自动化工具）
3. 正向激励（表彰优秀代码）
4. 技术分享（最佳实践）

---

## 工程实践案例

### 案例：某团队的质量改进之路

**背景**：
- 团队 15 人
- 代码质量参差不齐
- 技术债严重

**改进措施**：

**阶段 1：建立质量基线（Month 1-2）**
```
1. 引入 ESLint + Prettier
2. CI 门禁（阻断严重错误）
3. 建立质量仪表盘
```

**阶段 2：持续改进（Month 3-6）**
```
1. 定期质量回顾会
2. 数据驱动规则调整
3. 技术债清理
```

**阶段 3：质量文化（Month 6+）**
```
1. 质量成为团队价值观
2. 主动追求代码质量
3. 技术分享常态化
```

**效果**：
```
Lint 错误率：1% → 0.1%
代码重复率：5% → 2%
Code Review 时间：30 分钟 → 10 分钟
Bug 率：15% → 5%
团队满意度：60% → 85%
```

---

## 参考资料

- [SonarQube](https://www.sonarqube.org/)
- [Code Climate](https://codeclimate.com/)
- [Codecov](https://about.codecov.io/)
- [Technical Debt Quadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html)
