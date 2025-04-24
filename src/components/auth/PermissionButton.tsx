'use client';

import React, { ReactNode } from 'react';
import { useAuthContext } from './AuthProvider';
import Button from '../ui/Button';

interface PermissionButtonProps {
  allowedRoles: string[];
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

/**
 * 根据用户角色显示或隐藏按钮的组件
 */
export default function PermissionButton({
  allowedRoles,
  children,
  onClick,
  variant = 'primary',
  size,
  fullWidth,
  disabled,
  type = 'button',
  className
}: PermissionButtonProps) {
  const { user, hasPermission } = useAuthContext();
  
  // 如果用户没有权限，不渲染按钮
  if (!hasPermission(allowedRoles)) {
    return null;
  }
  
  // 有权限则渲染按钮
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      type={type}
      className={className}
    >
      {children}
    </Button>
  );
} 