#!/bin/bash

# 清理并设置测试环境脚本
# 在宝塔终端中执行此脚本

echo "========================================="
echo "国精集团混合架构 - 测试环境设置"
echo "========================================="

# 设置变量
SITE_ROOT="/www/wwwroot/www.gij666.com"

# 第 1 步：清理目录
echo ""
echo "[1/3] 清理网站目录..."
rm -rf "$SITE_ROOT"/*
echo "✓ 目录已清理"

# 第 2 步：创建测试页面
echo ""
echo "[2/3] 创建测试页面..."
cat > "$SITE_ROOT/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>国精集团 - 测试环境</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
        }

        .container {
            text-align: center;
            padding: 60px 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .subtitle {
            font-size: 1.1em;
            margin-bottom: 30px;
            opacity: 0.9;
        }

        .status {
            color: #4ade80;
            font-weight: bold;
            font-size: 1.1em;
            margin-bottom: 30px;
            padding: 15px;
            background: rgba(74, 222, 128, 0.2);
            border-left: 4px solid #4ade80;
            border-radius: 5px;
        }

        .info {
            background: rgba(255, 255, 255, 0.15);
            padding: 25px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
        }

        .info-item {
            margin: 12px 0;
            font-size: 1em;
            line-height: 1.6;
        }

        .info-label {
            font-weight: 600;
            color: #fbbf24;
        }

        .links {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .link-btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 8px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.4);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s ease;
            font-size: 0.95em;
        }

        .link-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.6);
            transform: translateY(-2px);
        }

        .footer {
            margin-top: 30px;
            font-size: 0.85em;
            opacity: 0.7;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .warning {
            color: #fbbf24;
            font-size: 0.9em;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 国精集团</h1>
        <p class="subtitle">测试环境</p>

        <div class="status">
            ✅ 服务器运行正常
        </div>

        <div class="info">
            <div class="info-item">
                <span class="info-label">📍 服务器IP：</span>
                123.57.58.46
            </div>
            <div class="info-item">
                <span class="info-label">🛠️ 环境：</span>
                宝塔面板 + Nginx + Node.js
            </div>
            <div class="info-item">
                <span class="info-label">🎯 用途：</span>
                测试、备份、开发环境
            </div>
            <div class="info-item">
                <span class="info-label">📊 状态：</span>
                混合架构部署（保留 Vercel + 国内备份）
            </div>
        </div>

        <div class="links">
            <p style="margin-bottom: 15px; font-size: 0.95em;">快速链接：</p>
            <a href="https://www.gij666.com" class="link-btn">📱 访问主站（Vercel）</a>
            <a href="http://123.57.58.46:15147" class="link-btn">🛠️ 宝塔面板</a>
        </div>

        <div class="warning">
            ⚠️ 此环境用于内部测试，不对外开放
        </div>

        <div class="footer">
            <p>国精集团 | 东方本草 养生瑰宝</p>
            <p>更新时间：2025年12月26日</p>
        </div>
    </div>
</body>
</html>
EOF

echo "✓ 测试页面已创建"

# 第 3 步：验证
echo ""
echo "[3/3] 验证文件..."
if [ -f "$SITE_ROOT/index.html" ]; then
    echo "✓ index.html 创建成功"
    echo ""
    echo "========================================="
    echo "✅ 设置完成！"
    echo "========================================="
    echo ""
    echo "访问以下地址查看测试页面："
    echo "📍 http://123.57.58.46"
    echo ""
    echo "宝塔面板地址："
    echo "🛠️ http://123.57.58.46:15147"
    echo ""
else
    echo "✗ 创建失败！"
    exit 1
fi

echo ""
ls -lh "$SITE_ROOT/"
