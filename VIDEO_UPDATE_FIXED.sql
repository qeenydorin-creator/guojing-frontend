ALTER TABLE public.traceability_videos
ADD COLUMN IF NOT EXISTS video_url_1080p TEXT,
ADD COLUMN IF NOT EXISTS video_url_720p TEXT,
ADD COLUMN IF NOT EXISTS video_url_480p TEXT;

UPDATE public.traceability_videos
SET
  video_url_1080p = 'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/videos/video_1080p.mp4',
  video_url_720p = 'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/videos/video_720p.mp4',
  video_url_480p = 'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/videos/video_480p.mp4'
WHERE id = '将你的视频ID替换到这里';

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
