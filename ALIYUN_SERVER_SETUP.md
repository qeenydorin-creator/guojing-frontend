# 阿里云服务器反向代理配置指南

## 概述

使用阿里云服务器作为反向代理,为国内用户加速访问 Vercel 部署的网站。

**优势:**
- 国内用户直连阿里云服务器(速度快)
- 自动缓存静态资源
- 支持 HTTPS
- 完全免费(只需服务器费用)

---

## 第一步:准备服务器信息

### 1. 登录阿里云控制台

访问:https://ecs.console.aliyun.com/

### 2. 记录服务器信息

你需要以下信息:
- **公网 IP**:例如 `123.56.78.90`
- **操作系统**:推荐 Ubuntu 20.04 或 CentOS 7+
- **登录密码**:创建服务器时设置的密码

---

## 第二步:连接到服务器

### Windows 用户

**方法 1:使用 PowerShell(推荐)**

```powershell
# 打开 PowerShell
# 输入以下命令(替换 IP 地址为你的服务器 IP)
ssh root@你的服务器IP

# 例如:
ssh root@123.56.78.90

# 输入密码(输入时不会显示,直接输入后按回车)
```

**方法 2:使用阿里云网页控制台**

1. 在 ECS 控制台找到你的服务器
2. 点击右侧的 **"远程连接"**
3. 选择 **"通过 Workbench 远程连接"**
4. 输入用户名 `root` 和密码

---

## 第三步:安装 Nginx

连接到服务器后,执行以下命令:

### Ubuntu/Debian 系统

```bash
# 更新软件包列表
sudo apt update

# 安装 Nginx
sudo apt install nginx -y

# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx
```

### CentOS/AlmaLinux 系统

```bash
# 安装 Nginx
sudo yum install nginx -y

# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx
```

**验证安装:**

在浏览器访问:`http://你的服务器IP`

应该能看到 Nginx 的欢迎页面。

---

## 第四步:配置反向代理

### 1. 创建配置文件

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/guojing
```

如果 `nano` 命令不存在,先安装:
```bash
# Ubuntu/Debian
sudo apt install nano -y

# CentOS
sudo yum install nano -y
```

### 2. 粘贴以下配置

**复制以下内容到配置文件中:**

```nginx
# 缓存路径配置
proxy_cache_path /var/cache/nginx/guojing levels=1:2 keys_zone=guojing_cache:10m max_size=1g inactive=60m use_temp_path=off;

server {
    listen 80;
    server_name gjjk666.com www.gjjk666.com;

    # 日志文件
    access_log /var/log/nginx/guojing_access.log;
    error_log /var/log/nginx/guojing_error.log;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    location / {
        # 反向代理到 Vercel
        proxy_pass https://guojing-frontend.vercel.app;

        # 保留原始请求头
        proxy_set_header Host guojing-frontend.vercel.app;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 缓存配置
        proxy_cache guojing_cache;
        proxy_cache_valid 200 60m;
        proxy_cache_valid 404 10m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;
        proxy_cache_lock on;

        # 添加缓存状态头(便于调试)
        add_header X-Cache-Status $upstream_cache_status;

        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 静态资源特殊缓存(更长时间)
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass https://guojing-frontend.vercel.app;
        proxy_set_header Host guojing-frontend.vercel.app;

        proxy_cache guojing_cache;
        proxy_cache_valid 200 7d;
        add_header X-Cache-Status $upstream_cache_status;

        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

**保存文件:**
- 按 `Ctrl + O` (保存)
- 按 `Enter` (确认)
- 按 `Ctrl + X` (退出)

### 3. 启用配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/guojing /etc/nginx/sites-enabled/

# 创建缓存目录
sudo mkdir -p /var/cache/nginx/guojing

# 测试配置是否正确
sudo nginx -t

# 如果显示 "syntax is ok" 和 "test is successful",则重启 Nginx
sudo systemctl reload nginx
```

---

## 第五步:配置防火墙

### 检查防火墙状态

```bash
# 检查防火墙
sudo ufw status
```

### 开放端口

```bash
# 开放 HTTP(80)
sudo ufw allow 80/tcp

# 开放 HTTPS(443) - 后面配置 SSL 会用到
sudo ufw allow 443/tcp

# 开放 SSH(22) - 确保不会断开连接
sudo ufw allow 22/tcp

# 启用防火墙(如果未启用)
sudo ufw enable

# 检查状态
sudo ufw status
```

### 阿里云安全组配置

**重要:需要在阿里云控制台配置!**

1. 登录 ECS 控制台:https://ecs.console.aliyun.com/
2. 找到你的服务器
3. 点击 **"安全组"** → **"配置规则"**
4. 点击 **"添加安全组规则"**

**添加以下规则:**

| 协议类型 | 端口范围 | 授权对象 | 描述 |
|---------|---------|---------|------|
| TCP | 80/80 | 0.0.0.0/0 | HTTP |
| TCP | 443/443 | 0.0.0.0/0 | HTTPS |
| TCP | 22/22 | 0.0.0.0/0 | SSH |

---

## 第六步:修改域名 DNS

### 在阿里云域名管理中

1. 访问:https://dc.console.aliyun.com/
2. 找到 **gjjk666.com**
3. 点击 **"解析"**

### 修改 DNS 记录

**删除或暂停之前的记录:**
- 删除指向 Vercel 的 A 记录
- 删除指向 Vercel 的 CNAME 记录

**添加新的 A 记录:**

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | @ | 你的服务器IP | 10分钟 |
| A | www | 你的服务器IP | 10分钟 |

**例如:**
- 记录类型:A
- 主机记录:@
- 记录值:`123.56.78.90` (替换为你的服务器 IP)
- TTL:10分钟

---

## 第七步:配置 SSL 证书(HTTPS)

### 安装 Certbot

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS
sudo yum install certbot python3-certbot-nginx -y
```

### 自动获取 SSL 证书

```bash
# 使用 Certbot 自动配置
sudo certbot --nginx -d gjjk666.com -d www.gjjk666.com

# 按照提示操作:
# 1. 输入邮箱地址
# 2. 同意服务条款 (输入 Y)
# 3. 选择是否接收邮件 (输入 N 或 Y)
# 4. 选择是否重定向 HTTP 到 HTTPS (输入 2 - 推荐)
```

### 设置自动续期

```bash
# 测试自动续期
sudo certbot renew --dry-run

# 如果测试成功,证书会在到期前自动续期
```

---

## 第八步:验证配置

### 1. 检查 DNS 是否生效

访问:https://dnschecker.org/

输入:`gjjk666.com`

选择记录类型:A

应该显示你的服务器 IP。

### 2. 访问网站

等待 DNS 生效(5-30 分钟)后:

**HTTP 访问:**
```
http://gjjk666.com
```

**HTTPS 访问:**
```
https://gjjk666.com
```

### 3. 检查缓存是否工作

```bash
# 查看 Nginx 访问日志
sudo tail -f /var/log/nginx/guojing_access.log

# 在浏览器访问网站,查看日志输出
```

在浏览器开发者工具(F12)中:
- 打开 Network 标签
- 刷新页面
- 查看响应头中的 `X-Cache-Status`
  - `MISS`:第一次访问,未命中缓存
  - `HIT`:命中缓存
  - `BYPASS`:跳过缓存

---

## 第九步:性能优化

### 1. 查看缓存状态

```bash
# 查看缓存目录大小
sudo du -sh /var/cache/nginx/guojing

# 查看缓存文件数量
sudo find /var/cache/nginx/guojing -type f | wc -l
```

### 2. 清除缓存(如需要)

```bash
# 清除所有缓存
sudo rm -rf /var/cache/nginx/guojing/*

# 重启 Nginx
sudo systemctl reload nginx
```

### 3. 调整缓存大小

如果需要增加缓存空间,编辑配置:

```bash
sudo nano /etc/nginx/sites-available/guojing
```

修改第一行:
```nginx
# 将 max_size=1g 改为 max_size=5g(5GB)
proxy_cache_path /var/cache/nginx/guojing levels=1:2 keys_zone=guojing_cache:10m max_size=5g inactive=60m use_temp_path=off;
```

保存后重启:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 故障排查

### 问题 1:访问显示 502 Bad Gateway

**原因:**服务器无法连接到 Vercel

**解决:**

```bash
# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/guojing_error.log

# 测试是否能访问 Vercel
curl -I https://guojing-frontend.vercel.app

# 如果能访问,重启 Nginx
sudo systemctl restart nginx
```

### 问题 2:访问显示 Nginx 欢迎页

**原因:**配置未生效

**解决:**

```bash
# 检查配置是否启用
ls -l /etc/nginx/sites-enabled/

# 应该看到 guojing 链接

# 如果没有,重新创建链接
sudo ln -s /etc/nginx/sites-available/guojing /etc/nginx/sites-enabled/

# 重启 Nginx
sudo systemctl restart nginx
```

### 问题 3:HTTPS 无法访问

**原因:**SSL 证书未配置

**解决:**

```bash
# 重新运行 Certbot
sudo certbot --nginx -d gjjk666.com -d www.gjjk666.com

# 检查证书状态
sudo certbot certificates
```

### 问题 4:速度仍然很慢

**原因:**缓存未生效或带宽不足

**解决:**

```bash
# 检查缓存状态头
curl -I https://gjjk666.com

# 查看 X-Cache-Status 应该显示 HIT

# 如果显示 MISS,检查配置
sudo nginx -t

# 检查服务器带宽
# 在阿里云控制台查看服务器带宽配置
# 建议至少 5Mbps
```

---

## 性能对比

配置完成后,你应该看到:

| 指标 | 优化前(直连 Vercel) | 优化后(阿里云代理) |
|------|-------------------|------------------|
| 国内首次加载 | 5-10秒 | 1-2秒 |
| 国内二次加载 | 3-5秒 | 0.5-1秒 |
| TTFB | 2000-3000ms | 200-500ms |
| 资源加载 | 慢 | 快 |

---

## 维护建议

### 定期检查

```bash
# 每周检查一次日志
sudo tail -n 100 /var/log/nginx/guojing_access.log
sudo tail -n 100 /var/log/nginx/guojing_error.log

# 检查磁盘空间
df -h

# 检查缓存大小
sudo du -sh /var/cache/nginx/guojing
```

### 自动化脚本

创建一个监控脚本:

```bash
# 创建脚本
sudo nano /root/check_nginx.sh
```

粘贴以下内容:

```bash
#!/bin/bash

echo "=== Nginx 状态检查 ==="
echo ""

echo "1. Nginx 运行状态:"
systemctl status nginx | grep Active

echo ""
echo "2. 缓存目录大小:"
du -sh /var/cache/nginx/guojing

echo ""
echo "3. 最近的错误(如有):"
tail -n 10 /var/log/nginx/guojing_error.log

echo ""
echo "4. 磁盘使用情况:"
df -h | grep -E '(Filesystem|/$)'

echo ""
echo "检查完成!"
```

赋予执行权限:

```bash
chmod +x /root/check_nginx.sh
```

运行检查:

```bash
/root/check_nginx.sh
```

---

## 总结

完成以上步骤后:

- ✅ 阿里云服务器作为反向代理
- ✅ 自动缓存静态资源
- ✅ HTTPS 加密访问
- ✅ 国内访问速度提升 70-80%
- ✅ 自动 SSL 证书续期

**恭喜!你已经成功配置了高性能的国内加速方案!** 🎉

---

## 需要帮助?

如果在配置过程中遇到问题:

1. 检查服务器是否能访问外网
2. 检查阿里云安全组配置
3. 查看 Nginx 错误日志
4. 确认 DNS 已生效

可以随时截图给我,我会帮你排查!
