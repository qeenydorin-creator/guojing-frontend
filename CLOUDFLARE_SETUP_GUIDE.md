# Cloudflare CDN 配置完整指南

## 第一步：注册 Cloudflare 账号

### 1. 访问 Cloudflare 官网
打开：https://www.cloudflare.com/

### 2. 点击注册
- 在右上角找到 **"Sign Up"** 按钮
- 或直接访问：https://dash.cloudflare.com/sign-up

### 3. 选择邮箱或 Google 账号注册

---

## 第二步：添加你的域名

### 方法 1：从首页添加（推荐）

**如果你已登录到 Cloudflare 控制板：**

1. **在首页左侧菜单找到 "Websites"**
   - 如果看不到菜单，点击左上角的三条横线（☰）

2. **点击 "Add site"** 或 **"添加站点"**
   - 按钮通常在页面中间或右上角
   - 如果是英文，按钮写的是 "Add site"
   - 如果是中文，按钮写的是 "添加站点"

3. **输入你的域名**
   ```
   gjjk666.com
   ```
   （不要输入 http:// 或 www）

4. **点击 "继续" 或 "Continue"**

### 方法 2：从菜单添加

**如果你找不到首页的按钮：**

1. 登录 https://dash.cloudflare.com/
2. 左侧菜单找到 **"Websites"** 选项卡
3. 点击 **"+ Add site"** 按钮

---

## 第三步：选择付费计划

**重要：选择免费计划！**

1. 你会看到几个计划选项：
   - Free（免费）← 选择这个
   - Pro（专业）
   - Business（企业）

2. **点击 Free 计划下的 "Select Plan"**

3. **点击 "Confirm Plan"** 或 **"确认"**

---

## 第四步：修改 Nameserver（关键步骤）

Cloudflare 会给你两个 Nameserver 地址，例如：

```
ns1.cloudflare.com
ns2.cloudflare.com
```

**或者可能是：**

```
zoe.ns.cloudflare.com
henry.ns.cloudflare.com
```

### 在阿里云中修改 Nameserver

**步骤：**

1. **登录阿里云控制台**
   https://account.aliyun.com/login/login.htm

2. **进入域名管理**
   - 搜索 "域名"
   - 或直接访问：https://dc.console.aliyun.com/

3. **找到 gjjk666.com**
   - 点击 "管理"

4. **修改 DNS 服务器**
   - 找到 "DNS 服务器" 或 "修改 DNS"
   - 点击 "修改 DNS 服务器"

5. **删除现有的 DNS 服务器**
   - 删除阿里云默认的 DNS 服务器
   - 通常是：
     ```
     ns1.alidns.com
     ns2.alidns.com
     ```

6. **添加 Cloudflare 的 Nameserver**
   - 第一个 DNS：`ns1.cloudflare.com`
   - 第二个 DNS：`ns2.cloudflare.com`

   （或使用 Cloudflare 给你的具体地址）

7. **保存**

---

## 第五步：在 Cloudflare 中添加 DNS 记录

**等待 Nameserver 生效（通常 5-30 分钟）**

### 当 Cloudflare 显示 "Nameserver change pending" 时

1. **在 Cloudflare 控制板中**
2. **点击左侧菜单的 "DNS"**

3. **添加 DNS 记录**

#### 记录 1：根域名 A 记录（删除或修改）

- **Type（记录类型）**: A
- **Name（名称）**: @
- **IPv4 address（IPv4 地址）**: 留空或删除
- 点击 **"Remove"** 删除这条记录（因为我们用 CNAME 代替）

#### 记录 2：CNAME 记录（新增）

点击 **"+ Add record"** 添加新记录：

- **Type（记录类型）**: CNAME
- **Name（名称）**: @ （表示根域名）
- **Target（目标）**: `guojing-frontend.vercel.app`
- **Proxied（代理状态）**: **Proxied**（显示为橙色云朵 ☁️）
- **TTL**: Auto
- 点击 **"Save"**

#### 记录 3：www 子域（可选但推荐）

再点击 **"+ Add record"** 添加：

- **Type（记录类型）**: CNAME
- **Name（名称）**: www
- **Target（目标）**: `guojing-frontend.vercel.app`
- **Proxied（代理状态）**: **Proxied**（橙色云朵 ☁️）
- **TTL**: Auto
- 点击 **"Save"**

---

## 第六步：启用 Cloudflare 优化功能

### 在 Cloudflare 控制板中

1. **点击左侧菜单的 "Speed"**（加速）

2. **启用以下功能：**
   - ✅ Auto Minify（自动压缩）- 勾选 HTML、CSS、JavaScript
   - ✅ Brotli compression（Brotli 压缩）
   - ✅ Rocket Loader（优化 JavaScript 加载）

3. **点击左侧菜单的 "Caching"**（缓存）

4. **配置缓存规则：**
   - Caching level（缓存级别）: **Standard**
   - Browser TTL（浏览器 TTL）: **4 hours**

5. **点击左侧菜单的 "SSL/TLS"**

6. **设置 HTTPS：**
   - Encryption mode（加密模式）: **Full**

---

## 第七步：验证配置是否成功

### 方法 1：在浏览器中访问

访问：https://gjjk666.com

- 如果能打开你的网站 → ✅ 成功
- 如果显示错误 → ⏳ 还在生效中（等待 5-30 分钟）

### 方法 2：检查 DNS 状态

在 Cloudflare 控制板：
- 如果显示 "Nameserver update pending" → 还在生效中
- 如果消失了 → ✅ 已完成

### 方法 3：使用 DNS 检查工具

访问：https://dnschecker.org/

- 输入：gjjk666.com
- 选择记录类型：CNAME
- 应该显示：guojing-frontend.vercel.app

---

## 🎉 完成！

一旦 DNS 生效，你的网站将获得：

✅ **国内加速**：通过 Cloudflare 的全球 CDN
✅ **自动 HTTPS**：所有访问都是加密的
✅ **自动缓存**：静态文件被缓存
✅ **自动压缩**：内容被压缩变小
✅ **防护**：自动防护恶意流量

---

## ⚠️ 常见问题

### Q: 显示 "Nameserver change pending" 多久？
A: 通常 5-30 分钟。最长可能需要 24 小时。

### Q: 我看不到 Nameserver 修改的成功确认？
A: 这很正常。你可以在 Cloudflare 的 Overview 页面查看状态。

### Q: 修改后网站无法访问怎么办？
A:
1. 等待 DNS 生效（5-30 分钟）
2. 清除浏览器缓存（Ctrl+Shift+Delete）
3. 检查 DNS 记录是否正确（在 Cloudflare 的 DNS 页面查看）

### Q: 如何验证 DNS 是否已生效？
A: 打开 https://dnschecker.org/，输入 gjjk666.com，如果看到 `guojing-frontend.vercel.app` 则说明生效了。

### Q: 国内访问速度能提升多少？
A: 通常提升 30-50%。主要取决于你的源站（Vercel）和用户位置。

---

## 📞 需要帮助？

如果卡在某个步骤：

1. **截图你看到的页面**
2. **告诉我你在第几步卡住了**
3. **描述页面上的按钮位置**

我会帮你逐步解决！
