import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import CategoryList from '@/components/categories/CategoryList';
import Button from '@/components/ui/Button';

export const metadata = {
  title: '分类管理 - 图书管理系统',
};

const CategoriesPage = () => {
  return (
    <MainLayout>
      <PageTitle 
        title="分类管理" 
        description="查看和管理所有图书分类" 
        action={
          <Link href="/categories/new">
            <Button variant="primary">添加分类</Button>
          </Link>
        }
      />
      
      <div className="mt-6">
        <CategoryList />
      </div>
    </MainLayout>
  );
};

export default CategoriesPage; 