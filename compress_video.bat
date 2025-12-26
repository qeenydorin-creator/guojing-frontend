@echo off
REM =====================================================
REM 视频压缩脚本 - 将1GB视频压缩为3个清晰度版本
REM =====================================================
REM 使用方法: compress_video.bat input_video.mp4
REM 输出: video_1080p.mp4, video_720p.mp4, video_480p.mp4
REM =====================================================

setlocal enabledelayedexpansion

if "%1"=="" (
    echo 错误: 请指定输入视频文件
    echo 使用方法: compress_video.bat input_video.mp4
    pause
    exit /b 1
)

set INPUT=%1
set SCRIPT_DIR=%~dp0

if not exist "%INPUT%" (
    echo 错误: 文件不存在: %INPUT%
    pause
    exit /b 1
)

echo.
echo =====================================================
echo 国精集团 - 视频压缩工具 v1.0
echo =====================================================
echo.
echo 输入文件: %INPUT%
echo 脚本位置: %SCRIPT_DIR%
echo.
echo 开始压缩视频...
echo.

REM 检查 FFmpeg 是否已安装
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未检测到 FFmpeg，请先安装
    echo 安装方法: choco install ffmpeg
    echo 或访问: https://ffmpeg.org/download.html
    pause
    exit /b 1
)

REM 1080p - 高清版 (~100-150MB)
echo [1/3] 正在生成 1080p 高清版...
ffmpeg -i "%INPUT%" -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart video_1080p.mp4
if errorlevel 1 (
    echo 1080p 压缩失败！
    pause
    exit /b 1
)
echo ✓ 1080p 版本生成完成
echo.

REM 720p - 标清版 (~50-80MB)
echo [2/3] 正在生成 720p 标清版...
ffmpeg -i "%INPUT%" -c:v libx264 -preset slow -crf 24 -c:a aac -b:a 96k -vf scale=1280:720 -movflags +faststart video_720p.mp4
if errorlevel 1 (
    echo 720p 压缩失败！
    pause
    exit /b 1
)
echo ✓ 720p 版本生成完成
echo.

REM 480p - 流畅版 (~25-40MB)
echo [3/3] 正在生成 480p 流畅版...
ffmpeg -i "%INPUT%" -c:v libx264 -preset slow -crf 25 -c:a aac -b:a 64k -vf scale=854:480 -movflags +faststart video_480p.mp4
if errorlevel 1 (
    echo 480p 压缩失败！
    pause
    exit /b 1
)
echo ✓ 480p 版本生成完成
echo.

echo =====================================================
echo 压缩完成！
echo =====================================================
echo.
echo 生成的文件:
echo.
if exist "video_1080p.mp4" (
    for %%A in (video_1080p.mp4) do echo   ✓ %%A ^(大小: %%~zA bytes^)
) else (
    echo   ✗ video_1080p.mp4 （生成失败）
)

if exist "video_720p.mp4" (
    for %%A in (video_720p.mp4) do echo   ✓ %%A ^(大小: %%~zA bytes^)
) else (
    echo   ✗ video_720p.mp4 （生成失败）
)

if exist "video_480p.mp4" (
    for %%A in (video_480p.mp4) do echo   ✓ %%A ^(大小: %%~zA bytes^)
) else (
    echo   ✗ video_480p.mp4 （生成失败）
)

echo.
echo 下一步:
echo 1. 上传这3个视频到 Supabase Storage (bucket: videos)
echo 2. 记下这3个视频的公开 URL
echo 3. 在 Supabase SQL Editor 执行 SQL 更新脚本
echo.
pause
