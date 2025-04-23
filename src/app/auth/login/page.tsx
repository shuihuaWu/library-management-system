import React from 'react';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';

export const metadata = {
  title: '登录 - 图书管理系统',
};

const LoginPage = () => {
  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-8">
        <PageTitle 
          title="登录系统" 
          description="请输入您的账号和密码登录系统" 
        />
        
        <div className="bg-white shadow-sm rounded-lg p-6 mt-6">
          <LoginForm />
          
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              还没有账号？{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                注册新账号
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage; 