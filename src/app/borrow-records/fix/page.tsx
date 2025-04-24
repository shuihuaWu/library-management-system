'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import { createBrowserSupabaseClient } from '@/lib/supabase';

interface BorrowRecord {
  id: string;
  book_id: number;
  user_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  book_title?: string;
  user_found?: boolean;
  username?: string;
  original_user_id?: string;
  clean_user_id?: string;
  id_has_spaces?: boolean;
}

const FixBorrowRecordsPage = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [users, setUsers] = useState<{id: string, username: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fixedRecords, setFixedRecords] = useState<string[]>([]);
  const [newUserIds, setNewUserIds] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = createBrowserSupabaseClient();
      
      // 获取所有借阅记录
      const { data: borrowRecords, error: recordsError } = await supabase
        .from('borrow_records')
        .select('id, book_id, user_id, borrow_date, due_date, return_date');
        
      if (recordsError) throw new Error('获取借阅记录失败: ' + recordsError.message);
      
      // 获取所有图书标题
      const bookIds = [...new Set(borrowRecords.map(r => r.book_id))];
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('id, title')
        .in('id', bookIds);
        
      if (booksError) throw new Error('获取图书信息失败: ' + booksError.message);
      
      // 创建图书ID到标题的映射
      const bookMap = new Map();
      books.forEach(book => bookMap.set(book.id, book.title));
      
      // 获取所有用户
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, username');
        
      if (usersError) throw new Error('获取用户信息失败: ' + usersError.message);
      
      setUsers(usersData || []);
      
      // 创建用户ID到用户名的映射
      const userMap = new Map();
      usersData.forEach(user => userMap.set(user.id, user.username));
      
      // 处理借阅记录，检查用户是否存在
      const processedRecords = borrowRecords.map(record => {
        // 清理用户ID中可能存在的空格
        const cleanUserId = record.user_id.trim();
        // 尝试查找用户，先用原始ID，再用清理后的ID
        let username = null;
        let userFound = false;
        
        // 先尝试原始ID
        let user = usersData.find(u => u.id === record.user_id);
        if (user) {
          username = user.username;
          userFound = true;
        } else {
          // 再尝试清理后的ID
          user = usersData.find(u => u.id === cleanUserId);
          if (user) {
            username = user.username;
            userFound = true;
          }
        }
        
        return {
          ...record,
          book_title: bookMap.get(record.book_id) || '未知图书',
          user_found: userFound,
          username: username || '未知用户',
          original_user_id: record.user_id,
          clean_user_id: cleanUserId,
          id_has_spaces: record.user_id !== cleanUserId
        };
      });
      
      // 初始化每条记录的新用户ID
      const initialUserIds: {[key: string]: string} = {};
      processedRecords.forEach(record => {
        if (!record.user_found) {
          initialUserIds[record.id] = usersData.length > 0 ? usersData[0].id : '';
        }
      });
      
      setNewUserIds(initialUserIds);
      setRecords(processedRecords);
    } catch (error: any) {
      console.error('加载数据失败', error);
      setError(error.message || '加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUserChange = (recordId: string, userId: string) => {
    setNewUserIds(prev => ({
      ...prev,
      [recordId]: userId
    }));
  };
  
  const fixRecord = async (recordId: string) => {
    try {
      const record = records.find(r => r.id === recordId);
      if (!record) {
        alert('找不到要修复的记录');
        return;
      }
      
      let userId = newUserIds[recordId];
      
      // 如果记录存在空格问题，但没有选择新用户，则使用清理后的ID
      if (record.id_has_spaces && (!userId || userId === '')) {
        userId = record.clean_user_id;
      }
      
      if (!userId) {
        alert('请选择一个有效的用户');
        return;
      }
      
      const supabase = createBrowserSupabaseClient();
      
      const { error } = await supabase
        .from('borrow_records')
        .update({ user_id: userId, updated_at: new Date().toISOString() })
        .eq('id', recordId);
        
      if (error) throw new Error(error.message);
      
      // 更新修复记录列表
      setFixedRecords(prev => [...prev, recordId]);
      
      // 更新本地记录状态
      setRecords(prev => prev.map(r => {
        if (r.id === recordId) {
          const updatedUsername = users.find(u => u.id === userId)?.username || '未知用户';
          return {
            ...r,
            user_id: userId,
            original_user_id: userId,
            clean_user_id: userId,
            id_has_spaces: false,
            username: updatedUsername,
            user_found: true
          };
        }
        return r;
      }));
      
      alert('借阅记录已更新');
    } catch (error: any) {
      console.error('修复记录失败', error);
      alert(`修复失败: ${error.message}`);
    }
  };
  
  const problemRecords = records.filter(r => !r.user_found);
  
  if (isLoading) {
    return (
      <MainLayout>
        <PageTitle title="修复借阅记录" description="正在加载数据..." />
        <div className="text-center py-10">
          <p className="text-gray-500">正在加载借阅记录...</p>
        </div>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout>
        <PageTitle title="修复借阅记录" description="加载数据时出错" />
        <div className="bg-red-50 p-4 rounded-md mt-6">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            重试
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title="修复借阅记录" 
          description={`共${records.length}条记录，其中${problemRecords.length}条存在问题`} 
        />
        <div className="flex space-x-3">
          <Link href="/borrow-records">
            <Button variant="outline">返回借阅记录</Button>
          </Link>
        </div>
      </div>
      
      {problemRecords.length === 0 ? (
        <div className="mt-6 bg-green-50 p-4 rounded-md">
          <p className="text-green-600">所有借阅记录都正常，不需要修复。</p>
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">需要修复的借阅记录</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">图书</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前用户ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">新用户</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {problemRecords.map((record) => (
                  <tr key={record.id} className={`hover:bg-gray-50 ${fixedRecords.includes(record.id) ? 'bg-green-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.book_title}</div>
                      <div className="text-xs text-gray-500">借阅日期: {new Date(record.borrow_date).toLocaleDateString('zh-CN')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600">{record.original_user_id}</div>
                      {record.id_has_spaces && (
                        <div className="text-xs text-blue-600">存在空格! 清理后: {record.clean_user_id}</div>
                      )}
                      <div className="text-xs text-gray-500">找不到此用户</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fixedRecords.includes(record.id) ? (
                        <div className="text-sm text-green-600">已修复</div>
                      ) : (
                        <select
                          value={newUserIds[record.id] || ''}
                          onChange={(e) => handleUserChange(record.id, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">请选择用户</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>{user.username}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {fixedRecords.includes(record.id) ? (
                        <span className="text-green-600">已修复</span>
                      ) : (
                        <button
                          onClick={() => fixRecord(record.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          修复
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default FixBorrowRecordsPage; 