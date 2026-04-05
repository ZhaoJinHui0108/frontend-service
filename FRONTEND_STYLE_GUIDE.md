# MiniMax 风格前端开发规范

> 基于 MiniMax 官方设计系统，制定本项目前端开发标准。

## 1. 设计系统

### 1.1 色彩系统

#### 主色调
```css
/* Brand Blue - 主要品牌色 */
--brand-6: #1456f0;
--brand-00: #3daeff;  /* 浅色变体 */
--brand-02: #ea5ec1;  /* 粉色点缀 */

/* Primary Blue - 交互色 */
--primary-200: #bfdbfe;
--primary-light: #60a5fa;
--primary-500: #3b82f6;  /* 标准按钮 */
--primary-600: #2563eb;  /* 悬停 */
--primary-700: #1d4ed8;  /* 按下 */
```

#### 文本色
```css
--text-primary: #222222;    /* 主要文本 */
--text-heading: #18181b;    /* 标题 */
--text-secondary: #45515e;  /* 次要文本 */
--text-muted: #8e8e93;      /* 辅助文本 */
--text-helper: #5f5f5f;     /* 提示文本 */
```

#### 背景/表面
```css
--bg-primary: #ffffff;      /* 主背景 */
--bg-secondary: #f0f0f0;    /* 次要按钮背景 */
--bg-glass: hsla(0, 0%, 100%, 0.4);  /* 毛玻璃 */
```

#### 边框
```css
--border-light: #f2f3f5;    /* 分隔线 */
--border-default: #e5e7eb;  /* 组件边框 */
```

#### 语义色
```css
--success-bg: #e8ffea;
--success: #52c41a;
--error-bg: #fff2f0;
--error: #ff4d4f;
--warning-bg: #fffbe6;
--warning: #faad14;
```

### 1.2 字体系统

```css
/* 字体优先级 */
font-family: 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* 备用字体 */
display: 'Outfit', 'Helvetica Neue', Helvetica, Arial;
mid-tier: 'Poppins', 'Helvetica Neue', Helvetica, Arial;
data: 'Roboto', 'Helvetica Neue', Helvetica, Arial;
```

#### 字号层级
| 角色 | 字号 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| Display | 80px | 500 | 1.10 | Hero 标题 |
| H1 | 32px | 600 | 1.10 | 页面标题 |
| H2 | 28px | 500 | 1.71 | 卡片标题 |
| H3 | 24px | 500 | 1.50 | 区块标题 |
| Body | 16px | 400 | 1.50 | 正文 |
| Body Bold | 16px | 700 | 1.50 | 强调 |
| Small | 14px | 400 | 1.50 | 辅助文字 |
| Caption | 13px | 400 | 1.70 | 说明文字 |
| Micro | 12px | 500 | 1.25 | 标签/徽章 |

### 1.3 圆角系统

| 尺寸 | 值 | 用途 |
|------|-----|------|
| Minimal | 4px | 小标签 |
| Standard | 8px | 按钮、小卡片 |
| Comfortable | 12px | 中等卡片、面板 |
| Generous | 20px | 大产品卡片 |
| Large | 24px | Hero 卡片 |
| Pill | 9999px | 导航标签、筛选按钮 |

### 1.4 阴影系统

```css
/* Level 0 - 扁平 */
box-shadow: none;

/* Level 1 - 标准 */
box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;

/* Level 2 - 柔和发光 */
box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 22.576px;

/* Level 3 - 品牌发光 (Featured) */
box-shadow: rgba(44, 30, 116, 0.16) 0px 0px 15px;

/* Level 4 - 抬起 */
box-shadow: rgba(36, 36, 36, 0.08) 0px 12px 16px -4px;
```

### 1.5 间距系统

基础单位: **8px**

```
4px  - 微间距
8px  - 小间距
12px - 元素内
16px - 组件内
24px - 区块内
32px - 区块间
40px - 大区块
64px - 页面级
```

---

## 2. 组件规范

### 2.1 按钮

#### 主按钮 (CTA)
```css
background: #181e25;
color: #ffffff;
padding: 11px 20px;
border-radius: 8px;
font-family: 'DM Sans', sans-serif;
font-size: 16px;
font-weight: 500;
```

#### 次要按钮
```css
background: #f0f0f0;
color: #333333;
padding: 11px 20px;
border-radius: 8px;
```

#### 导航胶囊按钮
```css
background: rgba(0, 0, 0, 0.05);
color: #18181b;
border-radius: 9999px;  /* 全圆角 */
padding: 8px 16px;
```

#### 危险按钮
```css
background: #ff4d4f;
color: #ffffff;
padding: 11px 20px;
border-radius: 8px;
```

### 2.2 卡片

#### 标准卡片
```css
background: #ffffff;
border-radius: 12px;
padding: 24px;
box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
```

#### 统计卡片 (Dashboard)
```css
background: #ffffff;
border-radius: 16px;
padding: 24px;
box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
border: 1px solid #f2f3f5;
```

### 2.3 表单

#### 输入框
```css
border: 1px solid #e5e7eb;
border-radius: 8px;
padding: 10px 14px;
font-size: 14px;
color: #222222;
background: #ffffff;
transition: border-color 0.2s, box-shadow 0.2s;
```

#### 输入框聚焦态
```css
border-color: #3b82f6;
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
```

### 2.4 导航栏

```css
background: #ffffff;
border-bottom: 1px solid #f2f3f5;
padding: 0 24px;
height: 64px;
box-shadow: none;  /* 保持扁平 */
```

#### 导航链接
```css
color: #45515e;
font-size: 14px;
font-weight: 500;
padding: 8px 16px;
border-radius: 9999px;
transition: all 0.2s;
```

#### 激活态
```css
background: rgba(0, 0, 0, 0.05);
color: #18181b;
```

### 2.5 徽章/标签

```css
/* 普通标签 */
background: #f0f0f0;
color: #45515e;
padding: 4px 12px;
border-radius: 9999px;
font-size: 12px;
font-weight: 500;

/* 成功态 */
background: #e8ffea;
color: #52c41a;

/* 危险态 */
background: #fff2f0;
color: #ff4d4f;

/* 主色调 */
background: rgba(59, 130, 246, 0.1);
color: #3b82f6;
```

### 2.6 表格

```css
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th {
  background: #fafafa;
  font-weight: 600;
  font-size: 13px;
  color: #45515e;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 16px;
  border-bottom: 1px solid #f2f3f5;
  font-size: 14px;
  color: #222222;
}

tr:hover td {
  background: #fafafa;
}
```

### 2.7 警告提示

```css
/* 成功 */
background: #e8ffea;
border: 1px solid #b7eb8f;
color: #52c41a;
border-radius: 8px;
padding: 12px 16px;

/* 错误 */
background: #fff2f0;
border: 1px solid #ffccc7;
color: #ff4d4f;
border-radius: 8px;
padding: 12px 16px;

/* 警告 */
background: #fffbe6;
border: 1px solid #ffe58f;
color: #faad14;
border-radius: 8px;
padding: 12px 16px;
```

---

## 3. 页面布局

### 3.1 容器

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
```

### 3.2 页面头部

```css
.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #18181b;
  line-height: 1.10;
}
```

### 3.3 页面间距

```
页面标题 → 32px
标题 → 卡片: 24px
卡片之间: 16px
表单元素之间: 16px
```

---

## 4. 交互规范

### 4.1 过渡动画

```css
transition: all 0.2s ease;
```

### 4.2 悬停状态

- **按钮**: 背景色加深 10%
- **卡片**: 轻微上浮 `translateY(-2px)`
- **链接**: 下划线出现

### 4.3 加载状态

```css
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #8e8e93;
}
```

---

## 5. 响应式断点

| 设备 | 宽度 | 变化 |
|------|------|------|
| Mobile | <768px | 单列布局 |
| Tablet | 768-1024px | 双列网格 |
| Desktop | >1024px | 完整布局 |

---

## 6. 设计禁忌

### 必须避免

1. ❌ 使用 `#1890ff` 等 Ant Design 默认蓝色
2. ❌ 使用 `#001529` 等深色导航背景
3. ❌ 锐角设计 (0-4px 圆角用于卡片)
4. ❌ 过重的阴影 (opacity > 0.16)
5. ❌ 使用系统默认字体堆栈

### 必须遵循

1. ✅ 白色主背景 + 品牌蓝交互色
2. ✅ 胶囊按钮用于导航和筛选
3. ✅ 20-24px 圆角用于卡片
4. ✅ DM Sans 作为主要字体
5. ✅ 统一的 8px 间距系统

---

## 7. 快速参考

### 常用变量

```css
:root {
  --brand-6: #1456f0;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --text-primary: #222222;
  --text-secondary: #45515e;
  --text-muted: #8e8e93;
  --bg-primary: #ffffff;
  --bg-secondary: #f0f0f0;
  --border-light: #f2f3f5;
  --border-default: #e5e7eb;
  --success: #52c41a;
  --error: #ff4d4f;
  --warning: #faad14;
}
```

### 常用类名

| 类名 | 用途 |
|------|------|
| `.container` | 页面容器 |
| `.card` | 卡片容器 |
| `.btn` | 按钮基类 |
| `.btn-primary` | 主按钮 |
| `.btn-secondary` | 次要按钮 |
| `.btn-danger` | 危险按钮 |
| `.form-group` | 表单组 |
| `.page-header` | 页面头部 |
| `.alert` | 警告提示 |
| `.badge` | 徽章 |
| `.actions` | 操作按钮组 |
