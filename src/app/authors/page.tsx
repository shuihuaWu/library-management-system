import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import AuthorList from '@/components/authors/AuthorList';
import Button from '@/components/ui/Button';

export const metadata = {
  title: '作者管理 - 图书管理系统',
};

const AuthorsPage = () => {
  return (
    <MainLayout>
      <PageTitle 
        title="作者管理" 
        description="查看和管理所有作者信息" 
        action={
          <Link href="/authors/new">
            <Button variant="primary">添加作者</Button>
          </Link>
        }
      />
      
      <div className="mt-6">
        <AuthorList />
      </div>
    </MainLayout>
  );
};

export default AuthorsPage; 