# 国精集团电商平台 - 项目指南

> 本文档为 AI 助手快速上手项目准备，包含关键技术栈、架构设计、数据库约束和常见问题解决方案。

---

## 📋 目录
1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [核心架构](#核心架构)
4. [数据库设计](#数据库设计)
5. [关键文件说明](#关键文件说明)
6. [重要约束和限制](#重要约束和限制)
7. [常见问题和解决方案](#常见问题和解决方案)
8. [部署流程](#部署流程)

---

## 项目概述

**项目名称**: 国精集团电商平台 (Guo Jing Group E-commerce)
**业务领域**: 黄精茶、滋补品电商销售平台
**主要品牌**:
- 茶说九华 (Tea Talk Jiuhua) - 黄精茶系列
- 叶木花仙 (Yemu Huaxian) - 滋补品系列

**核心功能**:
- ✅ 产品展示与购物车
- ✅ 用户注册登录 (Supabase Auth)
- ✅ 订单管理系统
- ✅ 积分系统 (消费赠送、积分抵扣)
- ✅ 积分商城
- ✅ CMS 内容管理 (图片、文本编辑)
- ✅ 溯源视频展示

---

## 技术栈

### 前端
```
- React 19
- TypeScript
- Vite 7
- Tailwind CSS
- Lucide React (图标库)
```

### 后端 & 数据库
```
- Supabase (PostgreSQL)
  - Auth (用户认证)
  - Database (PostgreSQL 数据库)
  - Storage (图片存储)
  - RLS (Row Level Security)
```

### 部署
```
- Vercel (前端托管，自动部署)
- Cloudflare CDN (CDN 加速)
- GitHub (代码仓库)
```

### 工作目录
```
主项目: c:\Users\Administrator\Desktop\guojing-frontend
备用目录: c:\Users\Administrator\Desktop\guojing-group---premium-huangjing (4)
```

---

## 核心架构

### 文件结构
```
guojing-frontend/
├── src/
│   ├── App.tsx                    # 主应用入口
│   ├── types.ts                   # TypeScript 类型定义 ⭐
│   ├── constants.ts               # 常量配置
│   ├── components/                # React 组件
│   │   ├── AuthPage.tsx           # 登录注册页面
│   │   ├── CheckoutModal.tsx      # 结算弹窗
│   │   ├── ContactModal.tsx       # 联系我们弹窗
│   │   ├── EditableImage.tsx      # 可编辑图片组件 (CMS)
│   │   └── LazyImage.tsx          # 懒加载图片
│   └── services/                  # API 服务层
│       ├── supabaseClient.ts      # Supabase 客户端
│       ├── auth.ts                # 认证服务
│       ├── api.ts                 # API 接口
│       └── userOrders.ts          # 订单服务
├── PRODUCTS_SQL_COMMANDS.sql      # 完整 SQL (含注释) ⭐
├── PRODUCTS_SQL_CLEAN.sql         # 可执行 SQL (含详细数据) ⭐
├── PRODUCTS_SQL_SIMPLE.sql        # 简化版 SQL (基础数据)
└── PROJECT_GUIDE.md               # 本文档
```

### 状态管理
- **本地存储**: 使用 `localStorage` + 自定义 Hook `usePersistentState`
- **持久化数据**: 用户信息、购物车、当前页面状态
- **实时同步**: Supabase 实时订阅 (未完全启用)

### 页面路由
项目使用**客户端路由** (Page enum)，而非 React Router:
```typescript
enum Page {
  HOME = 'HOME',                    // 首页
  SHOP = 'SHOP',                    // 产品中心
  PRODUCT_DETAIL = 'PRODUCT_DETAIL', // 产品详情
  POINTS_MALL = 'POINTS_MALL',      // 积分商城
  ORDERS = 'ORDERS',                // 我的订单
  CONTACT_US = 'CONTACT_US',        // 联系我们
  FACTORY_INTRO = 'FACTORY_INTRO',  // 九蒸九晒工艺
  ABOUT = 'ABOUT',                  // 关于我们
  LOGIN = 'LOGIN',                  // 登录
  REGISTER = 'REGISTER'             // 注册
}
```

---

## 数据库设计

### 核心数据表

#### 1. `products` 表 (产品表) ⭐⭐⭐
```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,           -- 产品名称 (唯一约束!)
  description TEXT,                    -- 简短描述
  description_html TEXT,               -- HTML 格式描述
  price NUMERIC(10, 2) NOT NULL,       -- 价格
  original_price NUMERIC(10, 2),       -- 原价
  stock INTEGER DEFAULT 999,           -- 库存
  category TEXT NOT NULL CHECK (category IN ('tea', 'fruit')), -- 分类 (仅允许 tea, fruit!) ⭐
  image_url TEXT,                      -- 主图 URL
  cover_image TEXT,                    -- 封面图 URL
  brand TEXT DEFAULT 'Tea Talk Jiuhua', -- 品牌
  is_active BOOLEAN DEFAULT true,      -- 是否上架

  -- 新增字段 (2024新增)
  features TEXT[],                     -- 产品特点 (数组)
  usage_method TEXT,                   -- 使用方法
  core_ingredients TEXT[],             -- 核心成分 (数组)
  suitable_for TEXT[],                 -- 适用人群 (数组)
  specifications TEXT[],               -- 规格选项 (数组)

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**⚠️ 关键约束**:
1. ✅ `name` 字段有 **UNIQUE 约束** - 产品名称不能重复
2. ✅ `category` 字段有 **CHECK 约束** - 只能是 `'tea'` 或 `'fruit'`
   - ❌ 不支持 `'supplement'` (滋补品)
   - ❌ 不支持 `'gift'` (礼品)
3. ✅ TEXT[] 数组字段使用 PostgreSQL 原生数组类型

#### 2. `orders` 表 (订单表)
```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY,
  order_code TEXT UNIQUE NOT NULL,     -- 订单号 (格式: ORD-YYYYMMDD-XXXXXX)
  user_id UUID REFERENCES auth.users,  -- 用户 ID (外键)
  customer_name TEXT NOT NULL,         -- 收货人姓名
  customer_phone TEXT NOT NULL,        -- 收货人电话
  customer_email TEXT,                 -- 客户邮箱
  address_json JSONB,                  -- 收货地址 (JSON 格式)
  items JSONB NOT NULL,                -- 订单商品列表 (JSON 格式)
  items_total NUMERIC(10, 2),          -- 商品总额
  shipping_fee NUMERIC(10, 2) DEFAULT 0, -- 运费
  discount_total NUMERIC(10, 2) DEFAULT 0, -- 折扣金额
  grand_total NUMERIC(10, 2) NOT NULL, -- 实付金额
  status TEXT DEFAULT 'pending',       -- 订单状态 (pending, confirmed, shipped, completed, cancelled)
  payment_status TEXT DEFAULT 'unpaid', -- 支付状态 (unpaid, paid, refunded)
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,                -- 订单过期时间 (创建后30分钟)
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**订单状态流程**:
```
unpaid (待支付) → paid (已支付) → shipped (已发货) → completed (已完成)
                ↓
            cancelled (已取消)
```

#### 3. `points_ledger` 表 (积分流水表)
```sql
CREATE TABLE public.points_ledger (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  amount INTEGER NOT NULL,             -- 积分变动量 (正数=增加, 负数=扣除)
  source_type TEXT NOT NULL,           -- 来源类型 (order_earn, order_use, manual_adjust)
  source_id TEXT,                      -- 关联订单号/来源ID
  description TEXT,                    -- 流水描述
  created_at TIMESTAMP DEFAULT NOW()
);
```

**积分规则**:
- ✅ 消费赠送: 每消费 ¥10 = 1 积分 (仅已支付订单)
- ✅ 积分抵扣: 1 积分 = ¥1 (下单时立即扣除)
- ✅ 积分有效期: 永久有效

#### 4. `site_config` 表 (站点配置)
```sql
CREATE TABLE public.site_config (
  key TEXT PRIMARY KEY,                -- 配置键 (如: home_hero_bg, checkout_wechat_qr)
  value TEXT NOT NULL,                 -- 配置值 (通常是图片 URL)
  description TEXT,                    -- 配置说明
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**常用配置键**:
- `home_hero_bg` - 首页轮播图
- `about_banner` - 关于我们横幅
- `craft_banner` - 工艺介绍横幅
- `checkout_wechat_qr` - 微信收款码

#### 5. `page_content` 表 (CMS 页面内容)
```sql
CREATE TABLE public.page_content (
  page_key TEXT PRIMARY KEY,           -- 页面键 (about_us, craftsmanship_process)
  title TEXT,                          -- 页面标题
  content_html TEXT,                   -- HTML 内容
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. `traceability_videos` 表 (溯源视频)
```sql
CREATE TABLE public.traceability_videos (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,                 -- 视频标题
  description TEXT,                    -- 视频描述
  video_url TEXT NOT NULL,             -- 视频 URL
  poster_url TEXT,                     -- 视频封面 URL
  display_order INTEGER DEFAULT 0,     -- 显示顺序
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 关键文件说明

### 1. `types.ts` - TypeScript 类型定义 ⭐⭐⭐

**最重要的接口**: `Product`
```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock?: number;
  category: 'tea' | 'supplement' | 'gift' | 'fruit'; // ⚠️ 注意: 前端类型比数据库宽松
  imageUrl: string;
  cover_image?: string;
  brand: 'Tea Talk Jiuhua' | 'Yemu Huaxian';
  specs?: string[];
  details?: string;
  images?: string[];
  description_html?: string;
  is_active?: boolean;

  // 新增字段 (2024)
  features?: string[];          // 产品特点
  usage_method?: string;        // 使用方法
  core_ingredients?: string[];  // 核心成分
  suitable_for?: string[];      // 适用人群
  specifications?: string[];    // 规格选项
}
```

**⚠️ 重要差异**:
- 前端 `category` 类型: `'tea' | 'supplement' | 'gift' | 'fruit'`
- 数据库 `category` 约束: **只允许 `'tea'` 和 `'fruit'`**
- ❗ 这意味着使用 `'supplement'` 或 `'gift'` 会导致数据库插入失败

### 2. `App.tsx` - 主应用组件

**数据获取 (lines 375-407)**:
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .order('id');

      if (productData) {
        const mapped = productData.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description_html || p.description || '',
          price: parseFloat(p.price as any) || 0,
          category: p.category || 'tea' as const,
          imageUrl: p.image_url || p.cover_image || configImages['site_logo'] || '',
          brand: p.brand || 'Tea Talk Jiuhua',

          // 新增字段映射 ⭐
          features: p.features || [],
          usage_method: p.usage_method || '',
          core_ingredients: p.core_ingredients || [],
          suitable_for: p.suitable_for || [],
          specifications: p.specifications || [],
        }));
        setProducts(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch products", e);
      setProducts(MOCK_PRODUCTS); // 降级到 Mock 数据
    }
  };
  fetchData();
}, []);
```

**关键状态管理**:
```typescript
const [currentPage, setCurrentPage] = usePersistentState<Page>('currentPage', Page.HOME);
const [user, setUser] = usePersistentState<UserProfile | null>('user', null);
const [cart, setCart] = usePersistentState<CartItem[]>('cart', []);
const [products, setProducts] = useState<Product[]>([]);  // 从 Supabase 加载
const [pointsProducts, setPointsProducts] = useState<any[]>([]); // 积分商城商品
```

### 3. SQL 文件详解

#### `PRODUCTS_SQL_COMMANDS.sql` (完整版，含注释)
- ✅ 包含详细的中文注释
- ✅ 包含 UPDATE 语句更新现有产品
- ✅ 包含完整的产品数据 (features, usage_method, core_ingredients 等)
- ❌ **不能直接在 Supabase SQL Editor 执行** (注释会导致语法错误)
- 📖 用途: **参考文档和备份**

#### `PRODUCTS_SQL_CLEAN.sql` (推荐使用) ⭐⭐⭐
- ✅ 无注释，可直接在 Supabase 执行
- ✅ 包含完整的产品详细信息
- ✅ 包含 ALTER TABLE 语句添加新字段
- ✅ 包含 5 个新产品的 INSERT 语句 (Product001-Product005)
- ⚠️ **注意**: Product003 和 Product004 使用 `category = 'supplement'`，需手动改为 `'fruit'`
- ⚠️ **注意**: Product005 使用 `category = 'gift'`，需手动改为 `'tea'`

#### `PRODUCTS_SQL_SIMPLE.sql` (简化版，安全版)
- ✅ 无注释，可直接执行
- ✅ 所有 category 值符合数据库约束 (仅 tea/fruit)
- ⚠️ 只包含基础字段，不包含 features/usage_method 等详细信息
- 📖 用途: **快速验证数据库连接和基础插入**

---

## 重要约束和限制

### 数据库约束 ⚠️

#### 1. 产品分类约束 (最常见问题!)
```sql
CHECK (category IN ('tea', 'fruit'))
```
**错误示例**:
```sql
-- ❌ 错误: 会导致 ERROR 23514
INSERT INTO products (name, category, ...)
VALUES ('产品名', 'supplement', ...);

INSERT INTO products (name, category, ...)
VALUES ('产品名', 'gift', ...);
```

**正确做法**:
```sql
-- ✅ 正确
INSERT INTO products (name, category, ...)
VALUES ('黄精切片', 'fruit', ...);  -- 滋补品归为 fruit

INSERT INTO products (name, category, ...)
VALUES ('礼盒装', 'tea', ...);     -- 礼品归为 tea
```

#### 2. 产品名称唯一约束
```sql
UNIQUE (name)
```
**错误示例**:
```sql
-- ❌ 错误: 会导致 ERROR 23505 (duplicate key)
INSERT INTO products (name, ...) VALUES ('黄精茶礼盒', ...);
-- 如果数据库已存在同名产品
```

**解决方案**:
1. 使用临时名称 (如 Product001-Product005)
2. 或先查询现有产品: `SELECT name FROM products;`

#### 3. TEXT[] 数组字段语法
```sql
-- ✅ 正确
features = ARRAY['特点1', '特点2', '特点3']

-- ❌ 错误
features = ['特点1', '特点2']  -- JSON 语法不适用于 PostgreSQL
```

### Supabase SQL Editor 限制

#### 不支持的 SQL 语法:
```sql
-- ❌ 某些位置的注释会导致语法错误
-- 这是注释
ALTER TABLE products ...

-- ✅ 建议移除所有注释后再执行
ALTER TABLE products ...
```

#### 执行顺序建议:
1. 先执行 ALTER TABLE (添加字段)
2. 再执行 INSERT (插入数据)
3. 最后执行 UPDATE (更新现有数据，可选)

---

## 常见问题和解决方案

### 问题 1: "column 'brand' does not exist" (字段不存在)

**错误信息**:
```
ERROR: column "brand" of relation "products" does not exist
```

**原因**: INSERT 语句使用了尚未创建的字段

**解决方案**:
1. 确保先执行 ALTER TABLE 添加字段:
```sql
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Tea Talk Jiuhua';
```
2. 再执行 INSERT 语句

---

### 问题 2: "violates check constraint 'products_category_check'" (分类约束)

**错误信息**:
```
ERROR: new row for relation "products" violates check constraint "products_category_check"
DETAIL: Failing row contains (category)=(supplement).
```

**原因**: 数据库只允许 `'tea'` 和 `'fruit'`，但代码使用了 `'supplement'` 或 `'gift'`

**解决方案**:
```sql
-- 将 supplement 改为 fruit
UPDATE products SET category = 'fruit' WHERE category = 'supplement';

-- 将 gift 改为 tea
UPDATE products SET category = 'tea' WHERE category = 'gift';
```

或在插入时直接使用正确值:
```sql
INSERT INTO products (name, category, ...)
VALUES ('黄精切片', 'fruit', ...);  -- 而非 'supplement'
```

---

### 问题 3: "duplicate key value violates unique constraint" (名称重复)

**错误信息**:
```
ERROR: duplicate key value violates unique constraint "products_name_key"
DETAIL: Key (name)=(黄精礼盒·传世臻品) already exists.
```

**解决方案**:

**方案 A: 使用临时名称**
```sql
INSERT INTO products (name, ...) VALUES ('Product001', ...);
INSERT INTO products (name, ...) VALUES ('Product002', ...);
-- 后续在 Supabase Dashboard 手动重命名
```

**方案 B: 先查询现有产品**
```sql
-- 查看所有产品名称
SELECT name FROM products ORDER BY name;

-- 确保新名称不重复后再插入
INSERT INTO products (name, ...) VALUES ('黄精礼盒·臻品版', ...);
```

**方案 C: 先删除旧产品 (谨慎操作!)**
```sql
-- ⚠️ 危险操作，会删除数据
DELETE FROM products WHERE name = '黄精礼盒·传世臻品';

-- 然后插入新产品
INSERT INTO products (name, ...) VALUES ('黄精礼盒·传世臻品', ...);
```

---

### 问题 4: 前端不显示新产品

**检查清单**:
1. ✅ Supabase SQL 执行成功 (无错误提示)
2. ✅ Supabase Dashboard → Table Editor → products 表能看到新产品
3. ✅ 产品 `is_active = true`
4. ✅ Vercel 已完成重新部署 (检查 Vercel Dashboard)
5. ✅ 浏览器清除缓存 (Ctrl + Shift + R / Cmd + Shift + R)

**调试步骤**:
```javascript
// 在浏览器控制台执行
console.log(products); // 查看前端获取的产品列表

// 检查 Supabase 查询
const { data, error } = await supabase.from('products').select('*');
console.log(data, error);
```

---

### 问题 5: 积分未正确计算

**积分规则**:
- ✅ **消费赠送**: 仅在 `payment_status = 'paid'` 时发放
- ✅ **积分抵扣**: 下单时立即扣除，无论订单是否支付
- ✅ **计算公式**: `Math.floor(netPaid / 10)` (每消费¥10赠1积分)

**常见错误**:
```typescript
// ❌ 错误: 未支付订单也赠送积分
if (earn > 0) {
  await updatePointsRemote(earn, 'order_earn', ...);
}

// ✅ 正确: 只在已支付时赠送
if (earn > 0 && createdOrder.payment_status === 'paid') {
  await updatePointsRemote(earn, 'order_earn', ...);
}
```

---

## 部署流程

### GitHub → Vercel 自动部署

1. **本地推送代码到 GitHub**:
```bash
cd "c:\Users\Administrator\Desktop\guojing-frontend"
git add .
git commit -m "描述更改内容"
git push origin main
```

2. **Vercel 自动检测并部署**:
- Vercel 会在 1-3 分钟内自动触发构建
- 访问 [Vercel Dashboard](https://vercel.com) 查看部署状态

3. **确认部署成功**:
- 部署完成后，访问生产环境 URL
- 检查新功能是否生效

### Supabase 数据库更新

1. **登录 Supabase Dashboard**: https://app.supabase.com
2. **选择项目** (guojing-frontend)
3. **进入 SQL Editor**
4. **粘贴并执行 SQL** (推荐使用 `PRODUCTS_SQL_CLEAN.sql`)
5. **验证结果**: Table Editor → products 表

---

## 快速检查清单

### 添加新产品时必查
- [ ] 产品名称是否唯一 (查询现有产品: `SELECT name FROM products;`)
- [ ] category 字段是否为 `'tea'` 或 `'fruit'` (不能用 supplement/gift)
- [ ] 图片 URL 是否有效 (建议使用 Supabase Storage)
- [ ] brand 字段是否为 `'Tea Talk Jiuhua'` 或 `'Yemu Huaxian'`
- [ ] price 和 stock 是否合理

### 前端更新时必查
- [ ] `types.ts` 接口是否与数据库字段匹配
- [ ] `App.tsx` 数据映射是否包含所有新字段
- [ ] 代码是否已推送到 GitHub
- [ ] Vercel 是否已完成部署
- [ ] 浏览器是否清除缓存

### 数据库更新时必查
- [ ] ALTER TABLE 是否先于 INSERT 执行
- [ ] SQL 文件是否无注释 (Supabase SQL Editor 限制)
- [ ] 是否使用了 `IF NOT EXISTS` (避免重复执行错误)
- [ ] TEXT[] 数组是否使用 ARRAY['item1', 'item2'] 语法

---

## 联系方式

**客服电话**:
- 官方售后: 4008566001
- 手机: 19956618186

**客服邮箱**: chashuojiuhua@qygjsw.com.cn

**公司地址**: 安徽省池州市九华山风景区

---

## 附录: SQL 快速参考

### 查询所有产品
```sql
SELECT id, name, category, price, brand, is_active
FROM products
ORDER BY created_at DESC;
```

### 查询产品名称 (检查重复)
```sql
SELECT name FROM products ORDER BY name;
```

### 添加新字段 (安全执行)
```sql
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS new_field TEXT;
```

### 插入新产品 (基础模板)
```sql
INSERT INTO public.products (
  name, price, image_url, description, category, stock, brand, is_active
) VALUES (
  '产品名称',
  1980.00,
  'https://example.com/image.jpg',
  '产品描述',
  'tea',  -- 仅 tea 或 fruit
  999,
  'Tea Talk Jiuhua',
  true
);
```

### 插入新产品 (完整版，含数组字段)
```sql
INSERT INTO public.products (
  name, price, image_url, description, category, stock,
  features, usage_method, core_ingredients, suitable_for, specifications,
  brand, is_active
) VALUES (
  '黄精茶礼盒',
  1980.00,
  'https://example.com/image.jpg',
  '高端黄精茶礼盒',
  'tea',
  999,
  ARRAY['补中益气', '滋阴润肺'],
  '取3-5克，90-95℃冲泡',
  ARRAY['黄精多糖 ≥25%', '皂苷类成分'],
  ARRAY['商务送礼', '养生保健'],
  ARRAY['200g 礼盒装', '400g 家庭装'],
  'Tea Talk Jiuhua',
  true
);
```

### 更新产品分类 (修复约束错误)
```sql
UPDATE products
SET category = 'fruit'
WHERE category = 'supplement';

UPDATE products
SET category = 'tea'
WHERE category = 'gift';
```

### 删除产品 (谨慎操作)
```sql
-- 按 ID 删除
DELETE FROM products WHERE id = 'uuid-here';

-- 按名称删除
DELETE FROM products WHERE name = '产品名称';
```

---

**文档版本**: v1.0
**最后更新**: 2024年
**维护者**: AI Assistant Team
