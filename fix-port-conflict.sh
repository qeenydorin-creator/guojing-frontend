#!/bin/bash

echo "========================================="
echo "端口冲突修复脚本"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 步骤 1：停止占用端口 80 的进程
echo -e "${YELLOW}[步骤 1]${NC} 停止占用端口 80 的进程..."
echo "----------------------------------------"

# 查找占用端口 80 的进程 PID
PID=$(sudo lsof -i :80 -t)

if [ -z "$PID" ]; then
    echo -e "${GREEN}✓${NC} 端口 80 未被占用"
else
    echo "发现占用端口 80 的进程："
    sudo lsof -i :80
    echo ""
    echo "关键 PID: $PID"

    # 查找该进程的程序名
    PROC_NAME=$(ps -p $PID -o comm=)
    echo "进程名称: $PROC_NAME"
    echo ""

    if [[ "$PROC_NAME" == "nginx" || "$PROC_NAME" == "docker" ]]; then
        echo "尝试优雅地停止该进程..."
        sudo kill -TERM $PID
        sleep 2

        # 检查是否还在运行
        if kill -0 $PID 2>/dev/null; then
            echo "进程仍在运行，强制杀死..."
            sudo kill -KILL $PID
            sleep 1
        fi

        echo -e "${GREEN}✓${NC} 进程已停止"
    fi
fi
echo ""

# 步骤 2：修改 Nginx 配置（如果存在）
echo -e "${YELLOW}[步骤 2]${NC} 修改 Nginx 配置..."
echo "----------------------------------------"

# 查找 Nginx 配置文件
NGINX_CONF=$(find /etc/nginx -name "www.gij666.com.conf" 2>/dev/null | head -1)

if [ -z "$NGINX_CONF" ]; then
    NGINX_CONF="/www/server/panel/vhost/nginx/www.gij666.com.conf"
fi

if [ -f "$NGINX_CONF" ]; then
    echo "找到 Nginx 配置文件: $NGINX_CONF"

    # 备份原文件
    sudo cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%s)"
    echo "已备份原文件"

    # 修改 listen 80 为 listen 8080
    if grep -q "listen 80" "$NGINX_CONF"; then
        sudo sed -i 's/listen 80/listen 8080/g' "$NGINX_CONF"
        echo -e "${GREEN}✓${NC} 已修改 Nginx 配置: listen 80 → listen 8080"
    else
        echo "Nginx 配置文件中未发现 'listen 80'，可能已修改"
    fi
else
    echo -e "${YELLOW}⚠${NC} 未找到 Nginx 配置文件"
    echo "请手动修改 Nginx 配置，将 'listen 80;' 改为 'listen 8080;'"
fi
echo ""

# 步骤 3：重启 Nginx
echo -e "${YELLOW}[步骤 3]${NC} 重启 Nginx..."
echo "----------------------------------------"

if systemctl is-active --quiet nginx; then
    echo "停止 Nginx..."
    sudo systemctl stop nginx
    sleep 1

    echo "启动 Nginx..."
    sudo systemctl start nginx
    sleep 1

    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✓${NC} Nginx 已成功重启"
    else
        echo -e "${RED}✗${NC} Nginx 启动失败，请检查配置文件"
    fi
else
    echo -e "${YELLOW}⚠${NC} Nginx 未运行，跳过重启步骤"
fi
echo ""

# 步骤 4：验证端口
echo -e "${YELLOW}[步骤 4]${NC} 验证端口占用情况..."
echo "----------------------------------------"

echo "端口 80 状态:"
if sudo lsof -i :80 -t >/dev/null 2>&1; then
    echo -e "${RED}✗${NC} 端口 80 仍被占用"
else
    echo -e "${GREEN}✓${NC} 端口 80 已释放"
fi
echo ""

echo "端口 8080 状态:"
if sudo lsof -i :8080 -t >/dev/null 2>&1; then
    PID=$(sudo lsof -i :8080 -t)
    PROC=$(ps -p $PID -o comm=)
    echo -e "${GREEN}✓${NC} 端口 8080 被使用 (进程: $PROC)"
else
    echo -e "${YELLOW}⚠${NC} 端口 8080 未被使用"
fi
echo ""

# 步骤 5：配置雷池 WAF
echo -e "${YELLOW}[步骤 5]${NC} 雷池 WAF 配置建议..."
echo "----------------------------------------"
echo "请在雷池 WAF 管理界面 (https://123.57.58.46:9443) 添加站点时："
echo "- 域名: www.gij666.com"
echo "- HTTP 监听端口: 80"
echo "- HTTPS 监听端口: 443"
echo -e "${GREEN}✓ 后端服务器: http://127.0.0.1:8080${NC} (改为 8080)"
echo ""

echo "========================================="
echo -e "${GREEN}✓ 修复完成！${NC}"
echo "========================================="
echo ""
echo "后续步骤:"
echo "1. 登录雷池 WAF 管理界面"
echo "2. 添加/更新站点配置"
echo "3. 将后端服务器改为: http://127.0.0.1:8080"
echo "4. 保存并应用"
