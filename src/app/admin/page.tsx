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
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">管理员控制面板</h1>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
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
              description="管理系统用户，包括授予或撤销管理员权限"
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
              title="系统设置" 
              description="管理系统设置，包括权限配置和系统参数"
              link="/admin/settings"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              } 
            />
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link href={link} className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
        查看详情
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
} 