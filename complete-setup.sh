#!/bin/bash

set -e

echo "========================================="
echo "完整的 Nginx + 雷池 WAF 设置脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
SITE_ROOT="/www/wwwroot/www.gij666.com"
NGINX_CONF="/etc/nginx/sites-available/www.gij666.com"
NGINX_ENABLED="/etc/nginx/sites-enabled/www.gij666.com"

# ============================================================================
# 步骤 1：清理旧的配置
# ============================================================================
echo -e "${BLUE}[步骤 1]${NC} 清理旧的配置和文件..."
echo "----------------------------------------"

# 停止 Nginx（如果运行）
if systemctl is-active --quiet nginx; then
    echo "停止 Nginx 服务..."
    sudo systemctl stop nginx
    sleep 2
fi

# 清理网站目录
echo "清理网站根目录..."
if [ -d "$SITE_ROOT" ]; then
    sudo rm -rf "$SITE_ROOT"/*
    echo -e "${GREEN}✓${NC} 目录已清理"
else
    echo "创建网站目录..."
    sudo mkdir -p "$SITE_ROOT"
fi

# 清理旧的 Nginx 配置
echo "清理旧的 Nginx 配置..."
sudo rm -f "$NGINX_CONF" "$NGINX_ENABLED" /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default 2>/dev/null || true
echo ""

# ============================================================================
# 步骤 2：创建简单的测试首页
# ============================================================================
echo -e "${BLUE}[步骤 2]${NC} 创建测试首页..."
echo "----------------------------------------"

sudo tee "$SITE_ROOT/index.html" > /dev/null << 'EOF'
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
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 国精集团</h1>
        <p class="subtitle">测试环境 - Nginx + 雷池 WAF</p>
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
                Nginx + 雷池 WAF
            </div>
            <div class="info-item">
                <span class="info-label">🎯 用途：</span>
                测试、备份、开发环境
            </div>
        </div>
    </div>
</body>
</html>
EOF

sudo chown -R www-data:www-data "$SITE_ROOT" 2>/dev/null || sudo chown -R root:root "$SITE_ROOT"
echo -e "${GREEN}✓${NC} 测试首页已创建"
echo ""

# ============================================================================
# 步骤 3：创建 Nginx 配置文件
# ============================================================================
echo -e "${BLUE}[步骤 3]${NC} 创建 Nginx 配置文件..."
echo "----------------------------------------"

sudo tee "$NGINX_CONF" > /dev/null << 'EOF'
# Nginx 配置文件
# 监听 8080 端口（留给雷池 WAF 监听 80 和 443）

server {
    listen 8080 default_server;
    listen [::]:8080 default_server;

    server_name www.gij666.com gij666.com _;

    root /www/wwwroot/www.gij666.com;
    index index.html index.htm;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
EOF

# 启用配置
sudo ln -sf "$NGINX_CONF" "$NGINX_ENABLED" 2>/dev/null || true

# 删除默认配置
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

echo -e "${GREEN}✓${NC} Nginx 配置已创建 (监听 8080 端口)"
echo ""

# ============================================================================
# 步骤 4：测试和启动 Nginx
# ============================================================================
echo -e "${BLUE}[步骤 4]${NC} 测试和启动 Nginx..."
echo "----------------------------------------"

# 测试配置
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓${NC} Nginx 配置测试通过"
else
    echo -e "${RED}✗${NC} Nginx 配置测试失败:"
    sudo nginx -t
    exit 1
fi

# 启动 Nginx
sudo systemctl restart nginx
sleep 2

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} Nginx 已成功启动"
else
    echo -e "${RED}✗${NC} Nginx 启动失败"
    sudo systemctl status nginx
    exit 1
fi
echo ""

# ============================================================================
# 步骤 5：验证端口
# ============================================================================
echo -e "${BLUE}[步骤 5]${NC} 验证端口状态..."
echo "----------------------------------------"

echo "检查端口 80..."
if sudo lsof -i :80 -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC}  端口 80 被占用（应该被雷池 WAF 占用）"
else
    echo -e "${GREEN}✓${NC} 端口 80 已释放"
fi

echo "检查端口 8080..."
if sudo lsof -i :8080 -t >/dev/null 2>&1; then
    PID=$(sudo lsof -i :8080 -t)
    PROC=$(ps -p $PID -o comm=)
    echo -e "${GREEN}✓${NC} 端口 8080 被使用 (进程: $PROC)"
else
    echo -e "${RED}✗${NC} 端口 8080 未被使用"
fi

echo "检查端口 9443..."
if sudo lsof -i :9443 -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 端口 9443 被使用（雷池 WAF 管理界面）"
else
    echo -e "${YELLOW}⚠${NC}  端口 9443 未被使用（雷池 WAF 可能未运行）"
fi
echo ""

# ============================================================================
# 步骤 6：清理 Docker
# ============================================================================
echo -e "${BLUE}[步骤 6]${NC} 检查并清理 Docker..."
echo "----------------------------------------"

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠${NC}  Docker 未安装"
else
    # 停止雷池容器
    SAFELINE_CONTAINERS=$(docker ps -a --filter "name=safeline" --format "{{.Names}}" 2>/dev/null || echo "")

    if [ -n "$SAFELINE_CONTAINERS" ]; then
        echo "停止雷池容器..."
        for container in $SAFELINE_CONTAINERS; do
            docker stop $container 2>/dev/null || true
            docker rm $container 2>/dev/null || true
        done
        echo -e "${GREEN}✓${NC} 雷池旧容器已清理"
    else
        echo "未找到雷池容器"
    fi
fi
echo ""

# ============================================================================
# 步骤 7：总结
# ============================================================================
echo "========================================="
echo -e "${GREEN}✓ 基础设置完成！${NC}"
echo "========================================="
echo ""
echo "当前状态："
echo "  ✅ Nginx 运行在端口 8080"
echo "  ✅ 网站文件位置: $SITE_ROOT"
echo "  ⏳ 雷池 WAF 需要重新部署（监听 80/443，转发到 8080）"
echo ""
echo "后续步骤："
echo "1. 访问测试: http://123.57.58.46:8080"
echo "2. 重新部署雷池 WAF（使用提供的 docker-compose.yml）"
echo "3. 在雷池中配置反向代理到 http://127.0.0.1:8080"
echo ""
echo "相关命令："
echo "  查看 Nginx 状态: sudo systemctl status nginx"
echo "  查看 Nginx 日志: sudo tail -f /var/log/nginx/error.log"
echo "  测试访问: curl http://127.0.0.1:8080"
echo ""
