'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import RoleGuard from '@/components/auth/RoleGuard';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';

interface LogEntry {
  id: number;
  created_at: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
}

// 日志操作类型
const LOG_ACTIONS = {
  CREATE: '创建',
  UPDATE: '更新',
  DELETE: '删除',
  LOGIN: '登录',
  LOGOUT: '登出',
  BORROW: '借阅',
  RETURN: '归还',
  OVERDUE: '逾期',
  ROLE_CHANGE: '角色变更',
};

// 资源类型
const RESOURCE_TYPES = {
  BOOK: '图书',
  AUTHOR: '作者',
  CATEGORY: '分类',
  USER: '用户',
  BORROW_RECORD: '借阅记录',
};

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选状态
  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceFilter, setResourceFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [userSearch, setUserSearch] = useState('');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const supabase = createBrowserSupabaseClient();
  
  // 获取日志总数
  const fetchTotalCount = useCallback(async () => {
    try {
      let query = supabase
        .from('system_logs')
        .select('id', { count: 'exact', head: true });
      
      // 应用筛选条件
      if (actionFilter) {
        query = query.eq('action', actionFilter);
      }
      
      if (resourceFilter) {
        query = query.eq('resource_type', resourceFilter);
      }
      
      if (dateRange.start) {
        query = query.gte('created_at', dateRange.start);
      }
      
      if (dateRange.end) {
        query = query.lte('created_at', `${dateRange.end}T23:59:59`);
      }
      
      if (userSearch) {
        query = query.ilike('user_email', `%${userSearch}%`);
      }
      
      const { count, error } = await query;
      
      if (error) throw error;
      
      setTotalItems(count || 0);
    } catch (error) {
      console.error('获取日志总数失败', error);
    }
  }, [actionFilter, resourceFilter, dateRange, userSearch, supabase]);
  
  // 获取日志数据
  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 获取总数
      await fetchTotalCount();
      
      // 计算分页参数
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      let query = supabase
        .from('system_logs')
        .select('*')
        .range(from, to);
      
      // 应用筛选条件
      if (actionFilter) {
        query = query.eq('action', actionFilter);
      }
      
      if (resourceFilter) {
        query = query.eq('resource_type', resourceFilter);
      }
      
      if (dateRange.start) {
        query = query.gte('created_at', dateRange.start);
      }
      
      if (dateRange.end) {
        query = query.lte('created_at', `${dateRange.end}T23:59:59`);
      }
      
      if (userSearch) {
        query = query.ilike('user_email', `%${userSearch}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (error: any) {
      console.error('获取日志数据失败', error);
      setError(error.message || '获取日志数据时发生错误');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, actionFilter, resourceFilter, dateRange, userSearch, fetchTotalCount, supabase]);
  
  // 初始加载
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  
  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 处理每页条数变化
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  
  // 处理搜索和筛选
  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };
  
  // 重置筛选条件
  const resetFilters = () => {
    setActionFilter('');
    setResourceFilter('');
    setDateRange({ start: '', end: '' });
    setUserSearch('');
    setCurrentPage(1);
  };
  
  // 格式化操作类型显示
  const formatAction = (action: string) => {
    return LOG_ACTIONS[action as keyof typeof LOG_ACTIONS] || action;
  };
  
  // 格式化资源类型显示
  const formatResourceType = (type: string) => {
    return RESOURCE_TYPES[type as keyof typeof RESOURCE_TYPES] || type;
  };
  
  // 获取日志详情的摘要
  const getDetailsSummary = (details: any) => {
    if (!details) return '无详情';
    
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch {
        return details.substring(0, 50) + (details.length > 50 ? '...' : '');
      }
    }
    
    // 处理不同类型的日志详情
    if (details.changes) {
      return `字段变更: ${Object.keys(details.changes).join(', ')}`;
    }
    
    if (details.message) {
      return details.message;
    }
    
    return JSON.stringify(details).substring(0, 50) + '...';
  };
  
  return (
    <MainLayout>
      <RoleGuard allowedRoles={['admin']}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">系统操作日志</h1>
          </div>
          
          {/* 筛选表单 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <form onSubmit={handleFilter} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="actionFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    操作类型
                  </label>
                  <select
                    id="actionFilter"
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">全部操作</option>
                    {Object.entries(LOG_ACTIONS).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="resourceFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    资源类型
                  </label>
                  <select
                    id="resourceFilter"
                    value={resourceFilter}
                    onChange={(e) => setResourceFilter(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">全部资源</option>
                    {Object.entries(RESOURCE_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    开始日期
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    结束日期
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="userSearch" className="block text-sm font-medium text-gray-700 mb-1">
                    用户邮箱
                  </label>
                  <input
                    type="text"
                    id="userSearch"
                    placeholder="搜索用户邮箱"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                
                <div className="flex items-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    重置
                  </Button>
                  <Button type="submit" variant="primary">
                    筛选
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
          
          {/* 日志表格 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading && logs.length === 0 ? (
              <div className="text-center py-10">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-3 text-gray-600">加载日志数据中...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          资源类型
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          资源ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          详情
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString('zh-CN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{log.user_email}</div>
                            <div className="text-xs text-gray-500">{log.user_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                              log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                              log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                              log.action === 'LOGIN' ? 'bg-purple-100 text-purple-800' :
                              log.action === 'LOGOUT' ? 'bg-gray-100 text-gray-800' :
                              log.action === 'BORROW' ? 'bg-yellow-100 text-yellow-800' :
                              log.action === 'RETURN' ? 'bg-indigo-100 text-indigo-800' :
                              log.action === 'OVERDUE' ? 'bg-orange-100 text-orange-800' :
                              log.action === 'ROLE_CHANGE' ? 'bg-pink-100 text-pink-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {formatAction(log.action)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatResourceType(log.resource_type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.resource_id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {getDetailsSummary(log.details)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {logs.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">没有找到符合条件的日志记录</p>
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
          
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">关于系统日志</h3>
            <p className="text-gray-600 text-sm">
              系统日志记录了所有重要操作，包括用户登录、图书管理、借阅操作和权限变更等。管理员可以通过日志追踪系统变更和审计用户行为。
            </p>
          </div>
        </div>
      </RoleGuard>
    </MainLayout>
  );
} 