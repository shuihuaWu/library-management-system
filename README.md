# 图书管理系统

基于 Next.js、TypeScript、Tailwind CSS 和 Supabase 构建的完整图书管理系统。

## 功能特性

- **用户认证**：注册、登录、登出
- **图书管理**：添加、编辑、删除和浏览图书信息
- **作者管理**：添加、编辑、删除和浏览作者信息
- **分类管理**：添加、编辑、删除和浏览分类信息
- **借阅管理**：记录图书借阅和归还信息，跟踪借阅状态
- **搜索功能**：搜索图书、作者、分类和借阅记录
- **数据关联**：图书与作者、分类之间的关联查询

## 技术栈

- **前端**：
  - Next.js 15
  - TypeScript
  - Tailwind CSS 4
  - React Hook Form + Zod
- **后端**：
  - Supabase (PostgreSQL 数据库)
  - Supabase Auth (用户认证)
  - Supabase Storage (可选，存储图书封面)

## 系统架构

- 前端使用 Next.js App Router 实现页面路由
- 使用 TypeScript 进行类型安全保证
- Tailwind CSS 实现响应式 UI
- Supabase 实现数据存储、用户认证等功能

## 开始使用

### 前提条件

- Node.js 20.x 或更高版本
- pnpm 10.x 或更高版本
- Supabase 账号和项目

### 安装步骤

1. 克隆项目

```bash
git clone https://github.com/yourusername/book-management-system.git
cd book-management-system
```

2. 安装依赖

```bash
pnpm install
```

3. 配置环境变量

复制 `.env.local.example` 文件为 `.env.local`，并填入 Supabase 相关信息：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. 设置 Supabase 数据库

在 Supabase 控制台中创建以下表：
- authors
- categories
- books
- profiles
- borrow_records

可以参考 `src/lib/database.types.ts` 文件中的类型定义来设置表结构。

5. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

试用地址：
https://library-management-system-nine-fawn.vercel.app/

## 部署

本项目可以部署到 Vercel、Netlify 等平台，详细部署指南请参考各平台文档。

## 许可证

MIT
