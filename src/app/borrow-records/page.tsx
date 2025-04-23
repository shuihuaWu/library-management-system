import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import BorrowRecordList from '@/components/borrow-records/BorrowRecordList';
import Button from '@/components/ui/Button';

export const metadata = {
  title: '借阅记录 - 图书管理系统',
};

const BorrowRecordsPage = () => {
  return (
    <MainLayout>
      <PageTitle 
        title="借阅记录" 
        description="查看和管理所有借阅记录" 
        action={
          <div className="flex space-x-2">
            <Link href="/borrow-records/fix">
              <Button variant="secondary">修复数据</Button>
            </Link>
            <Link href="/borrow-records/new">
              <Button variant="primary">添加借阅记录</Button>
            </Link>
          </div>
        }
      />
      
      <div className="mt-6">
        <BorrowRecordList />
      </div>
    </MainLayout>
  );
};

export default BorrowRecordsPage; 