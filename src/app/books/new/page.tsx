import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import BookForm from '@/components/books/BookForm';

export const metadata = {
  title: '添加图书 - 图书管理系统',
};

const NewBookPage = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title="添加图书" 
          description="创建新的图书记录" 
        />
        <Link href="/books">
          <Button variant="outline">返回列表</Button>
        </Link>
      </div>
      
      <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
        <BookForm />
      </div>
    </MainLayout>
  );
};

export default NewBookPage; 