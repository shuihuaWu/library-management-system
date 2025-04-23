import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import BookList from '@/components/books/BookList';
import Button from '@/components/ui/Button';

export const metadata = {
  title: '图书管理 - 图书管理系统',
};

const BooksPage = () => {
  return (
    <MainLayout>
      <PageTitle 
        title="图书管理" 
        description="查看和管理所有图书信息" 
        action={
          <Link href="/books/new">
            <Button variant="primary">添加图书</Button>
          </Link>
        }
      />
      
      <div className="mt-6">
        <BookList />
      </div>
    </MainLayout>
  );
};

export default BooksPage; 