#!/bin/bash

set -e

echo "========================================="
echo "完整部署脚本：Nginx + Docker + 雷池 WAF"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# 第 1 部分：Nginx 基础设置
# ============================================================================
echo -e "${BLUE}========== 第 1 部分：Nginx 基础设置 ==========${NC}"
echo ""

# 检查 Nginx 是否安装
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Nginx 未安装，正在安装...${NC}"
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# 停止 Nginx
echo "停止 Nginx..."
sudo systemctl stop nginx || true
sleep 2

# 创建网站目录
SITE_ROOT="/www/wwwroot/www.gij666.com"
echo "创建网站目录: $SITE_ROOT"
sudo mkdir -p "$SITE_ROOT"
sudo chown -R $(whoami):$(whoami) "$SITE_ROOT" 2>/dev/null || sudo chown -R root:root "$SITE_ROOT"

# 创建首页
echo "创建测试首页..."
cat > "$SITE_ROOT/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>国精集团 - 测试环境</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
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
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        .status {
            color: #4ade80;
            font-weight: bold;
            margin: 30px 0;
            padding: 15px;
            background: rgba(74, 222, 128, 0.2);
            border-left: 4px solid #4ade80;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 国精集团测试环境</h1>
        <div class="status">✅ Nginx 运行正常 (8080 端口)</div>
        <p>服务器 IP: 123.57.58.46</p>
    </div>
</body>
</html>
EOF

# 创建 Nginx 配置
echo "配置 Nginx..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 8080 default_server;
    listen [::]:8080 default_server;
    server_name _;
    root /www/wwwroot/www.gij666.com;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
    }
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
EOF

# 测试 Nginx 配置
echo "测试 Nginx 配置..."
sudo nginx -t || exit 1

# 启动 Nginx
echo "启动 Nginx..."
sudo systemctl start nginx
sleep 2

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx 已在端口 8080 启动${NC}"
else
    echo -e "${RED}✗ Nginx 启动失败${NC}"
    exit 1
fi
echo ""

# ============================================================================
# 第 2 部分：Docker 和雷池 WAF
# ============================================================================
echo -e "${BLUE}========== 第 2 部分：Docker 和雷池 WAF ==========${NC}"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# 启动 Docker
echo "启动 Docker..."
sudo systemctl start docker
sudo systemctl enable docker
sleep 2

# 清理旧容器
echo "清理旧的雷池容器..."
docker ps -a | grep safeline | awk '{print $1}' | xargs -r docker rm -f || true
sleep 2

# 创建数据目录
echo "创建雷池数据目录..."
mkdir -p /data/safeline-waf/{mgt,gateway,postgres,redis}

# 创建 docker-compose 文件
echo "创建 docker-compose 文件..."
cat > /data/safeline-waf/docker-compose.yml << 'COMPOSE_EOF'
version: '3.8'

services:
  safeline-postgres:
    image: postgres:15-alpine
    container_name: safeline-postgres
    restart: always
    environment:
      POSTGRES_DB: safeline
      POSTGRES_USER: safeline
      POSTGRES_PASSWORD: safeline123
    volumes:
      - /data/safeline-waf/postgres:/var/lib/postgresql/data
    networks:
      - safeline
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U safeline"]
      interval: 10s
      timeout: 5s
      retries: 5

  safeline-redis:
    image: redis:7-alpine
    container_name: safeline-redis
    restart: always
    volumes:
      - /data/safeline-waf/redis:/data
    networks:
      - safeline
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  safeline-mgt:
    image: chaitin/safeline-mgt:latest
    container_name: safeline-mgt
    restart: always
    ports:
      - "9443:9443"
    volumes:
      - /data/safeline-waf/mgt:/data
    environment:
      MGT_DOMAIN: safeline-mgt
      POSTGRES_HOST: safeline-postgres
      POSTGRES_PORT: 5432
      POSTGRES_USER: safeline
      POSTGRES_PASSWORD: safeline123
      REDIS_HOST: safeline-redis
      REDIS_PORT: 6379
    networks:
      - safeline
    depends_on:
      safeline-postgres:
        condition: service_healthy
      safeline-redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-k", "https://localhost:9443/api/v1/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  safeline-gateway:
    image: chaitin/safeline-gateway:latest
    container_name: safeline-gateway
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /data/safeline-waf/gateway:/data
    environment:
      MGT_DOMAIN: safeline-mgt
      LISTEN_PORT: 80
    networks:
      - safeline
    depends_on:
      safeline-mgt:
        condition: service_healthy

networks:
  safeline:
    driver: bridge
COMPOSE_EOF

# 启动雷池 WAF
echo "启动雷池 WAF..."
cd /data/safeline-waf
sudo docker-compose -f docker-compose.yml up -d
sleep 10

# 验证容器
echo "验证容器状态..."
docker ps | grep safeline || echo "警告：未找到雷池容器"
echo ""

# ============================================================================
# 第 3 部分：验证
# ============================================================================
echo -e "${BLUE}========== 第 3 部分：验证 ==========${NC}"
echo ""

echo "检查端口状态..."
echo "端口 80 (应被雷池占用):"
sudo netstat -tlnp 2>/dev/null | grep :80 || echo "未被占用"
echo ""

echo "端口 8080 (应被 Nginx 占用):"
sudo netstat -tlnp 2>/dev/null | grep :8080 || echo "未被占用"
echo ""

echo "端口 9443 (应被雷池管理界面占用):"
sudo netstat -tlnp 2>/dev/null | grep :9443 || echo "未被占用"
echo ""

# ============================================================================
# 总结
# ============================================================================
echo -e "${BLUE}========== 部署完成 ==========${NC}"
echo ""
echo -e "${GREEN}✓ 基础设置已完成！${NC}"
echo ""
echo "可用的服务："
echo "  • Nginx (端口 8080): http://123.57.58.46:8080"
echo "  • 雷池 WAF 管理界面 (端口 9443): https://123.57.58.46:9443"
echo ""
echo "后续操作："
echo "  1. 等待 15-30 秒让雷池 WAF 完全启动"
echo "  2. 访问 https://123.57.58.46:9443 进入雷池管理界面"
echo "  3. 在雷池中添加站点："
echo "     - 域名: www.gij666.com"
echo "     - 后端: http://127.0.0.1:8080"
echo "     - 监听端口: 80 和 443"
echo ""
