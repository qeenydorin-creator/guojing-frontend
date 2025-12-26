# Cloudflare Pages 快速启动（5分钟版）

## 🎯 三句话总结

1. **你的代码** 推送到 GitHub
2. **Cloudflare Pages** 连接你的 GitHub
3. **自动部署** 到全球 CDN，完成！

---

## ⚡ 5 分钟快速部署

### 1️⃣ 推送代码到 GitHub（本地执行）

```bash
cd C:\Users\Administrator\Desktop\guojing-frontend

# 检查 .env 配置
cat .env

# 确保包含：
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# 推送到 GitHub
git add .
git commit -m "Ready for Cloudflare Pages deployment"
git push origin main
```

### 2️⃣ 在 Cloudflare 创建 Pages 项目（浏览器操作）

1. 打开：https://dash.cloudflare.com
2. 左侧菜单 → **Pages** → **创建应用** → **连接到 Git**
3. 选择 **GitHub**（授权一次）
4. 搜索并选择：`guojing-frontend`
5. 点击 **开始设置**

### 3️⃣ 配置构建设置（自动填充）

框架已自动识别为 **Vite**，确认以下配置：

| 项目 | 值 |
|------|-----|
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |

**添加环境变量：**

```
VITE_SUPABASE_URL = 你的_supabase_url
VITE_SUPABASE_ANON_KEY = 你的_supabase_key
```

### 4️⃣ 保存并部署

点击 **保存并部署** → 等待 1-3 分钟

部署完成后，会得到一个临时域名：
```
https://guojing-frontend.pages.dev
```

### 5️⃣ 配置自定义域名

1. 项目页面 → **自定义域**
2. 点击 **设置自定义域**
3. 输入：`www.gij666.com`
4. 选择配置方式：
   - **修改 NS**（推荐，更方便）
   - **添加 CNAME**（保留现有 DNS）
5. 按提示修改域名 DNS
6. 等待激活（5-30 分钟）

---

## ✅ 完成标志

当你看到以下情况说明成功：

- [ ] 访问 `https://www.gij666.com` 正常显示 🎉
- [ ] 浏览器显示 🔒 安全标志
- [ ] Supabase 数据库连接正常
- [ ] 所有功能可用

---

## 🔄 以后如何更新？

非常简单！每次修改代码：

```bash
git add .
git commit -m "描述你的改动"
git push origin main
```

Cloudflare 会**自动**部署（1-3 分钟）。

---

## 🆘 常见问题

**Q：部署失败怎么办？**
A：点击失败的部署查看日志，通常是环境变量配置或代码编译错误。

**Q：DNS 需要多久生效？**
A：通常 5-30 分钟，最多 24 小时。

**Q：能在 Cloudflare Pages 看实时日志吗？**
A：可以。Pages 项目 → 部署 → 点击具体部署可查看完整日志。

**Q：旧 Vercel 部署怎么办？**
A：保留或删除都可以。新域名已指向 Cloudflare Pages。

---

## 📊 新架构优势

| 功能 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| **部署** | ✅ | ✅ |
| **CDN** | ✅ | ✅ |
| **带宽限制** | ⚠️ 100GB/月 | ✅ 无限 |
| **DDoS 防护** | ❌ | ✅ 企业级 |
| **成本** | 免费层 | 完全免费 |

---

## 🎉 恭喜！

你现在拥有：
- ✅ 全球 CDN（200+ 节点）
- ✅ 自动 CI/CD
- ✅ 免费 SSL
- ✅ 企业级防护
- ✅ 完全免费

**开始部署吧！** 🚀
