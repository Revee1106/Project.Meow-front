# Tower PvP / Project.Meow Front

Tower PvP 是一个移动端优先的异步据点 PvP 爬塔前端项目。当前仓库版本为 `0.1.0`，已从设计原型迁移为 React + TypeScript + Vite 工程，并完成 v1 页面和 v2 MVP 页面的前端实现。

Git remote:

```bash
origin https://github.com/Revee1106/Project.Meow-front.git
```

## 当前版本

`0.1.0`

当前版本目标是完成可运行的前端 MVP，并通过 mock service layer 模拟后端数据流，为后续接入真实后端 API 做准备。

## 技术栈

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- i18next / react-i18next
- Vitest
- Playwright
- ESLint / Prettier

## 已完成页面

### v1 核心页面

- Home
- Floor
- Node Detail Sheet

### v2 MVP 页面

- Battle Resolving / Replay
- Battle Result
- Garrison
- Equipment
- Reports
- Settings

## 当前功能进度

- 已建立真实前端项目结构，不再依赖 Babel-in-browser 或 `window.*` 原型全局变量。
- 已接入路由：
  - `/`
  - `/floor/:floorId`
  - `/battle/:battleId`
  - `/battle/resolve`
  - `/battle/result`
  - `/garrison`
  - `/equipment`
  - `/reports`
  - `/settings`
- 已建立 mock / HTTP API 切换入口：`VITE_USE_MOCKS`。
- 已建立 `services/types.ts`、`services/api.ts`、`services/queries.ts` 作为前端服务契约层。
- 已接入 TanStack Query 管理服务端状态。
- 已接入 Zustand 管理玩家、通知、楼层、背包、设置、i18n 和 UI 状态。
- 已完成英文和简体中文 locale 文件。
- 已补充页面与关键逻辑测试。
- 已生成后端接口契约文档：`Tower PvP Backend API Contract.md`。

## 后端 API Contract

当前后端接口契约版本为：

`Tower PvP Backend API Contract v0.1 Final`

文档位置：

```text
Tower PvP Backend API Contract.md
```

v0.1 后端决策摘要：

- 第一版后端先做 in-memory API，不接数据库。
- PVE NPC 挑战暂时无次数限制。
- PVP 每日免费挑战 5 次，超出后消耗 tickets。
- 占领节点后固定 5 分钟保护期。
- available 节点允许直接占领。
- NPC 被击败后节点变为 available，Battle Result 可点击 Occupy。
- Node lost 后，旧收益仍归原防守玩家领取，攻击者不偷取旧收益。
- Battle Resolve MVP 返回最终结果和简化 i18n log，不做真实逐帧战斗。
- Settings MVP 继续使用 localStorage，后端 settings API 暂保留。
- 后端内部使用 typed `Reward[]`，API 兼容返回 `rewardTokens`。

## 开发命令

安装依赖：

```bash
npm install
```

本地开发：

```bash
npm run dev
```

构建：

```bash
npm run build
```

Lint：

```bash
npm run lint
```

单元测试：

```bash
npm test
```

E2E 测试：

```bash
npm run test:e2e
```

## 环境变量

```bash
VITE_USE_MOCKS=true
```

默认使用 mock service。

```bash
VITE_USE_MOCKS=false
```

切换到 HTTP API。当前 HTTP API 仍有部分 v2 方法需要在后端联调阶段补齐。

## 主要目录

```text
src/
  components/      通用 UI 与游戏组件
  layouts/         AppShell
  pages/           页面组件
  services/        类型、API、TanStack Query hooks
  mocks/           mock 数据和 fixture
  stores/          Zustand stores
  locales/         i18n 文案
  styles/          全局样式与页面样式
```

## 当前风险与待办

- Node Detail 的 challenge 行为在接真实后端时必须改为调用 `challengeNode(node.id)`，不能固定跳 mock battle id。
- `httpApi` 中 v2 相关方法需要在后端联调阶段补齐。
- Battle 主线应使用 `BattleResolvePayload` + `BattleResult`；legacy `BattleLog` 仅作为兼容。
- Garrison claim / leave 已在 contract 中统一响应格式，前端服务层后续应按统一响应收敛。
- Settings v0.1 继续 localStorage，后端持久化延后。

## 下一步建议

1. 按 `Tower PvP Backend API Contract.md` 实现 in-memory backend API。
2. 补齐 `VITE_USE_MOCKS=false` 下的 v2 HTTP service 方法。
3. 联调 Home / Floor / Battle Resolve / Battle Result / Garrison / Equipment / Reports。
4. 确认 0.1 后端稳定后，再规划数据库持久化。
