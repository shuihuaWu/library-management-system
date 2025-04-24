'use client';

import React, { ReactNode } from 'react';
import { useAuthContext } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode; // 可选的替代内容
  redirectTo?: string; // 可选的重定向路径
}

// 基于角色的权限守卫组件
export default function RoleGuard({
  allowedRoles,
  children,
  fallback,
  redirectTo = '/auth/login',
}: RoleGuardProps) {
  const { user, loading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  // 如果正在加载用户信息，显示加载状态
  if (loading) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  // 如果未登录，重定向到登录页面
  if (!isAuthenticated) {
    // 在客户端组件中，使用useEffect执行重定向
    React.useEffect(() => {
      router.push(`${redirectTo}?returnUrl=${encodeURIComponent(window.location.pathname)}`);
    }, []);

    // 返回null避免闪烁
    return null;
  }

  // 检查用户角色是否在允许的角色列表中
  const hasRequiredRole = user?.role && allowedRoles.includes(user.role);

  // 如果用户没有所需角色
  if (!hasRequiredRole) {
    // 如果提供了替代内容，则显示它
    if (fallback) {
      return <>{fallback}</>;
    }

    // 显示默认的无权限提示
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">无权访问</h2>
        <p className="text-gray-600">您没有权限访问此页面。</p>
      </div>
    );
  }

  // 用户有访问权限，显示子组件
  return <>{children}</>;
} 