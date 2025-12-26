# 宝塔面板 + 雷池 WAF 迁移执行清单

## ✅ 前置准备（已完成）
- [x] 项目已备份（压缩包 + Git 标签）
- [x] 域名已备案
- [x] 国内服务器已准备
- [x] 域名 DNS 访问权限已确认

---

## 🚀 实施步骤

### 第 1 步：安装宝塔面板（10-15 分钟）

**操作位置**: 您的国内服务器终端（SSH）

#### 1.1 选择适合的安装命令

**如果是 CentOS 系统**：
```bash
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh
```

**如果是 Ubuntu/Debian 系统**：
```bash
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

#### 1.2 安装完成后记录信息
安装完成会显示：
```
==================================================================
Congratulations! Installed successfully!
==================================================================
外网面板地址: http://您的服务器IP:8888/xxxx
内网面板地址: http://内网IP:8888/xxxx
username: xxxxxxxx
password: xxxxxxxx
==================================================================
```

**⚠️ 重要**：请保存上述信息，特别是**外网面板地址、用户名和密码**

#### 1.3 开放防火墙端口
在服务器安全组中开放以下端口：
- `8888` - 宝塔面板
- `80` - HTTP
- `443` - HTTPS
- `9443` - 雷池 WAF

---

### 第 2 步：登录宝塔面板并安装环境（15-20 分钟）

**操作位置**: 宝塔面板 Web 界面

#### 2.1 登录宝塔面板
1. 访问：`http://您的服务器IP:8888/xxxx`
2. 输入安装时提供的用户名和密码
3. 首次登录会提示安装 LNMP 或 LAMP

#### 2.2 安装必要软件
在宝塔面板 → **软件商店** 中安装：

1. **Nginx** (推荐版本 1.22+)
   - 点击安装，选择**编译安装**
   - 等待安装完成（5-10 分钟）

2. **Node.js** (推荐版本 18.x 或 20.x)
   - 在软件商店搜索 "Node.js"
   - 安装版本管理器
   - 安装 Node.js 18.x

3. **PM2** (Node.js 进程管理)
   - Node.js 安装后可在设置中安装 PM2

#### 2.3 （可选）安装其他软件
- **MySQL** - 如果想用本地数据库（推荐继续使用 Supabase）
- **phpMyAdmin** - 数据库管理工具

---

### 第 3 步：在宝塔中部署前端项目（10-15 分钟）

#### 方法 A：使用 Git 拉取（推荐）

**操作位置**: 宝塔面板 → 网站

1. **添加站点**
   - 点击左侧菜单 **网站**
   - 点击 **添加站点**
   - 填写信息：
     - **域名**: `www.gij666.com`
     - **根目录**: `/www/wwwroot/www.gij666.com`
     - **FTP**: 不创建
     - **数据库**: 不创建
     - **PHP版本**: 纯静态
   - 点击提交

2. **打开网站终端**
   - 在网站列表中找到刚创建的站点
   - 点击 **根目录** 进入文件管理
   - 点击顶部 **终端** 按钮

3. **拉取代码并构建**
   在终端中执行：
   ```bash
   # 确认在正确的目录
   pwd
   # 应该显示：/www/wwwroot/www.gij666.com

   # 删除默认文件
   rm -rf index.html 404.html

   # 拉取 GitHub 仓库
   git clone https://github.com/qeenydorin-creator/guojing-frontend.git .

   # 安装依赖
   npm install

   # 构建生产版本
   npm run build

   # 验证构建文件
   ls -la dist/
   ```

4. **配置 Nginx**
   - 在网站列表中，点击 **设置**
   - 选择 **配置文件** 标签
   - 在 `server {}` 块内添加以下配置：
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
   - 点击保存

5. **设置网站目录为 dist**
   - 在网站设置中，点击 **网站目录**
   - 将运行目录修改为 `/dist`
   - 点击保存

6. **测试访问**
   - 在浏览器访问：`http://您的服务器IP`
   - 应该能看到您的网站

#### 方法 B：手动上传（备选）

**如果 Git 拉取失败，可以使用这个方法**：

1. **在本地构建**
   ```bash
   cd C:\Users\Administrator\Desktop\guojing-frontend
   npm run build
   ```

2. **压缩 dist 文件夹**
   - 将 `dist` 文件夹压缩为 `dist.zip`

3. **上传到宝塔**
   - 在宝塔文件管理中，进入 `/www/wwwroot/www.gij666.com`
   - 删除默认文件
   - 点击 **上传** 按钮
   - 上传 `dist.zip`

4. **解压**
   - 右键点击 `dist.zip`
   - 选择 **解压**
   - 将文件移动到根目录

---

### 第 4 步：安装雷池 WAF（10-15 分钟）

**操作位置**: 服务器终端（SSH）

#### 4.1 安装 Docker
```bash
# 安装 Docker
curl -sSL https://get.docker.com/ | sh

# 启动 Docker 服务
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
```

#### 4.2 安装雷池 WAF
```bash
# 拉取雷池 WAF 镜像
docker pull chaitin/safeline:latest

# 创建配置目录
mkdir -p /data/safeline

# 运行雷池 WAF
docker run -d \
  --name safeline \
  --restart always \
  -p 9443:9443 \
  -v /data/safeline:/data \
  chaitin/safeline:latest

# 查看容器状态
docker ps | grep safeline
```

#### 4.3 访问雷池 WAF 管理界面
1. 在浏览器访问：`https://您的服务器IP:9443`
2. 首次访问会提示设置管理员密码
3. 设置密码后登录管理界面

---

### 第 5 步：配置雷池 WAF（5-10 分钟）

**操作位置**: 雷池 WAF 管理界面

#### 5.1 添加站点
1. 点击左侧菜单 **站点**
2. 点击 **添加站点**
3. 填写信息：
   - **域名**: `www.gij666.com`
   - **后端地址**: `http://127.0.0.1:80`
   - **协议**: HTTP
   - **端口**: 80
4. 点击提交

#### 5.2 配置防护规则
1. 进入站点配置
2. 在 **防护规则** 中开启：
   - ✅ SQL 注入防护
   - ✅ XSS 攻击防护
   - ✅ CC 攻击防护（建议阈值：100次/分钟）
   - ✅ 恶意爬虫防护
   - ✅ 敏感信息泄露防护
3. 点击保存

#### 5.3 配置 SSL（可选但推荐）
1. 在站点设置中点击 **SSL**
2. 选择 **自动证书** 或手动上传证书
3. 开启 **强制 HTTPS**

---

### 第 6 步：修改域名 DNS 解析（5 分钟）

**操作位置**: 您的域名注册商（阿里云/腾讯云等）

#### 6.1 准备工作
- 查看您服务器的公网 IP 地址
- 登录域名注册商控制台

#### 6.2 修改 DNS 记录

**删除旧的 Vercel 记录**：
- 删除所有 CNAME 记录（特别是指向 `cname.vercel-dns.com` 的）

**添加新的 A 记录**：

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| A | @ | 您的服务器IP | 600 |
| A | www | 您的服务器IP | 600 |

#### 6.3 验证 DNS 解析
在本地电脑执行：
```bash
# Windows
ping www.gij666.com

# 或使用 nslookup
nslookup www.gij666.com
```

应该返回您的服务器 IP 地址

---

### 第 7 步：配置 SSL 证书（5-10 分钟）

#### 方法 A：使用宝塔免费 SSL（推荐）

**操作位置**: 宝塔面板 → 网站设置

1. 进入网站设置
2. 点击 **SSL** 标签
3. 选择 **Let's Encrypt**
4. 勾选域名 `www.gij666.com`
5. 点击 **申请**
6. 等待证书颁发（1-2 分钟）
7. 开启 **强制 HTTPS**

#### 方法 B：使用雷池 WAF SSL

**操作位置**: 雷池 WAF 管理界面

1. 进入站点设置
2. 点击 **SSL**
3. 选择 **自动证书**
4. 开启 **强制 HTTPS**

---

### 第 8 步：测试网站访问（5 分钟）

#### 8.1 测试列表
- [ ] 访问 `https://www.gij666.com` 能正常打开
- [ ] 所有页面都能正常访问
- [ ] 视频播放功能正常
- [ ] Supabase 数据库连接正常
- [ ] 用户登录/注册功能正常
- [ ] 购物车功能正常

#### 8.2 检查浏览器控制台
按 F12 打开开发者工具，检查：
- **Console**: 无错误信息
- **Network**: 所有请求返回 200 状态码
- **Application**: LocalStorage 正常工作

---

## 🔄 回滚方案（如果出现问题）

### 快速回滚到 Vercel（5 分钟）

#### 步骤 1：恢复 DNS 解析
1. 登录域名注册商
2. 删除指向国内服务器的 A 记录
3. 添加 CNAME 记录：
   - 主机记录: `www`
   - 记录值: `cname.vercel-dns.com`
   - TTL: 600

#### 步骤 2：等待 DNS 生效
- 通常需要 10-30 分钟
- 可以使用 `ping www.gij666.com` 验证

#### 步骤 3：验证 Vercel 部署
- 访问 Vercel Dashboard
- 确认项目正常部署
- 访问 `https://www.gij666.com` 验证

---

## 📊 实施进度跟踪

| 步骤 | 任务 | 预计时间 | 实际时间 | 状态 |
|------|------|----------|----------|------|
| 1 | 安装宝塔面板 | 15 分钟 | - | ⏳ 待开始 |
| 2 | 安装环境软件 | 20 分钟 | - | ⏳ 待开始 |
| 3 | 部署前端项目 | 15 分钟 | - | ⏳ 待开始 |
| 4 | 安装雷池 WAF | 15 分钟 | - | ⏳ 待开始 |
| 5 | 配置 WAF 规则 | 10 分钟 | - | ⏳ 待开始 |
| 6 | 修改 DNS 解析 | 5 分钟 | - | ⏳ 待开始 |
| 7 | 配置 SSL 证书 | 10 分钟 | - | ⏳ 待开始 |
| 8 | 测试网站访问 | 5 分钟 | - | ��� 待开始 |

**总计预计时间**: 1.5 - 2 小时

---

## ❓ 常见问题排查

### 问题 1：无法访问宝塔面板
**检查**:
- [ ] 防火墙是否开放 8888 端口
- [ ] 云服务器安全组是否允许 8888 端口
- [ ] 宝塔面板服务是否启动：`bt status`

### 问题 2：网站无法访问
**检查**:
- [ ] Nginx 是否启动：`systemctl status nginx`
- [ ] 网站目录是否正确：`ls -la /www/wwwroot/www.gij666.com/dist`
- [ ] Nginx 配置是否正确：`nginx -t`

### 问题 3：雷池 WAF 无法访问
**检查**:
- [ ] Docker 是否运行：`docker ps`
- [ ] 防火墙是否开放 9443 端口
- [ ] 雷池容器是否启动：`docker logs safeline`

### 问题 4：DNS 解析不生效
**检查**:
- [ ] DNS 记录是否正确配置
- [ ] 等待足够时间（最多 48 小时）
- [ ] 使用 `nslookup` 或 `dig` 命令验证

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 [BACKUP_INFO.md](BACKUP_INFO.md) 了解如何恢复备份
2. 查看宝塔面板日志：`/www/wwwroot/panel/logs`
3. 查看 Nginx 日志：`/www/wwwlogs/`
4. 查看雷池 WAF 日志：`docker logs safeline`

---

**准备好后，请告诉我您从哪一步开始！我会提供详细的指导。**
