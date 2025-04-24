'use client';

import React, { ReactNode } from 'react';
import { useAuthContext } from './AuthProvider';
import { PERMISSIONS } from '@/lib/types';

interface PermissionButtonProps {
  resource: keyof typeof PERMISSIONS;
  action: string;
  children: ReactNode;
  fallback?: ReactNode | null;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * 权限按钮组件，根据用户权限决定是否显示按钮
 * @param resource - 资源类型，如 'BOOKS', 'AUTHORS' 等
 * @param action - 操作类型，如 'CREATE', 'UPDATE', 'DELETE', 'READ' 等
 * @param children - 按钮内容
 * @param fallback - 用户无权限时显示的替代内容，默认为null（不显示）
 * @param className - 自定义类名
 * @param onClick - 点击事件
 * @param disabled - 是否禁用
 */
const PermissionButton = ({
  resource,
  action,
  children,
  fallback = null,
  className = '',
  onClick,
  disabled = false,
}: PermissionButtonProps) => {
  const { user, loading } = useAuthContext();

  // 如果正在加载，不渲染任何内容
  if (loading) return null;

  // 获取该资源该操作的权限列表
  const permissionKey = action as keyof typeof PERMISSIONS[keyof typeof PERMISSIONS];
  
  // 检查资源和操作是否存在
  if (!PERMISSIONS[resource] || !PERMISSIONS[resource][permissionKey]) {
    console.warn(`权限检查失败: ${resource}.${action} 不存在`);
    return null;
  }
  
  const allowedRoles = PERMISSIONS[resource][permissionKey];
  
  // 检查用户角色是否有权限
  const hasPermission = user?.role && allowedRoles.includes(user.role);
  
  // 如果用户没有权限，显示替代内容或不显示
  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null;
  }
  
  // 用户有权限，显示按钮
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};

export default PermissionButton; 