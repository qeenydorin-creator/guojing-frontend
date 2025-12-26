#!/bin/bash

set -e

echo "========================================="
echo "Cloudflare + Nginx 简化部署方案"
echo "========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# 步骤 1：清理雷池 WAF
# ============================================================================
echo -e "${BLUE}[步骤 1/5]${NC} 清理雷池 WAF..."
echo "----------------------------------------"

# 停止并删除所有雷池容器
if command -v docker &> /dev/null; then
    echo "停止雷池容器..."
    docker ps -a | grep safeline | awk '{print $1}' | xargs -r docker stop 2>/dev/null || true
    sleep 2

    echo "删除雷池容器..."
    docker ps -a | grep safeline | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true

    echo "删除雷池镜像..."
    docker images | grep safeline | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

    echo -e "${GREEN}✓${NC} 雷池 WAF 已清理"
else
    echo "Docker 未安装，跳过"
fi

# 清理雷池数据（可选）
if [ -d "/data/safeline-waf" ]; then
    echo "是否删除雷池数据目录？(保留以备后用)"
    # sudo rm -rf /data/safeline-waf
    echo "保留数据目录: /data/safeline-waf"
fi

echo ""

# ============================================================================
# 步骤 2：配置 Nginx（监听 80 端口）
# ============================================================================
echo -e "${BLUE}[步骤 2/5]${NC} 配置 Nginx..."
echo "----------------------------------------"

# 停止 Nginx
sudo systemctl stop nginx || true
sleep 2

# 检查端口 80 是否被占用
if sudo lsof -i :80 -t >/dev/null 2>&1; then
    echo "端口 80 被占用，尝试释放..."
    PID=$(sudo lsof -i :80 -t)
    sudo kill -9 $PID || true
    sleep 1
fi

# 创建网站目录
SITE_ROOT="/www/wwwroot/www.gij666.com"
sudo mkdir -p "$SITE_ROOT"

# 创建测试首页
echo "创建测试首页..."
sudo tee "$SITE_ROOT/index.html" > /dev/null << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>国精集团 - Cloudflare 加速</title>
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
            max-width: 700px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
            font-size: 2.8em;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .subtitle {
            font-size: 1.2em;
            margin-bottom: 35px;
            opacity: 0.95;
        }
        .status {
            color: #4ade80;
            font-weight: bold;
            font-size: 1.2em;
            margin-bottom: 35px;
            padding: 20px;
            background: rgba(74, 222, 128, 0.2);
            border-left: 5px solid #4ade80;
            border-radius: 8px;
        }
        .info {
            background: rgba(255, 255, 255, 0.15);
            padding: 30px;
            border-radius: 12px;
            margin: 25px 0;
            text-align: left;
        }
        .info-item {
            margin: 15px 0;
            font-size: 1.05em;
            line-height: 1.8;
        }
        .info-label {
            font-weight: 600;
            color: #fbbf24;
        }
        .architecture {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
            font-family: monospace;
            font-size: 0.9em;
            text-align: left;
        }
        .footer {
            margin-top: 35px;
            font-size: 0.9em;
            opacity: 0.8;
            padding-top: 25px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 国精集团</h1>
        <p class="subtitle">Cloudflare CDN 全球加速</p>

        <div class="status">
            ✅ 服务器运行正常
        </div>

        <div class="info">
            <div class="info-item">
                <span class="info-label">📍 服务器IP：</span>
                123.57.58.46
            </div>
            <div class="info-item">
                <span class="info-label">🛠️ 技术栈：</span>
                Nginx + Cloudflare CDN
            </div>
            <div class="info-item">
                <span class="info-label">🔒 安全防护：</span>
                Cloudflare WAF + DDoS 防护
            </div>
            <div class="info-item">
                <span class="info-label">⚡ CDN 加速：</span>
                全球 200+ 节点
            </div>
            <div class="info-item">
                <span class="info-label">🎯 架构：</span>
                简化部署，性能优化
            </div>
        </div>

        <div class="architecture">
            <strong>架构流程：</strong><br><br>
            用户浏览器<br>
            &nbsp;&nbsp;↓<br>
            Cloudflare CDN (全球加速 + WAF 防护)<br>
            &nbsp;&nbsp;↓<br>
            国内服务器 123.57.58.46<br>
            &nbsp;&nbsp;↓<br>
            Nginx (静态文件)<br>
            &nbsp;&nbsp;↓<br>
            Supabase (数据库 + API)
        </div>

        <div class="footer">
            <p>国精集团 | 东方本草 养生瑰宝</p>
            <p>更新时间：2025年12月26日</p>
        </div>
    </div>
</body>
</html>
EOF

# 创建 Nginx 配置文件
echo "配置 Nginx（监听 80 端口）..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name www.gij666.com gij666.com;

    root /www/wwwroot/www.gij666.com;
    index index.html index.htm;

    # 信任 Cloudflare IP（获取真实访客 IP）
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

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
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# 测试配置
echo "测试 Nginx 配置..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Nginx 配置有效"
else
    echo "Nginx 配置测试失败"
    exit 1
fi

# 启动 Nginx
echo "启动 Nginx..."
sudo systemctl start nginx
sleep 2

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} Nginx 已启动在端口 80"
else
    echo "Nginx 启动失败"
    sudo systemctl status nginx
    exit 1
fi

echo ""

# ============================================================================
# 步骤 3：配置防火墙
# ============================================================================
echo -e "${BLUE}[步骤 3/5]${NC} 配置防火墙..."
echo "----------------------------------------"

if command -v ufw &> /dev/null; then
    echo "配置 UFW 防火墙..."
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 15147/tcp  # 宝塔面板端口
    echo -e "${GREEN}✓${NC} 防火墙规则已添加"
else
    echo "UFW 未安装，跳过防火墙配置"
    echo "请在阿里云安全组中确保开放以下端口："
    echo "  - 80 (HTTP)"
    echo "  - 443 (HTTPS)"
    echo "  - 15147 (宝塔面板)"
fi

echo ""

# ============================================================================
# 步骤 4：验证服务
# ============================================================================
echo -e "${BLUE}[步骤 4/5]${NC} 验证服务..."
echo "----------------------------------------"

echo "端口监听状态："
sudo netstat -tlnp | grep -E ':(80|443)' || echo "未检测到监听"
echo ""

echo "测试本地访问："
curl -I http://127.0.0.1 2>/dev/null | head -3 || echo "无法访问"
echo ""

# ============================================================================
# 步骤 5：总结
# ============================================================================
echo -e "${BLUE}[步骤 5/5]${NC} 部署总结"
echo "----------------------------------------"
echo ""

echo "========================================="
echo -e "${GREEN}✓ 部署完成！${NC}"
echo "========================================="
echo ""
echo "当前架构："
echo "  ✅ Nginx 运行在端口 80"
echo "  ✅ 网站目录: $SITE_ROOT"
echo "  ✅ 配置文件: /etc/nginx/sites-available/default"
echo "  ❌ 雷池 WAF 已移除"
echo "  ⏳ 等待配置 Cloudflare CDN"
echo ""
echo "测试访问："
echo "  • 直接 IP 访问: http://123.57.58.46"
echo "  • 本地测试: curl http://127.0.0.1"
echo ""
echo "下一步操作："
echo "  1. 访问 http://123.57.58.46 验证 Nginx 正常"
echo "  2. 登录 Cloudflare 配置 DNS"
echo "  3. 部署 React 项目到 $SITE_ROOT"
echo ""
echo "常用命令："
echo "  • 查看 Nginx 状态: sudo systemctl status nginx"
echo "  • 重启 Nginx: sudo systemctl restart nginx"
echo "  • 查看日志: sudo tail -f /var/log/nginx/error.log"
echo "  • 测试配置: sudo nginx -t"
echo ""
