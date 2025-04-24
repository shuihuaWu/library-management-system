'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import RoleGuard from '@/components/auth/RoleGuard';

interface StatsData {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  totalBooks: number;
  totalAuthors: number;
  totalCategories: number;
  activeLoans: number;
  completedLoans: number;
  overdueLoans: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const supabase = createBrowserSupabaseClient();
        
        // 获取用户统计
        const { count: totalUsers, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;
        
        // 获取管理员用户数量
        const { count: adminUsers, error: adminError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin');
        
        if (adminError) throw adminError;
        
        // 获取图书总数
        const { count: totalBooks, error: booksError } = await supabase
          .from('books')
          .select('*', { count: 'exact', head: true });
        
        if (booksError) throw booksError;
        
        // 获取作者总数
        const { count: totalAuthors, error: authorsError } = await supabase
          .from('authors')
          .select('*', { count: 'exact', head: true });
        
        if (authorsError) throw authorsError;
        
        // 获取分类总数
        const { count: totalCategories, error: categoriesError } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true });
        
        if (categoriesError) throw categoriesError;
        
        // 获取借阅记录统计
        // 活跃借阅（未归还）
        const { count: activeLoans, error: activeLoansError } = await supabase
          .from('borrow_records')
          .select('*', { count: 'exact', head: true })
          .is('return_date', null);
        
        if (activeLoansError) throw activeLoansError;
        
        // 已完成借阅（已归还）
        const { count: completedLoans, error: completedLoansError } = await supabase
          .from('borrow_records')
          .select('*', { count: 'exact', head: true })
          .not('return_date', 'is', null);
        
        if (completedLoansError) throw completedLoansError;
        
        // 逾期借阅（未归还且已超过应还日期）
        const today = new Date().toISOString().split('T')[0];
        const { count: overdueLoans, error: overdueLoansError } = await supabase
          .from('borrow_records')
          .select('*', { count: 'exact', head: true })
          .is('return_date', null)
          .lt('due_date', today);
        
        if (overdueLoansError) throw overdueLoansError;
        
        // 整合所有统计数据
        setStats({
          totalUsers: totalUsers || 0,
          adminUsers: adminUsers || 0,
          regularUsers: (totalUsers || 0) - (adminUsers || 0),
          totalBooks: totalBooks || 0,
          totalAuthors: totalAuthors || 0,
          totalCategories: totalCategories || 0,
          activeLoans: activeLoans || 0,
          completedLoans: completedLoans || 0,
          overdueLoans: overdueLoans || 0
        });
      } catch (error: any) {
        console.error('获取统计数据失败:', error);
        setError(error.message || '获取统计数据时出错');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  // 渲染统计卡片
  const renderStatCard = (title: string, value: number, icon: React.ReactNode, color: string) => {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${color}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-100')}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <MainLayout>
      <RoleGuard allowedRoles={['admin']}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">系统统计</h1>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-3 text-gray-600">加载统计数据中...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
              {error}
            </div>
          ) : stats && (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">用户统计</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderStatCard('总用户数', stats.totalUsers, 
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>,
                    'border-blue-600'
                  )}
                  
                  {renderStatCard('管理员', stats.adminUsers, 
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>,
                    'border-purple-600'
                  )}
                  
                  {renderStatCard('普通用户', stats.regularUsers, 
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>,
                    'border-green-600'
                  )}
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">内容统计</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderStatCard('图书总数', stats.totalBooks, 
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>,
                    'border-indigo-600'
                  )}
                  
                  {renderStatCard('作者数量', stats.totalAuthors, 
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>,
                    'border-yellow-600'
                  )}
                  
                  {renderStatCard('分类数量', stats.totalCategories, 
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>,
                    'border-pink-600'
                  )}
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">借阅统计</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderStatCard('当前借出', stats.activeLoans, 
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>,
                    'border-blue-600'
                  )}
                  
                  {renderStatCard('已归还', stats.completedLoans, 
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>,
                    'border-green-600'
                  )}
                  
                  {renderStatCard('逾期未还', stats.overdueLoans, 
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>,
                    'border-red-600'
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">系统概览</h2>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <span className="text-gray-600 md:w-1/3">用户借阅比例:</span>
                    <div className="mt-2 md:mt-0 flex-1">
                      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${stats.totalUsers > 0 ? (stats.activeLoans / stats.totalUsers * 100).toFixed(2) : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{stats.totalUsers > 0 ? (stats.activeLoans / stats.totalUsers * 100).toFixed(2) : 0}% 的用户当前有借阅</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center">
                    <span className="text-gray-600 md:w-1/3">图书借出率:</span>
                    <div className="mt-2 md:mt-0 flex-1">
                      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${stats.totalBooks > 0 ? (stats.activeLoans / stats.totalBooks * 100).toFixed(2) : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{stats.totalBooks > 0 ? (stats.activeLoans / stats.totalBooks * 100).toFixed(2) : 0}% 的图书当前被借出</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center">
                    <span className="text-gray-600 md:w-1/3">逾期率:</span>
                    <div className="mt-2 md:mt-0 flex-1">
                      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500" 
                          style={{ width: `${stats.activeLoans > 0 ? (stats.overdueLoans / stats.activeLoans * 100).toFixed(2) : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{stats.activeLoans > 0 ? (stats.overdueLoans / stats.activeLoans * 100).toFixed(2) : 0}% 的当前借阅已逾期</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </RoleGuard>
    </MainLayout>
  );
} 