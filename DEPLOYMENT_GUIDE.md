# 前端项目部署指南

## 📦 项目位置
```
C:\Users\Administrator\Desktop\guojing-frontend
```

## 🚀 上传到 GitHub 步骤

### 方法 1: 使用 GitHub Web 界面（最简单）

1. **访问 GitHub**
   - 打开 https://github.com/rthrthrth
   - 点击右上角 "+" → "New repository"

2. **创建仓库**
   - Repository name: `guojing-frontend`
   - Description: `国精集团 - 东方本草养生瑰宝 电商前端 | React 19 + TypeScript + Vite`
   - Visibility: Public
   - 点击 "Create repository"

3. **获取仓库 URL**
   - 复制仓库 URL，例如：`https://github.com/rthrthrth/guojing-frontend.git`

4. **在本地项目中添加远程仓库**
   ```bash
   cd "C:\Users\Administrator\Desktop\guojing-frontend"
   git remote add origin https://github.com/rthrthrth/guojing-frontend.git
   git branch -M main
   git push -u origin main
   ```

5. **认证**
   - 当提示输入凭证时，使用你的 GitHub 用户名和 Personal Access Token

### 方法 2: 使用 GitHub CLI（需要先安装）

```bash
# 如果未安装 GitHub CLI，先安装
# Windows: 使用 Chocolatey 或从 https://cli.github.com 下载

gh auth login
# 按照提示完成认证

cd "C:\Users\Administrator\Desktop\guojing-frontend"

gh repo create guojing-frontend \
  --description "国精集团 - 东方本草养生瑰宝 电商前端" \
  --public \
  --source=. \
  --remote=origin \
  --push
```

### 方法 3: 使用 Git 命令（完全手动）

```bash
cd "C:\Users\Administrator\Desktop\guojing-frontend"

# 添加远程仓库
git remote add origin https://github.com/rthrthrth/guojing-frontend.git

# 验证远程仓库
git remote -v

# 重命名分支为 main（如果需要）
git branch -M main

# 推送代码到 GitHub
git push -u origin main

# 如果出现认证错误，可能需要使用 Personal Access Token
# 使用此格式: https://<USERNAME>:<TOKEN>@github.com/<USERNAME>/guojing-frontend.git
git remote set-url origin https://rthrthrth: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@github.com/rthrthrth/guojing-frontend.git
git push -u origin main
```

## 📋 仓库配置检查清单

创建完仓库后，请检查以下内容：

- [ ] 仓库名称：`guojing-frontend`
- [ ] 仓库描述：中英文并存，说明这是国精集团的电商前端
- [ ] Visibility：Public（公开）
- [ ] README.md 已显示
- [ ] package.json 内容正确
- [ ] .env.example 已包含（不包含实际 Token）
- [ ] .gitignore 已应用（node_modules 等不会被上传）

## 🔐 敏感信息安全

**重要**: 项目中的 `.env.example` 文件不包含实际的 Supabase 凭证。

实际部署时：
1. 创建 `.env.local` 文件（本地）
2. 添加你的真实 Supabase 凭证
3. 确保 `.gitignore` 包含 `.env.local`（防止上传）

```
# .env.local（本地使用，不上传）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_key_here
```

## 🌐 部署到生产环境

### Vercel 部署（推荐）

1. **连接 GitHub**
   - 访问 https://vercel.com
   - 点击 "Import Project"
   - 选择 GitHub 账户授权
   - 搜索并选择 `guojing-frontend` 仓库

2. **配置构建**
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **设置环境变量**
   ```
   VITE_SUPABASE_URL: https://zzxkoyzhbdoefsttitop.supabase.co
   VITE_SUPABASE_ANON_KEY: sb_publishable_zw_Pmf4SLA_TzNKZ5VDK_w_kahNQlg9
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成
   - 获得部署 URL

### Netlify 部署

1. **连接 GitHub**
   - 访问 https://netlify.com
   - 点击 "New site from Git"
   - 选择 GitHub，授权并选择仓库

2. **配置**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **环境变量**
   - 在 Site settings → Build & deploy → Environment 中添加：
     ```
     VITE_SUPABASE_URL
     VITE_SUPABASE_ANON_KEY
     ```

4. **部署**
   - Netlify 会自动部署

### Docker 部署

```bash
# 在项目根目录创建 Dockerfile
cd "C:\Users\Administrator\Desktop\guojing-frontend"

# 构建 Docker 镜像
docker build -t guojing-frontend:latest .

# 运行容器
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=https://zzxkoyzhbdoefsttitop.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=sb_publishable_zw_Pmf4SLA_TzNKZ5VDK_w_kahNQlg9 \
  guojing-frontend:latest
```

### 传统 Web 服务器部署

1. **本地构建**
   ```bash
   cd "C:\Users\Administrator\Desktop\guojing-frontend"
   npm install
   npm run build
   ```

2. **上传文件**
   - 将 `dist` 文件夹中的所有文件上传到服务器

3. **配置服务器**
   - 设置根路径指向 `dist` 文件夹
   - 配置 SPA 路由（所有请求重定向到 `index.html`）

   **Nginx 配置例子：**
   ```nginx
   server {
       listen 80;
       server_name guojing-group.com;
       root /var/www/guojing-frontend/dist;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

   **Apache 配置例子（.htaccess）：**
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </IfModule>
   ```

## 📊 项目信息

| 项目 | 值 |
|------|-----|
| 仓库名 | guojing-frontend |
| 所有者 | rthrthrth |
| 类型 | Public |
| 语言 | TypeScript |
| 框架 | React 19 + Vite |
| 样式 | Tailwind CSS |
| 后端 | Supabase |
| Node 版本 | >= 18 |

## 📞 问题排查

### Git Push 认证失败

```bash
# 清除缓存的凭证
git credential reject
host=github.com
protocol=https

# 重新输入凭证（使用 Personal Access Token）
git push -u origin main
```

### npm install 失败

```bash
# 清除缓存
npm cache clean --force

# 重新安装
npm install
```

### 构建失败

```bash
# 检查 Node 版本
node --version  # 应该 >= 18

# 清除依赖并重新安装
rm -r node_modules
rm package-lock.json
npm install

# 重新构建
npm run build
```

## 🎯 下一步

1. ✅ 上传代码到 GitHub
2. ✅ 配置部署平台（Vercel / Netlify）
3. ✅ 设置生产环境变量
4. ✅ 测试部署链接
5. ✅ 配置自定义域名（可选）

## 📝 有用的链接

- [GitHub 文档](https://docs.github.com)
- [Vercel 部署指南](https://vercel.com/docs)
- [Netlify 部署指南](https://docs.netlify.com)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Supabase 文档](https://supabase.com/docs)

---

**需要帮助？** 查看 README.md 文件获取更多信息。
