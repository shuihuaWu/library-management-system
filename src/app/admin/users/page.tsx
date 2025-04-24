'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import RoleGuard from '@/components/auth/RoleGuard';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { UserRole } from '@/lib/types';

interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  created_at: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // 角色更新状态
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  
  const supabase = createBrowserSupabaseClient();
  
  // 获取用户总数
  const fetchTotalCount = useCallback(async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      if (searchQuery) {
        query = query.or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }
      
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      
      const { count, error } = await query;
      
      if (error) throw error;
      
      setTotalItems(count || 0);
    } catch (error) {
      console.error('获取用户总数失败', error);
    }
  }, [searchQuery, roleFilter, supabase]);
  
  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 获取总数
      await fetchTotalCount();
      
      // 计算分页参数
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      let query = supabase
        .from('profiles')
        .select('id, email, username, role, created_at')
        .range(from, to);
      
      if (searchQuery) {
        query = query.or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }
      
      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUsers(data as User[]);
    } catch (error: any) {
      setError(error.message || '获取用户列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, roleFilter, fetchTotalCount, supabase]);
  
  // 初始加载
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 处理每页条数变化
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };
  
  // 重置搜索和筛选
  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setCurrentPage(1);
  };
  
  // 更新用户角色
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUserId(userId);
      setIsUpdating(true);
      setUpdateSuccess(null);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      // 更新本地状态
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      setUpdateSuccess(`已将用户角色更新为 ${newRole}`);
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    } catch (error: any) {
      setError(`更新用户角色失败: ${error.message}`);
    } finally {
      setIsUpdating(false);
      setUpdatingUserId(null);
    }
  };
  
  return (
    <MainLayout>
      <RoleGuard allowedRoles={['admin']}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">用户管理</h1>
          </div>
          
          {/* 搜索和筛选 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索用户名或邮箱"
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div className="w-full md:w-1/4">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">所有角色</option>
                    <option value="admin">管理员</option>
                    <option value="user">普通用户</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    重置
                  </Button>
                  <Button type="submit" variant="primary">
                    搜索
                  </Button>
                </div>
              </div>
            </form>
          </div>
          
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {/* 成功提示 */}
          {updateSuccess && (
            <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">
              {updateSuccess}
            </div>
          )}
          
          {/* 用户列表 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading && users.length === 0 ? (
              <div className="text-center py-10">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-3 text-gray-600">加载中...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          邮箱
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          当前角色
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          注册时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{user.username || '未设置'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role === 'admin' ? '管理员' : '普通用户'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString('zh-CN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {updatingUserId === user.id && isUpdating ? (
                              <span>更新中...</span>
                            ) : (
                              <div className="flex space-x-2">
                                {user.role === 'admin' ? (
                                  <button
                                    onClick={() => updateUserRole(user.id, 'user')}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    降级为普通用户
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => updateUserRole(user.id, 'admin')}
                                    className="text-purple-600 hover:text-purple-900"
                                  >
                                    提升为管理员
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {users.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">没有找到符合条件的用户</p>
                  </div>
                )}
                
                <div className="px-6 py-4 border-t border-gray-200">
                  <Pagination
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </RoleGuard>
    </MainLayout>
  );
} 