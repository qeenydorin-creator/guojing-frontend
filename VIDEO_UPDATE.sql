-- =====================================================
-- 溯源视频优化 - Supabase SQL 更新脚本
-- 用于支持多清晰度版本的视频播放
-- =====================================================

-- 步骤 1: 为 traceability_videos 表添加新字段
-- 这些字段存储不同清晰度版本的视频 URL
ALTER TABLE public.traceability_videos
ADD COLUMN IF NOT EXISTS video_url_1080p TEXT,     -- 高清版本 (~100-150MB)
ADD COLUMN IF NOT EXISTS video_url_720p TEXT,      -- 标清版本 (~50-80MB)
ADD COLUMN IF NOT EXISTS video_url_480p TEXT;      -- 流畅版本 (~25-40MB)

-- 步骤 2: 更新你的视频记录 (用实际 URL 替换下方的 placeholder)
-- 注意: 请将下列 URL 替换为你上传到 Supabase Storage 的实际 URL

UPDATE public.traceability_videos
SET
  video_url_1080p = 'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/videos/video_1080p.mp4',
  video_url_720p = 'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/videos/video_720p.mp4',
  video_url_480p = 'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/videos/video_480p.mp4'
WHERE title = '九蒸九晒 · 古法炮制' OR id = 'your-video-id-here';

-- 验证更新
-- 执行下列查询确认数据已正确更新
SELECT
  id,
  title,
  video_url,
  video_url_1080p,
  video_url_720p,
  video_url_480p,
  is_active
FROM public.traceability_videos
ORDER BY created_at DESC;
