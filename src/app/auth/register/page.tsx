import React from 'react';
import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';

export const metadata = {
  title: '注册 - 图书管理系统',
};

const RegisterPage = () => {
  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-8">
        <PageTitle 
          title="注册账号" 
          description="创建新的账号以使用图书管理系统" 
        />
        
        <div className="bg-white shadow-sm rounded-lg p-6 mt-6">
          <RegisterForm />
          
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              已有账号？{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage; 