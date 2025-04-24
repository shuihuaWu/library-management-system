'use client';

import React from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuthContext } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function AdminPage() {
  const { user } = useAuthContext();

  return (
    <MainLayout>
      <RoleGuard allowedRoles={['admin']}>
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">管理员控制面板</h1>
          
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">管理员信息</h2>
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {user?.id}</p>
              <p><span className="font-medium">用户名:</span> {user?.username}</p>
              <p><span className="font-medium">邮箱:</span> {user?.email}</p>
              <p><span className="font-medium">角色:</span> {user?.role}</p>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminCard 
              title="用户管理" 
              description="管理系统用户，包括查看用户列表和调整用户角色"
              link="/admin/users"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } 
            />
            
            <AdminCard 
              title="系统统计" 
              description="查看系统统计信息，包括图书、作者、分类和借阅记录的数量"
              link="/admin/stats"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              } 
            />
            
            <AdminCard 
              title="权限设置" 
              description="配置系统角色权限，设置不同用户角色可执行的操作范围"
              link="/admin/settings"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              } 
            />
            
            <AdminCard 
              title="图书管理" 
              description="查看和管理系统中的所有图书，包括添加、编辑和删除操作"
              link="/books"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              } 
            />
            
            <AdminCard 
              title="借阅记录" 
              description="管理所有借阅记录，查看借阅状态和处理归还请求"
              link="/borrow-records"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              } 
            />
            
            <AdminCard 
              title="操作日志" 
              description="查看系统操作日志，追踪用户活动和重要操作"
              link="/admin/logs"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } 
            />
          </div>
          
          <div className="mt-8 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-800">管理员提示</h3>
                <p className="text-sm text-blue-600 mt-1">
                  作为管理员，您可以管理所有系统资源，请谨慎操作，特别是涉及用户权限和数据删除的操作。
                </p>
              </div>
            </div>
          </div>
        </div>
      </RoleGuard>
    </MainLayout>
  );
}

interface AdminCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
}

function AdminCard({ title, description, link, icon }: AdminCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4 h-12">{description}</p>
      <Link href={link} className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
        查看详情
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
} 