# 项目备份信息

## 📦 备份详情

### 备份时间
**2025年12月26日 12:17:21**

### 备份原因
在实施**方案 A（完全迁移到宝塔面板 + 雷池 WAF）**之前创建完整备份

### 备份内容
包含整个 `guojing-frontend` 项目的所有文件：
- ✅ 所有源代码
- ✅ 配置文件
- ✅ node_modules
- ✅ Git 历史
- ✅ 文档文件

---

## 📂 备份文件位置

### 方式 1：压缩包备份
**文件路径**:
```
c:\Users\Administrator\Desktop\guojing-frontend-backup-20251226_121721.tar.gz
```

**文件大小**: 384 KB

**解压命令**:
```bash
# Windows 使用 Git Bash 或 WSL
tar -xzf guojing-frontend-backup-20251226_121721.tar.gz

# 解压到指定目录
tar -xzf guojing-frontend-backup-20251226_121721.tar.gz -C /path/to/restore/
```

### 方式 2：Git 标签备份
**标签名称**: `backup-before-waf-migration`

**查看备份**:
```bash
# 查看所有标签
git tag -l

# 查看标签详情
git show backup-before-waf-migration

# 恢复到备份版本
git checkout backup-before-waf-migration
```

**远程备份**: ✅ 已推送到 GitHub

---

## 🔄 恢复步骤

### 场景 1：需要恢复整个项目

#### 从压缩包恢复
```bash
cd c:\Users\Administrator\Desktop
# 删除当前项目（如果需要）
rm -rf guojing-frontend

# 解压备份
tar -xzf guojing-frontend-backup-20251226_121721.tar.gz

# 项目已恢复到 guojing-frontend 目录
```

#### 从 Git 标签恢复
```bash
cd c:\Users\Administrator\Desktop\guojing-frontend

# 创建新分支从备份恢复
git checkout -b restore-from-backup backup-before-waf-migration

# 或者直接重置到备份版本
git reset --hard backup-before-waf-migration
```

### 场景 2：需要恢复特定文件

```bash
# 从 Git 标签恢复单个文件
git checkout backup-before-waf-migration -- path/to/file

# 从压缩包恢复单个文件
tar -xzf guojing-frontend-backup-20251226_121721.tar.gz guojing-frontend/path/to/file
```

### 场景 3：回退到 Vercel 部署

1. 恢复代码后，推送到 GitHub：
   ```bash
   git checkout backup-before-waf-migration
   git branch -f main backup-before-waf-migration
   git push origin main --force
   ```

2. Vercel 会自动重新部署

---

## 📋 备份版本信息

### Git 提交信息
- **标签**: `backup-before-waf-migration`
- **分支**: `main`
- **最新提交**: `8639d9e` (修复视频 CORS 加载问题)

### 项目状态
- ✅ 视频播放器已添加 CORS 支持
- ✅ 错误处理已添加
- ✅ 项目部署在 Vercel
- ✅ 数据库使用 Supabase

---

## ⚠️ 重要提示

### 实施方案 A 前检查清单

- [x] ✅ 项目已备份（压缩包 + Git 标签）
- [ ] **域名已备案**（方案 A 必需）
- [ ] **国内服务器**已准备
- [ ] 确认可以修改域名 DNS 解析

### 如果需要重新备份

```bash
# 创建新的压缩包备份
cd c:\Users\Administrator\Desktop
tar -czf "guojing-frontend-backup-$(date +%Y%m%d_%H%M%S).tar.gz" "guojing-frontend"

# 创建新的 Git 标签
cd guojing-frontend
git tag -a "backup-$(date +%Y%m%d)" -m "手动备份"
git push origin --tags
```

---

## 🆘 紧急恢复

如果方案 A 实施过程中出现问题，需要立即回退：

### 快速回退步骤（5 分钟内完成）

1. **恢复 DNS 解析**
   - 登录域名注册商
   - 删除指向国内服务器的 A 记录
   - 添加 CNAME 记录指向 Vercel：
     - 主机记录: `www`
     - 记录值: `cname.vercel-dns.com`

2. **确认 Vercel 部署**
   - 访问 Vercel Dashboard
   - 检查项目是否正常部署
   - 等待 DNS 生效（10-30 分钟）

3. **验证网站恢复**
   - 访问 https://www.gij666.com
   - 确认所有功能正常

---

## 📞 支持

如果遇到问题：
- 查看 GitHub 项目: https://github.com/qeenydorin-creator/guojing-frontend
- 查看 Git 标签: `backup-before-waf-migration`

---

**备份完成时间**: 2025-12-26 12:17:21
**备份负责人**: Claude Code Assistant
