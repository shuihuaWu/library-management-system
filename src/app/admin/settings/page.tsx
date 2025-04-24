'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import RoleGuard from '@/components/auth/RoleGuard';
import Button from '@/components/ui/Button';
import { PERMISSIONS } from '@/lib/types';

export default function PermissionSettingsPage() {
  const [permissions, setPermissions] = useState(PERMISSIONS);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 目前这只是演示，实际上我们不能直接在前端修改权限
  // 在生产环境中，这些应该保存在数据库中，并通过API更新
  const savePermissions = async () => {
    try {
      setSaveStatus('saving');
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 在实际应用中，这里应该调用API保存到数据库
      localStorage.setItem('permissions', JSON.stringify(permissions));
      
      setSaveStatus('success');
      setIsEditing(false);
      
      // 3秒后重置状态
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage('保存权限设置失败');
    }
  };
  
  const handleCancel = () => {
    // 重置为原始权限
    setPermissions(PERMISSIONS);
    setIsEditing(false);
  };
  
  // 渲染权限设置表格
  const renderPermissionsTable = (section: string, permissionGroup: any) => {
    return (
      <div className="mb-8" key={section}>
        <h3 className="text-lg font-semibold mb-3 capitalize">{section} 权限</h3>
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                操作
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                管理员
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                普通用户
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(permissionGroup).map(([action, roles]) => (
              <tr key={action} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 capitalize">
                  {action.replace(/_/g, ' ').toLowerCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={(roles as string[]).includes('admin')}
                    onChange={() => {
                      if (!isEditing) return;
                      
                      // 管理员默认拥有所有权限，不应该被移除
                      // 这里仅作演示，实际应用中可能需要不同的逻辑
                      if ((roles as string[]).includes('admin')) {
                        alert('管理员默认拥有所有权限，无法移除');
                        return;
                      }
                      
                      const updatedRoles = (roles as string[]).includes('admin')
                        ? (roles as string[]).filter(r => r !== 'admin')
                        : [...(roles as string[]), 'admin'];
                      
                      setPermissions(prev => ({
                        ...prev,
                        [section]: {
                          ...prev[section as keyof typeof prev],
                          [action]: updatedRoles
                        }
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    disabled={!isEditing}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={(roles as string[]).includes('user')}
                    onChange={() => {
                      if (!isEditing) return;
                      
                      const updatedRoles = (roles as string[]).includes('user')
                        ? (roles as string[]).filter(r => r !== 'user')
                        : [...(roles as string[]), 'user'];
                      
                      setPermissions(prev => ({
                        ...prev,
                        [section]: {
                          ...prev[section as keyof typeof prev],
                          [action]: updatedRoles
                        }
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    disabled={!isEditing}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <MainLayout>
      <RoleGuard allowedRoles={['admin']}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">系统权限设置</h1>
            <div className="space-x-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={saveStatus === 'saving'}
                  >
                    取消
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={savePermissions}
                    disabled={saveStatus === 'saving'}
                  >
                    {saveStatus === 'saving' ? '保存中...' : '保存更改'}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="primary" 
                  onClick={() => setIsEditing(true)}
                  disabled={saveStatus === 'saving'}
                >
                  编辑权限
                </Button>
              )}
            </div>
          </div>
          
          {saveStatus === 'success' && (
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
              权限设置已保存成功
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {errorMessage || '保存时发生错误'}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 mb-6">
              权限管理决定了不同角色的用户可以执行哪些操作。管理员默认拥有所有权限，普通用户的权限可以在此配置。
            </p>
            
            <div className="border-b pb-4 mb-6">
              <h2 className="text-xl font-semibold mb-2">系统角色说明</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li className="text-gray-700">
                  <span className="font-medium">管理员 (admin):</span> 拥有系统最高权限，可以管理所有内容。
                </li>
                <li className="text-gray-700">
                  <span className="font-medium">普通用户 (user):</span> 基础用户，权限受限，主要用于借阅图书等基本操作。
                </li>
              </ul>
            </div>
            
            {/* 渲染各模块的权限设置 */}
            {Object.entries(permissions).map(([section, permissionGroup]) => 
              renderPermissionsTable(section, permissionGroup)
            )}
            
            <div className="mt-8 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">注意事项:</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                <li>权限变更将影响系统所有用户</li>
                <li>某些关键操作仅限管理员执行，无法更改</li>
                <li>权限设置修改后立即生效</li>
              </ul>
            </div>
          </div>
        </div>
      </RoleGuard>
    </MainLayout>
  );
} 