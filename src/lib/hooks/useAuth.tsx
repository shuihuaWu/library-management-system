'use client';

import { createBrowserSupabaseClient } from '@/lib/supabase';
import { UserInfo, UserRole } from '@/lib/types';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    // 获取当前用户信息
    const getCurrentUser = async () => {
      try {
        setLoading(true);
        
        // 获取当前认证会话
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setUser(null);
          return;
        }

        // 获取用户详细信息
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('获取用户资料失败:', profileError);
          setUser(null);
          return;
        }

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: profile?.username || null,
          role: profile?.role as UserRole || 'user', // 默认为普通用户
        });
      } catch (error) {
        console.error('获取用户信息时出错:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          // 会话存在，获取最新用户信息
          getCurrentUser();
        } else {
          // 会话不存在，用户已登出
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 检查用户是否有特定权限
  const hasPermission = (roles: string[]): boolean => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  // 退出登录
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    loading,
    hasPermission,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };
} 