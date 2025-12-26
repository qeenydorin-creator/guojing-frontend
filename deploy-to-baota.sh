#!/bin/bash

# 宝塔面板一键部署脚本
# 在服务器的宝塔终端中运行此脚本

echo "========================================="
echo "国精集团前端项目 - 宝塔部署脚本"
echo "========================================="

# 设置变量
SITE_ROOT="/www/wwwroot/www.gij666.com"
REPO_URL="https://github.com/qeenydorin-creator/guojing-frontend.git"

# 第 1 步：创建网站根目录
echo ""
echo "[1/6] 创建网站根目录..."
mkdir -p "$SITE_ROOT"
cd "$SITE_ROOT" || exit 1
echo "✓ 目录已创建: $SITE_ROOT"

# 第 2 步：清理旧文件
echo ""
echo "[2/6] 清理旧文件..."
rm -rf ./*
echo "✓ 旧文件已清理"

# 第 3 步：拉取 Git 仓库
echo ""
echo "[3/6] 从 GitHub 拉取代码..."
git clone "$REPO_URL" . || {
    echo "✗ Git 拉取失败！"
    echo "请手动上传 dist-final.tar.gz 文件"
    exit 1
}
echo "✓ 代码已拉取"

# 第 4 步：安装依赖
echo ""
echo "[4/6] 安装 npm 依赖..."
npm install || {
    echo "✗ npm install 失败！"
    exit 1
}
echo "✓ 依赖已安装"

# 第 5 步：构建项目
echo ""
echo "[5/6] 构建生产版本..."
npm run build || {
    echo "✗ 构建失败！"
    exit 1
}
echo "✓ 构建完成"

# 第 6 步：部署文件
echo ""
echo "[6/6] 部署文件到网站根目录..."
mv dist/* .
rm -rf dist
echo "✓ 文件已部署"

# 验证
echo ""
echo "========================================="
echo "部署完成！文件列表："
echo "========================================="
ls -lh

echo ""
echo "验证文件："
if [ -f "index.html" ]; then
    echo "✓ index.html 存在"
else
    echo "✗ index.html 不存在！"
    exit 1
fi

if [ -d "assets" ]; then
    echo "✓ assets 文件夹存在"
else
    echo "✗ assets 文件夹不存在！"
    exit 1
fi

echo ""
echo "========================================="
echo "✓ 部署成功！"
echo "========================================="
echo ""
echo "下一步："
echo "1. 访问 http://123.57.58.46 测试网站"
echo "2. 配置 Nginx（如果需要）"
echo "3. 安装 SSL 证书"
echo ""
