#!/bin/bash

echo "========================================="
echo "雷池 WAF 服务诊断与修复"
echo "========================================="
echo ""

# 步骤 1：检查 Docker 服务状态
echo "[1/6] 检查 Docker 服务状态..."
echo "----------------------------------------"
sudo systemctl status docker --no-pager | head -10
echo ""

if ! systemctl is-active --quiet docker; then
    echo "Docker 服务未运行，正在启动..."
    sudo systemctl start docker
    sleep 2
fi
echo ""

# 步骤 2：检查所有 Docker 容器状态
echo "[2/6] 检查 Docker 容器状态..."
echo "----------------------------------------"
docker ps -a | grep safeline
echo ""

# 步骤 3：查看雷池容器日志
echo "[3/6] 查看雷池容器日志（最后 50 行）..."
echo "----------------------------------------"
docker logs --tail 50 safeline-mgt 2>&1 || docker logs --tail 50 safeline 2>&1 || echo "无法获取日志"
echo ""

# 步骤 4：检查端口占用
echo "[4/6] 检查关键端口占用..."
echo "----------------------------------------"
echo "端口 9443 (雷池管理界面):"
sudo lsof -i :9443 || echo "端口未被占用"
echo ""
echo "端口 80:"
sudo lsof -i :80 || echo "端口未被占用"
echo ""
echo "端口 443:"
sudo lsof -i :443 || echo "端口未被占用"
echo ""

# 步骤 5：重启所有雷池容器
echo "[5/6] 重启雷池 WAF 容器..."
echo "----------------------------------------"

# 查找所有雷池相关容器
SAFELINE_CONTAINERS=$(docker ps -a --filter "name=safeline" --format "{{.Names}}")

if [ -z "$SAFELINE_CONTAINERS" ]; then
    echo "未找到雷池容器"
else
    echo "找到以下雷池容器："
    echo "$SAFELINE_CONTAINERS"
    echo ""

    # 停止所有雷池容器
    echo "停止所有雷池容器..."
    for container in $SAFELINE_CONTAINERS; do
        echo "停止容器: $container"
        docker stop $container
    done
    sleep 3

    # 启动所有雷池容器
    echo ""
    echo "启动所有雷池容器..."
    for container in $SAFELINE_CONTAINERS; do
        echo "启动容器: $container"
        docker start $container
    done
    sleep 5
fi
echo ""

# 步骤 6：验证服务状态
echo "[6/6] 验证服务状态..."
echo "----------------------------------------"
echo "运行中的雷池容器："
docker ps | grep safeline || echo "没有运行中的雷池容器"
echo ""

echo "端口监听状态："
sudo netstat -tlnp | grep -E ':(80|443|9443)' || sudo ss -tlnp | grep -E ':(80|443|9443)' || echo "未检测到监听端口"
echo ""

echo "========================================="
echo "诊断完成！"
echo "========================================="
echo ""
echo "后续操作："
echo "1. 等待 10-15 秒让服务完全启动"
echo "2. 访问 https://123.57.58.46:9443 查看是否恢复"
echo "3. 如果仍无法访问，检查上面的日志查找错误原因"
