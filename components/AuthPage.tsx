import React, { useState } from 'react';
import { Lock, User, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { login as apiLogin, register as apiRegister } from '../services/auth';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onRegisterSuccess: (user: UserProfile) => void;
  bannerMessage?: string; // 提示（例如管理员权限）
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onRegisterSuccess, bannerMessage }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Robust Input Handling ---
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error on user interaction
  };

  // --- Logic: Login ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.username || !formData.password) {
        throw new Error('请输入用户名和密码');
      }

      // Username basic constraint (same as register)
      const usernameRegex = /^[A-Za-z0-9_]{3,50}$/;
      if (!usernameRegex.test(formData.username)) {
        throw new Error('用户名仅支持字母、数字、下划线，长度 3-50');
      }

      console.log('[AuthPage] Attempting login with Supabase...');
      const profile = await apiLogin({
        username: formData.username.trim(),
        password: formData.password
      });

      console.log('[AuthPage] Login successful, user fetched:', { userId: profile.id, username: profile.username });
      onLoginSuccess(profile);
    } catch (err: any) {
      console.error('[AuthPage] Login failed:', err);
      // Parse error message
      let errorMessage = '登录失败，请检查用户名和密码';
      const lowerMsg = (err.message || '').toLowerCase();
      if (err.message.includes('超时') || err.message.includes('网络连接失败')) {
        errorMessage = err.message; // Use the detailed timeout/network message from auth.ts
      } else if (lowerMsg.includes('invalid credentials') || lowerMsg.includes('invalid')) {
        errorMessage = '用户名或密码错误，请检查后重试';
      } else if (lowerMsg.includes('disabled') || lowerMsg.includes('banned') || lowerMsg.includes('inactive')) {
        errorMessage = '该账号已被封禁或未激活，请联系客服';
      } else if (lowerMsg.includes('not found') || lowerMsg.includes('user not found')) {
        errorMessage = '该用户名未注册，请先注册';
      } else if (err.message) {
        // Use the actual error message from backend if available
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Logic: Register ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.username || !formData.password) {
        throw new Error('所有字段均为必填项');
      }

      // Username: alphanumeric/underscore, 3-50 chars
      const usernameRegex = /^[A-Za-z0-9_]{3,50}$/;
      if (!usernameRegex.test(formData.username)) {
        throw new Error('用户名仅支持字母、数字、下划线，长度 3-50');
      }
      
      // --- Relaxed Password Validation for testing ---
      if (formData.password.length < 7) {
         throw new Error('密码长度需大于 6 位');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }

      console.log('[AuthPage] Attempting registration with Supabase...');
      const profile = await apiRegister({
        username: formData.username.trim(),
        password: formData.password
      });

      console.log('[AuthPage] Registration successful:', { userId: profile.id, username: profile.username });
      // 欢迎积分（前端临时赋值，可在后端实现）
      profile.points = 50;
      profile.points_balance = 50;
      onRegisterSuccess(profile);
    } catch (err: any) {
      console.error('[AuthPage] Registration failed:', err);
      // Parse error message
      let errorMessage = '注册失败，请稍后重试';
      const lowerMsg = (err.message || '').toLowerCase();
      if (err.message.includes('超时')) {
        errorMessage = err.message; // Use the detailed timeout message from auth.ts
      } else if (err.message.includes('already registered') || err.message.includes('409')) {
        errorMessage = '该用户名已存在';
      } else if (err.message.includes('network') || err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        errorMessage = '网络错误，请稍后再试';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-stone-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-stone-100">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gj-green text-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gj-dark">
            {mode === 'login' ? '欢迎回来' : '加入国精'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'login' ? '登录以访问您的积分与特权' : '注册即送 50 积分新客礼遇'}
          </p>
        </div>

        {/* Banner / Error Feedback */}
        {bannerMessage && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-center gap-3">
            <ShieldCheck className="text-amber-600 flex-shrink-0" size={20} />
            <p className="text-sm text-amber-800 font-medium">{bannerMessage}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-center gap-3 animate-pulse">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          <div className="space-y-4">
            
            {/* Username */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-gray-400 group-focus-within:text-gj-gold transition-colors" size={20} />
              </div>
              <input
                type="text"
                required
                maxLength={50}
                className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gj-gold focus:border-transparent transition-all sm:text-sm"
                placeholder="用户名（字母数字下划线）"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-gray-400 group-focus-within:text-gj-gold transition-colors" size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                maxLength={20} // Adjusted max length for flexibility
                className="appearance-none rounded-lg relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gj-gold focus:border-transparent transition-all sm:text-sm"
                placeholder={mode === 'register' ? "密码（长度大于6位）" : "请输入密码"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password (Register Only) */}
            {mode === 'register' && (
              <div className="relative group animate-slide-up">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400 group-focus-within:text-gj-gold transition-colors" size={20} />
                </div>
                <input
                  type="password"
                  required
                  maxLength={20} 
                  className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gj-gold focus:border-transparent transition-all sm:text-sm"
                  placeholder="确认密码"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-gj-dark bg-gj-gold hover:bg-white hover:border-gj-gold hover:text-gj-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gj-gold transition-all duration-200 shadow-md ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                 <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                 处理中...
              </span>
            ) : (
              mode === 'login' ? '立即登录' : '创建账户'
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="flex items-center justify-center space-x-2 text-sm">
          <span className="text-gray-500">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
              setFormData({ username: '', password: '', confirmPassword: '' });
            }}
            className="font-medium text-gj-green hover:text-gj-gold transition-colors underline-offset-4 hover:underline"
          >
            {mode === 'login' ? '免费注册' : '直接登录'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;