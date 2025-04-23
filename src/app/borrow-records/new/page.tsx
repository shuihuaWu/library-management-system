import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import BorrowRecordForm from '@/components/borrow-records/BorrowRecordForm';

export const metadata = {
  title: '添加借阅记录 - 图书管理系统',
};

const NewBorrowRecordPage = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title="添加借阅记录" 
          description="创建新的借阅记录" 
        />
        <Link href="/borrow-records">
          <Button variant="outline">返回列表</Button>
        </Link>
      </div>
      
      <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
        <BorrowRecordForm />
      </div>
    </MainLayout>
  );
};

export default NewBorrowRecordPage; 