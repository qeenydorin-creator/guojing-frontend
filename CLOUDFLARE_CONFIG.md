# Cloudflare + Nginx 完整配置指南

## 📊 新架构说明

```
用户浏览器
    ↓
Cloudflare CDN (全球 200+ 节点)
    ↓ (DDoS 防护 + WAF + 缓存加速)
国内服务器 123.57.58.46
    ↓
Nginx (端口 80/443)
    ↓
静态前端文件 + Supabase (数据库)
```

---

## ✅ 为什么选择 Cloudflare 而不是雷池？

| 特性 | 雷池 WAF | Cloudflare CDN |
|------|---------|----------------|
| **全球 CDN** | ❌ 需要额外配置 | ✅ 免费 200+ 节点 |
| **DDoS 防护** | ⚠️ 有限 | ✅ 企业级无限 |
| **WAF 防护** | ✅ 企业级 | ✅ 免费规则 |
| **SSL 证书** | ⚠️ 手动配置 | ✅ 自动免费 |
| **部署复杂度** | ⚠️ Docker 复杂 | ✅ 仅需 DNS |
| **维护成本** | ⚠️ 容器管理 | ✅ 零维护 |
| **成本** | 免费但占用资源 | 完全免费 |

---

## 🚀 快速部署（3 步）

### 步骤 1：清理服务器（在宝塔终端）

```bash
# 删除所有雷池容器
docker ps -a | grep safeline | awk '{print $1}' | xargs -r docker rm -f

# 运行简化部署脚本
chmod +x cloudflare-deployment.sh
sudo ./cloudflare-deployment.sh
```

### 步骤 2：配置 Cloudflare DNS

1. 登录：https://dash.cloudflare.com
2. 添加站点：`gij666.com`
3. 选择 Free 计划
4. 配置 DNS：
   - A 记录 @ → 123.57.58.46 (已代理 🟠)
   - A 记录 www → 123.57.58.46 (已代理 🟠)
5. 修改域名 NS 为 Cloudflare 提供的 NS
6. 等待激活 (5-30 分钟)

### 步骤 3：部署前端代码

```bash
# 本地构建
npm run build

# 上传 dist 文件夹内容到 /www/wwwroot/www.gij666.com/
```

访问：https://www.gij666.com ✅

---

## 🎯 详细配置步骤

### Cloudflare SSL/TLS 设置

1. **SSL/TLS** → **概述**
2. 加密模式：**灵活** (推荐初期) 或 **完全** (需要服务器 SSL)
3. **边缘证书** → **Always Use HTTPS** 开启

### Cloudflare 性能优化

1. **速度** → **优化**
   - Auto Minify: JavaScript, CSS, HTML
   - Brotli 压缩: 开启

2. **缓存** → **配置**
   - 浏览器缓存 TTL: 4 小时
   - 缓存级别: 标准
   - 始终在线: 开启

### Cloudflare 安全防护

1. **安全** → **WAF**
   - 托管规则: 开启
   - 威胁评分: 中等

2. **安全** → **设置**
   - 安全级别: 中等
   - Bot Fight Mode: 开启

---

## 📋 检查清单

- [ ] 雷池容器已删除
- [ ] Nginx 运行在端口 80
- [ ] 能访问 http://123.57.58.46
- [ ] Cloudflare 站点已添加
- [ ] DNS 记录已配置（A 记录指向 123.57.58.46，已代理 🟠）
- [ ] 域名 NS 已修改为 Cloudflare NS
- [ ] DNS 已激活（通常 5-30 分钟）
- [ ] 前端代码已部署
- [ ] 能访问 https://www.gij666.com
- [ ] 功能测试正常（登录、视频、购物等）

---

## 🚨 故障排查

### 访问显示 "ERR_TOO_MANY_REDIRECTS"

**原因：** SSL 模式配置不正确

**修复：**
1. Cloudflare → **SSL/TLS** → **概述**
2. 改为 **灵活** 模式
3. 刷新网页

### DNS 未生效

**检查方法：**
```bash
nslookup www.gij666.com
# 应该返回 Cloudflare IP (104.x.x.x 或 172.x.x.x)
```

**加速生效：**
- Windows: `ipconfig /flushdns`
- Mac: `sudo dscacheutil -flushcache`

### 网站无法访问

**检查 Nginx 状态：**
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**重启 Nginx：**
```bash
sudo systemctl restart nginx
```

---

## 📊 性能指标目标

使用 GTmetrix 测试：
- 首屏加载时间: < 2s
- Performance Score: > 85
- 全球平均延迟: < 300ms

---

## ✅ 完成标志

当你看到以下情况说明部署成功：

1. ✅ 访问 https://www.gij666.com 正常显示
2. ✅ 浏览器显示 🔒 安全标志
3. ✅ Cloudflare 控制台显示流量统计
4. ✅ 所有功能正常运行（登录、购物等）
5. ✅ Cloudflare Analytics 显示流量加速

---

## 🎉 恭喜！

你的网站现在具有：
- 全球 CDN 加速
- 企业级 DDoS 防护
- 免费 SSL 证书
- 自动化安全防护

**享受更快、更安全的网站体验！** 🚀
