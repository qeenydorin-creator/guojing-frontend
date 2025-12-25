# Cloudflare Nameserver 配置指南

## 当前问题

你的 DNS 记录仍然在阿里云，Cloudflare 提示你需要改用 Cloudflare 的 Nameserver。

---

## 第一步：获取 Cloudflare Nameserver

### 在 Cloudflare 页面上找到 Nameserver

**页面底部** 有一个 **"Cloudflare 名称服务器"** 部分

你会看到类似：
```
ns1.cloudflare.com
ns2.cloudflare.com
```

或者：
```
zoe.ns.cloudflare.com
henry.ns.cloudflare.com
```

**重要：复制这两个地址！**

---

## 第二步：修改阿里云的 DNS 服务器

### 登录阿里云

1. 访问：https://account.aliyun.com/
2. 进入控制台

### 进入域名管理

1. 搜索 "域名" 或 "Domain"
2. 进入域名列表
3. 找到 **gjjk666.com**
4. 点击 **"管理"**

### 修改 DNS 服务器（关键！）

在域名管理页面的左侧菜单中：

1. 找到 **"DNS 服务器"** 或 **"修改 DNS"**
2. 点击进去

你会看到当前的 DNS：
```
ns1.alidns.com
ns2.alidns.com
```

3. **点击 "修改 DNS 服务器"**

4. **删除现有的 DNS：**
   - 删除 `ns1.alidns.com`
   - 删除 `ns2.alidns.com`

5. **添加 Cloudflare 的 DNS：**
   - 第一个：填入 `ns1.cloudflare.com`（或 Cloudflare 给你的第一个）
   - 第二个：填入 `ns2.cloudflare.com`（或 Cloudflare 给你的第二个）

6. **点击 "保存" 或 "确定"**

---

## 第三步：等待生效

Cloudflare 会显示 "Nameserver change pending"（正在等待）

**等待时间：5-30 分钟**

不要着急，DNS 需要时间传播。

---

## 第四步：在 Cloudflare 中删除旧记录并添加新记录

### 当 Nameserver 生效后（通常 10-30 分钟）

#### 删除不需要的记录

在 Cloudflare DNS 管理页面中，删除：
- ❌ A 记录：`216.198.79.1`（点击右侧的 "编辑" → 删除）
- ❌ CNAME：`www` → `2d1d737e8e19e535.vercel-dns-017.com`（点击删除）
- ❌ TXT：`_vercel` 开头的记录（可以删除）

**保留的：**
- ✅ NS 记录（仅DNS用户）- 这是必要的
- ✅ TXT：`_dnsauth` 开头的（这是阿里云的记录）

#### 添加新的 CNAME 记录

点击 **"+ 添加记录"**

**记录 1：根域名**
```
类型：CNAME
名称：@
目标：guojing-frontend.vercel.app
代理状态：代理（橙色云朵）☁️
TTL：自动
```

点击 **"保存"**

**记录 2：www 子域**

再点击 **"+ 添加记录"**

```
类型：CNAME
名称：www
目标：guojing-frontend.vercel.app
代理状态：代理（橙色云朵）☁️
TTL：自动
```

点击 **"保存"**

---

## 第五步：验证

### 等待 5-10 分钟后

**在浏览器中访问：**
```
https://gjjk666.com
```

**期望结果：**
- ✅ 能看到你的网站 → 成功！
- ⏳ 显示错误 → 再等 5-10 分钟，DNS 还在传播
- ❌ SSL 错误 → Cloudflare 正在申请证书，再等几分钟

### 在 Cloudflare 中验证

1. 回到 Cloudflare 控制面板
2. gjjk666.com 的状态应该显示 **"Active"**（已激活）
3. 不再显示 "Nameserver change pending"

---

## 常见问题

### Q: 我改了 Nameserver 后，网站访问不了，怎么办？

A: **这是正常的！** DNS 需要时间传播。等待 5-30 分钟。

### Q: 需要等多久？

A:
- 通常：5-10 分钟
- 最多：30 分钟
- 极少情况：1-2 小时

### Q: 如何确认 Nameserver 已改好？

A:
1. 在 Cloudflare 页面，看 gjjk666.com 状态是否是 "Active"
2. 或者访问：https://dnschecker.org/
   - 输入：gjjk666.com
   - 选择记录类型：NS
   - 应该显示 Cloudflare 的 Nameserver

### Q: 为什么还是显示旧的 DNS？

A: DNS 缓存问题。可以：
1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 用无痕模式访问
3. 等待更长时间

### Q: 代理状态应该选什么？

A: **必须是"代理"（橙色云朵 ☁️）才能加速**
- 代理 = Cloudflare 帮你加速（推荐）
- 仅 DNS = 只做 DNS 解析，不加速

---

## 最终应该有的 DNS 记录

| 类型 | 名称 | 内容 | 代理 | 说明 |
|-----|------|------|------|------|
| CNAME | @ | guojing-frontend.vercel.app | ☁️ 代理 | 新增 |
| CNAME | www | guojing-frontend.vercel.app | ☁️ 代理 | 新增 |
| NS | gjjk666.com | vip4.alidns.com 等 | 仅DNS | 保留 |
| TXT | _dnsauth | ... | 仅DNS | 保留 |

---

## 步骤总结

1. ✅ 复制 Cloudflare 的两个 Nameserver
2. ✅ 登录阿里云
3. ✅ 删除阿里云的 DNS 服务器（ns1.alidns.com、ns2.alidns.com）
4. ✅ 添加 Cloudflare 的 DNS 服务器
5. ✅ 等待 5-30 分钟
6. ✅ 在 Cloudflare 删除旧记录
7. ✅ 在 Cloudflare 添加新的 CNAME 记录
8. ✅ 等待生效，访问 gjjk666.com 验证

---

## 现在就开始！

**第一步：复制 Cloudflare 的 Nameserver**

在你当前的 Cloudflare 页面底部找到 **"Cloudflare 名称服务器"** 部分，复制两个地址。

**完成后告诉我！**
