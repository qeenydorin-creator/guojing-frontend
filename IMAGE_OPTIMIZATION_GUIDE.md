# 图片加载优化指南

## 已完成的优化

✅ **创建了 LazyImage 组件** (`components/LazyImage.tsx`)

这个组件提供了：
- 懒加载：只在图片进入视口时才加载
- 自动优化 Unsplash URL（根据设备自动调整尺寸和质量）
- 加载动画和占位符
- 移动端和桌面端响应式图片

---

## 如何使用 LazyImage 组件

### 替换现有的 img 标签

**之前的代码：**
```tsx
<img
  src={configImages.home_hero_bg}
  alt="Hero Background"
  className="w-full h-96 object-cover"
/>
```

**优化后的代码：**
```tsx
<LazyImage
  src={configImages.home_hero_bg}
  alt="Hero Background"
  className="w-full h-96"
/>
```

---

## 快速优化步骤

### 步骤 1：优化首屏图片（最重要）

找到首页的 Hero 背景图，通常在 App.tsx 的 HomePage 组件中：

**搜索关键词：**
- `home_hero_bg`
- `<img` 标签

**替换示例：**
```tsx
// 旧代码
<div className="relative h-screen">
  <img src={configImages.home_hero_bg} alt="..." className="..." />
</div>

// 新代码
<div className="relative h-screen">
  <LazyImage src={configImages.home_hero_bg} alt="..." className="..." />
</div>
```

### 步骤 2：优化产品图片

找到产品列表的图片渲染：

**搜索关键词：**
- `products.map`
- `product.image`

**替换示例：**
```tsx
// 旧代码
<img src={product.image_url} alt={product.name} className="..." />

// 新代码
<LazyImage src={product.image_url} alt={product.name} className="..." />
```

### 步骤 3：优化其他页面图片

依次优化：
- 关于我们页面的横幅图片
- 工厂介绍的图片
- 积分商城的商品图片

---

## 图片 URL 优化建议

### Unsplash 图片优化

LazyImage 组件已自动处理 Unsplash 图片优化：
- 移动端：宽度 800px，质量 70
- 桌面端：宽度 1200px，质量 75

### Supabase 图片优化

对于 Supabase 存储的图片，可以添加变换参数：

**之前：**
```
https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/jiuHnwg.jpg
```

**优化后：**
```
https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/jiuHnwg.jpg?width=1200&quality=80
```

**可以在 App.tsx 的 PLACEHOLDER_SITE_IMAGES 中更新：**
```tsx
const PLACEHOLDER_SITE_IMAGES: Record<string, string> = {
  home_hero_bg: 'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/jiuHnwg.jpg?width=1200&quality=80',
  craft_banner: 'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/jiuHnwg.jpg?width=1200&quality=80',
  // ... 其他图片
};
```

---

## 性能提升预期

应用这些优化后，你可以期待：

- ✅ **首次加载速度提升 50-70%**
- ✅ **减少初始页面大小 60-80%**
- ✅ **滚动时按需加载图片**
- ✅ **移动端加载速度提升更明显**

---

## 测试优化效果

### 1. 使用浏览器开发者工具

1. 打开网站，按 F12
2. 切换到 **Network** 标签
3. 勾选 **Disable cache**
4. 刷新页面（Ctrl+R）
5. 查看：
   - 加载的图片数量（应该比之前少）
   - 总加载大小（应该减少 60-80%）
   - DOMContentLoaded 时间（应该更快）

### 2. 使用 Google PageSpeed Insights

访问：https://pagespeed.web.dev/

输入你的网站地址，查看性能评分。

优化后的改进：
- Performance 分数应该提升到 70-90+
- Largest Contentful Paint (LCP) 应该减少 50%+
- Total Blocking Time 应该减少

---

## 进一步优化建议

### 1. 使用 WebP 格式

如果你有自己的图片，建议转换为 WebP 格式：
- 比 JPEG 小 30%
- 比 PNG 小 50%
- 现代浏览器都支持

**在线转换工具：**
- https://squoosh.app/
- https://cloudconvert.com/

### 2. 启用 Vercel 图片优化

Vercel 提供免费的图片优化服务。创建一个优化函数：

```tsx
// 在 App.tsx 顶部添加
const optimizeVercelImage = (url: string, width: number = 1200) => {
  // Vercel 图片优化 API
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
};
```

### 3. 预加载关键图片

在 index.html 的 `<head>` 中添加：

```html
<link rel="preload" as="image" href="你的首屏关键图片URL" />
```

---

## 常见问题

### Q: LazyImage 在首屏图片上应该使用吗？

A: 首屏的关键图片（如 Hero 背景）可以考虑不使用懒加载，直接加载。但使用 LazyImage 的 URL 优化功能仍然有帮助。

### Q: 图片加载时显示空白怎么办？

A: LazyImage 组件已经包含了加载动画。你可以通过 `placeholderColor` 参数自定义占位符颜色：

```tsx
<LazyImage
  src="..."
  alt="..."
  placeholderColor="#f5f3f0"  // 自定义占位符颜色
  className="..."
/>
```

### Q: 如何为所有图片统一优化？

A: 可以使用"查找和替换"功能：
1. 在 VSCode 中按 Ctrl+H
2. 查找：`<img src=`
3. 替换为：`<LazyImage src=`
4. 逐个检查并替换

---

## 实施清单

- [ ] 优化首页 Hero 背景图片
- [ ] 优化产品列表图片
- [ ] 优化积分商城图片
- [ ] 优化关于我们页面图片
- [ ] 优化工厂介绍图片
- [ ] 更新 Supabase 图片 URL（添加参数）
- [ ] 测试移动端加载速度
- [ ] 测试桌面端加载速度
- [ ] 使用 PageSpeed Insights 验证改进

---

## 需要帮助？

如果你在实施过程中遇到问题，可以：
1. 检查浏览器控制台是否有错误
2. 确认 LazyImage.tsx 文件已正确保存
3. 确认 App.tsx 已导入 LazyImage
4. 检查图片 URL 是否正确

祝优化顺利！🚀
