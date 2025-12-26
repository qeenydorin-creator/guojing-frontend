#!/bin/bash

echo "========================================="
echo "端口占用诊断脚本"
echo "========================================="
echo ""

echo "[1/5] 检查端口 80 占用情况..."
echo "----------------------------------------"
sudo netstat -tlnp | grep :80 || echo "未找到使用 netstat 的结果，尝试 ss 命令..."
sudo ss -tlnp | grep :80 || echo "端口 80 未被占用"
echo ""

echo "[2/5] 检查端口 443 占用情况..."
echo "----------------------------------------"
sudo netstat -tlnp | grep :443 || echo "未找到使用 netstat 的结果，尝试 ss 命令..."
sudo ss -tlnp | grep :443 || echo "端口 443 未被占用"
echo ""

echo "[3/5] 检查端口 8080 占用情况..."
echo "----------------------------------------"
sudo netstat -tlnp | grep :8080 || echo "未找到使用 netstat 的结果，尝试 ss 命令..."
sudo ss -tlnp | grep :8080 || echo "端口 8080 未被占用"
echo ""

echo "[4/5] 检查 Nginx 进程..."
echo "----------------------------------------"
ps aux | grep nginx | grep -v grep || echo "Nginx 未运行"
echo ""

echo "[5/5] 检查 Docker 容器端口映射..."
echo "----------------------------------------"
docker ps --format "table {{.Names}}\t{{.Ports}}" || echo "无法获取 Docker 容器信息"
echo ""

echo "========================================="
echo "诊断完成！"
echo "========================================="
echo ""

echo "建议操作："
echo "1. 如果端口 80 被 Nginx 占用 → 修改 Nginx 配置改为监听 8080"
echo "2. 如果端口 80 被 Docker 容器占用 → 停止并重新配置容器"
echo "3. 如果端口 80 被其他程序占用 → 停止该程序或更改其端口"
