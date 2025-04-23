import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import CategoryForm from '@/components/categories/CategoryForm';

export const metadata = {
  title: '添加分类 - 图书管理系统',
};

const NewCategoryPage = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title="添加分类" 
          description="创建新的图书分类" 
        />
        <Link href="/categories">
          <Button variant="outline">返回列表</Button>
        </Link>
      </div>
      
      <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
        <CategoryForm />
      </div>
    </MainLayout>
  );
};

export default NewCategoryPage; 