import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BorrowRecordPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: BorrowRecordPageProps) {
  const resolvedParams = await params;
  return {
    title: `借阅记录详情 - 图书管理系统`,
  };
}

const BorrowRecordPage = async ({ params }: BorrowRecordPageProps) => {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  console.log('借阅记录ID:', id); // 调试日志
  
  const supabase = createServerClient();
  
  // 简化查询，先获取基本借阅记录
  const { data: borrowRecord, error: borrowError } = await supabase
    .from('borrow_records')
    .select('*')
    .eq('id', id)
    .single();
    
  if (borrowError || !borrowRecord) {
    console.error('获取借阅记录失败:', borrowError);
    notFound();
  }
  
  // 获取图书信息
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('id, title, isbn, publisher, author:author_id(id, name)')
    .eq('id', borrowRecord.book_id)
    .single();
    
  if (bookError) {
    console.error('获取图书信息失败:', bookError);
  }
  
  // 修改查询方式，使用与BorrowRecordList组件相同的方式获取数据
  // 获取指定用户信息，而不是所有用户
  let user = null; // 确保在使用前定义user变量
  console.log('准备查询用户信息，借阅记录用户ID:', borrowRecord.user_id);
  
  // 清理用户ID（去除可能的空格）
  const cleanUserId = borrowRecord.user_id.trim();
  
  // 使用与BorrowRecordList相同的查询方式 - 只查询特定用户
  const { data: users, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', [borrowRecord.user_id, cleanUserId]); // 同时查询原始ID和清理后的ID
  
  console.log('用户查询结果:', users ? `成功获取${users.length}条记录` : '无数据', 
              '错误:', profilesError ? JSON.stringify(profilesError) : '无');

  if (profilesError) {
    console.error('获取用户信息失败:', profilesError);
  }

  // 使用映射表存储用户ID和用户名的对应关系
  const userMap = new Map();
  if (users && users.length > 0) {
    console.log(`找到 ${users.length} 个匹配用户`);
    
    users.forEach(profile => {
      if (profile && profile.id) {
        userMap.set(profile.id, profile.username);
        // 同时添加去除空格后的ID映射，以防ID有空格问题
        userMap.set(profile.id.trim(), profile.username);
      }
    });
    
    // 检查我们要查找的用户ID是否在映射表中
    const username = userMap.get(cleanUserId) || userMap.get(borrowRecord.user_id);
    console.log('从映射表中查找用户:', borrowRecord.user_id, '清理后ID:', cleanUserId, '结果:', username);
    
    if (username) {
      user = { id: cleanUserId, username };
    }
  }
  
  // 合并数据
  const record = {
    ...borrowRecord,
    book: book || { id: borrowRecord.book_id, title: '未知图书', author: { id: 0, name: '未知作者' } },
    user: user || { 
      id: cleanUserId, 
      username: userMap.get(cleanUserId) || userMap.get(borrowRecord.user_id) || '用户' + cleanUserId.substring(0, 8)
    }
  };

  const isOverdue = () => {
    if (record.return_date) return false;
    
    const today = new Date();
    const dueDate = new Date(record.due_date);
    
    return today > dueDate;
  };

  const getStatusBadge = () => {
    if (record.return_date) {
      return (
        <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          已归还 ({new Date(record.return_date).toLocaleDateString('zh-CN')})
        </span>
      );
    } else if (isOverdue()) {
      return (
        <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          已逾期 ({new Date(record.due_date).toLocaleDateString('zh-CN')})
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          借阅中 (截止 {new Date(record.due_date).toLocaleDateString('zh-CN')})
        </span>
      );
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title="借阅记录详情"
          description={`记录ID: ${record.id}`}
        />
        <div className="flex space-x-3">
          <Link href="/borrow-records">
            <Button variant="outline">返回列表</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">借阅信息</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">借阅记录的详细信息</p>
          </div>
          <div>
            {getStatusBadge()}
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">图书</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link href={`/books/${record.book.id}`} className="text-blue-600 hover:underline">
                  {record.book.title}
                </Link>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">作者</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Link href={`/authors/${record.book.author.id}`} className="text-blue-600 hover:underline">
                  {record.book.author.name}
                </Link>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ISBN</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{record.book.isbn || '暂无'}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">出版社</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{record.book.publisher || '暂无'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">借阅人</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {record.user.username}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">借阅日期</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(record.borrow_date).toLocaleDateString('zh-CN')}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">应还日期</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(record.due_date).toLocaleDateString('zh-CN')}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">归还日期</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {record.return_date ? new Date(record.return_date).toLocaleDateString('zh-CN') : '未归还'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">借阅时长</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {record.return_date ? 
                  `${Math.ceil((new Date(record.return_date).getTime() - new Date(record.borrow_date).getTime()) / (1000 * 60 * 60 * 24))}天` : 
                  `已借阅${Math.ceil((new Date().getTime() - new Date(record.borrow_date).getTime()) / (1000 * 60 * 60 * 24))}天`
                }
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </MainLayout>
  );
};

export default BorrowRecordPage; 