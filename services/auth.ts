import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

const INTERNAL_DOMAIN = '@guojing.com';
const appendDomain = (username: string) =>
  username.includes('@') ? username : `${username}${INTERNAL_DOMAIN}`;
const stripDomain = (email?: string | null) => {
  if (!email) return '';
  const lower = email.toLowerCase();
  const suffix = INTERNAL_DOMAIN.toLowerCase();
  return lower.endsWith(suffix) ? email.slice(0, -suffix.length) : email;
};

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
}

const toUserProfile = (user: any): UserProfile => ({
  id: user?.id ?? '',
  username: user?.user_metadata?.username ?? stripDomain(user?.email) ?? '',
  role: user?.user_metadata?.role ?? 'user',
  points: 0,
  points_balance: 0,
  registrationDate: user?.created_at ? new Date(user.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
  status: 'active',
});

export const login = async ({ username, password }: LoginPayload): Promise<UserProfile> => {
  const email = appendDomain(username.trim());
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message?.toLowerCase().includes('invalid')) {
      throw new Error('用户名或密码错误');
    }
    throw error;
  }
  return toUserProfile(data.user);
};

export const register = async ({ username, password }: RegisterPayload): Promise<UserProfile> => {
  const email = appendDomain(username.trim());
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });
  if (error) {
    if (error.message?.toLowerCase().includes('user already registered')) {
      throw new Error('该用户名已存在');
    }
    throw error;
  }
  // 如果未立即返回 session，则尝试登录以获取 user
  if (!data.user) {
    const loginProfile = await login({ username, password });
    return loginProfile;
  }
  return toUserProfile(data.user);
};

export const getMe = async (): Promise<UserProfile> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw error || new Error('未登录');
  }
  return toUserProfile(data.user);
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// 兼容旧命名
export const convertToUserProfile = (meData: { id: string; email: string }) => ({
  id: meData.id,
  username: stripDomain(meData.email),
  role: 'user',
  points: 0,
  points_balance: 0,
  registrationDate: new Date().toLocaleDateString(),
  status: 'active',
});
