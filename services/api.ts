import { supabase } from './supabaseClient';

const PUBLIC_BUCKET = 'public';

const toPublicUrl = (path?: string | null) => {
  if (!path) return '';
  // Already absolute URL
  if (/^https?:\/\//i.test(path)) {
    // If legacy absolute URL points to /api/uploads or /uploads, rewrite to storage path
    const match = path.match(/\/(?:api\/)?uploads\/(.+)$/i);
    if (match?.[1]) {
      const cleanedAbs = `uploads/${match[1]}`;
      const { data } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(cleanedAbs);
      return data?.publicUrl || cleanedAbs;
    }
    return path;
  }
  // Normalize legacy backend relative paths like /api/uploads/<file> or /uploads/<file>
  const cleaned = path.replace(/^\/?api\/uploads\//i, 'uploads/').replace(/^\/?uploads\//i, 'uploads/');
  const { data } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(cleaned);
  return data?.publicUrl || cleaned;
};

export const fetchSiteImages = async (): Promise<Record<string, string>> => {
  const result: Record<string, string> = {};
  try {
    const { data, error } = await supabase.from('site_images').select('key,url');
    if (error) throw error;
    data?.forEach(row => {
      result[row.key] = toPublicUrl(row.url);
    });
  } catch (e) {
    console.warn('[site-images] 使用空配置，原因:', e);
  }
  return result;
};

export const updateSiteImage = async (key: string, url: string): Promise<void> => {
  const { error } = await supabase.from('site_images').upsert({ key, url }, { onConflict: 'key' });
  if (error) throw error;
};

export const uploadImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const filePath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt || 'jpg'}`;
  const { data, error } = await supabase.storage.from(PUBLIC_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data: publicData } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(data.path);
  return publicData?.publicUrl || filePath;
};

export const fetchSystemStatus = async () => {
  try {
    const { data, error } = await supabase.from('system_status').select('*').limit(1).single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
};

export const pointsUse = async (payload: { user_id: string; amount: number; source_type: string; source_id?: string; description?: string; }) => {
  const { data, error } = await supabase.from('points_ledger').insert({
    user_id: payload.user_id,
    amount: payload.amount,
    source_type: payload.source_type,
    source_id: payload.source_id,
    description: payload.description,
  }).select().single();
  if (error) throw error;
  return data;
};

export const pointsEarn = async (payload: { user_id: string; amount: number; source_type: string; source_id?: string; description?: string; }) => {
  const { data, error } = await supabase.from('points_ledger').insert({
    user_id: payload.user_id,
    amount: payload.amount,
    source_type: payload.source_type,
    source_id: payload.source_id,
    description: payload.description,
  }).select().single();
  if (error) throw error;
  return data;
};

export const pointsLedger = async (user_id: string, limit = 20) => {
  const { data, error } = await supabase
    .from('points_ledger')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

// -------- Products --------
export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(p => ({ ...p, cover_image: toPublicUrl(p.cover_image) }));
};

export const fetchProduct = async (id: string) => {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return { ...data, cover_image: toPublicUrl(data.cover_image) };
};

// Points products
export const fetchPointsProducts = async () => {
  const { data, error } = await supabase
    .from('points_products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(p => ({ ...p, image_url: toPublicUrl(p.image_url) }));
};

// -------- Forum --------
export interface ForumPostPayload {
  title: string;
  content: string;
  author?: string;
}

export interface ForumCommentPayload {
  author?: string;
  content: string;
}

export const fetchForumPosts = async () => {
  const { data, error } = await supabase.from('forum_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const fetchForumPost = async (id: string) => {
  const { data, error } = await supabase.from('forum_posts').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createForumPost = async (payload: ForumPostPayload) => {
  const { data, error } = await supabase.from('forum_posts').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const addForumComment = async (postId: string, payload: ForumCommentPayload) => {
  const { data, error } = await supabase.from('forum_comments').insert({ ...payload, post_id: postId }).select().single();
  if (error) throw error;
  return data;
};

// -------- CMS Pages --------
export const fetchPageContent = async (pageKey: string) => {
  const { data, error } = await supabase.from('pages').select('*').eq('page_key', pageKey).single();
  if (error) throw error;
  return data;
};

// -------- Traceability Videos --------
export interface TraceabilityVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  poster_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const fetchTraceabilityVideos = async (): Promise<TraceabilityVideo[]> => {
  try {
    const { data, error } = await supabase
      .from('traceability_videos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('[traceability-videos] 获取视频失败:', e);
    return [];
  }
};

export const fetchTraceabilityVideo = async (id: string): Promise<TraceabilityVideo | null> => {
  try {
    const { data, error } = await supabase
      .from('traceability_videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.warn('[traceability-video] 获取视频失败:', e);
    return null;
  }
};
