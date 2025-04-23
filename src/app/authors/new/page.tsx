import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import AuthorForm from '@/components/authors/AuthorForm';

export const metadata = {
  title: '添加作者 - 图书管理系统',
};

const NewAuthorPage = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title="添加作者" 
          description="创建新的作者记录" 
        />
        <Link href="/authors">
          <Button variant="outline">返回列表</Button>
        </Link>
      </div>
      
      <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
        <AuthorForm />
      </div>
    </MainLayout>
  );
};

export default NewAuthorPage; 