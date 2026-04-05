# front-end-service

用户管理系统前端，基于 React + TypeScript + Vite。

## 项目结构

```
src/
├── api/          # API 请求封装
├── components/   # 公共组件
├── pages/        # 页面组件
│   ├── Login.tsx        # 登录页
│   ├── Dashboard.tsx    # 仪表盘
│   ├── Users.tsx        # 用户管理
│   ├── Roles.tsx        # 角色管理
│   ├── Permissions.tsx  # 权限管理
│   └── Init.tsx         # 系统初始化
├── types/        # TypeScript 类型定义
├── App.tsx       # 路由配置
├── main.tsx      # 入口文件
└── index.css     # 全局样式
```

## 环境要求

- Node.js 20+
- npm 9+

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 构建生产版本
npm run build
```

## 功能

- 用户管理（创建、编辑、启用/禁用、分配角色）
- 角色管理（创建、编辑、分配权限）
- 权限管理（创建、编辑）
- 系统初始化

## API 代理

开发模式下，Vite 会将 `/services/user/api` 请求代理到后端服务。

修改 `vite.config.ts` 中的 `server.proxy` 配置可以调整代理目标。
