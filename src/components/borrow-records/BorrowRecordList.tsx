 'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import Button from '@/components/ui/Button';

interface BorrowRecord {
  id: string;
  book: {
    id: number;
    title: string;
    author: {
      id: number;
      name: string;
    };
  };
  user: {
    id: string;
    username: string;
  };
  borrow_date: string;
  due_date: string;
  return_date: string | null;
}

const BorrowRecordList = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');

  useEffect(() => {
    fetchBorrowRecords();
  }, []);

  const fetchBorrowRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createBrowserSupabaseClient();
      
      // 修改查询，避免使用不存在的关系
      const { data, error } = await supabase
        .from('borrow_records')
        .select(`
          id, 
          borrow_date, 
          due_date, 
          return_date,
          book_id,
          user_id
        `)
        .order('borrow_date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        setRecords([]);
        return;
      }

      // 获取所有相关的图书信息
      const bookIds = [...new Set(data.map(record => record.book_id))];
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select(`
          id,
          title,
          author_id
        `)
        .in('id', bookIds);

      if (booksError) {
        throw new Error(booksError.message);
      }

      // 获取所有相关的作者信息
      if (books && books.length > 0) {
        const authorIds = [...new Set(books.map(book => book.author_id))];
        const { data: authors, error: authorsError } = await supabase
          .from('authors')
          .select('id, name')
          .in('id', authorIds);

        if (authorsError) {
          throw new Error(authorsError.message);
        }

        // 添加作者信息到书籍
        const booksWithAuthors = books.map(book => {
          const author = authors?.find(a => a.id === book.author_id) || { id: 0, name: '未知作者' };
          return {
            ...book,
            author: {
              id: author.id,
              name: author.name
            }
          };
        });

        // 获取所有相关的用户信息
        const userIds = [...new Set(data.map(record => record.user_id))];
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (usersError) {
          console.log('获取用户信息失败:', usersError);
        }

        // 用户信息可能不存在，创建查找映射
        const userMap = new Map();
        if (users && users.length > 0) {
          users.forEach(user => {
            if (user && user.id) {
              userMap.set(user.id, user.username);
              // 同时添加去除空格后的ID映射，以防ID有空格问题
              userMap.set(user.id.trim(), user.username);
            }
          });
        }

        // 将数据组合在一起
        const processedRecords = data.map(record => {
          const book = booksWithAuthors.find(b => b.id === record.book_id) || { 
            id: record.book_id, 
            title: '未知图书',
            author: { id: 0, name: '未知作者' }
          };
          
          // 用户可能不存在，添加默认显示
          // 尝试使用去除空格后的ID查找用户
          const cleanUserId = record.user_id.trim();
          const username = userMap.get(cleanUserId) || userMap.get(record.user_id) || '用户' + cleanUserId.substring(0, 8);
          
          return {
            id: String(record.id),
            borrow_date: record.borrow_date,
            due_date: record.due_date,
            return_date: record.return_date,
            book: {
              id: book.id,
              title: book.title,
              author: book.author
            },
            user: {
              id: cleanUserId, // 使用去除空格后的ID
              username: username
            }
          };
        });

        setRecords(processedRecords);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('获取借阅记录失败', error);
      setError('加载借阅记录时出错');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value as any);
  };

  const isOverdue = (record: BorrowRecord) => {
    if (record.return_date) return false;
    
    const today = new Date();
    const dueDate = new Date(record.due_date);
    
    return today > dueDate;
  };

  const getFilteredRecords = () => {
    // 先根据搜索条件过滤
    let filtered = records.filter(record => 
      record.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.book.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // 再根据状态过滤
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(record => !record.return_date);
      } else if (filterStatus === 'returned') {
        filtered = filtered.filter(record => !!record.return_date);
      } else if (filterStatus === 'overdue') {
        filtered = filtered.filter(record => isOverdue(record));
      }
    }
    
    return filtered;
  };

  const getStatusBadge = (record: BorrowRecord) => {
    if (record.return_date) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          已归还 ({new Date(record.return_date).toLocaleDateString('zh-CN')})
        </span>
      );
    } else if (isOverdue(record)) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          已逾期 ({new Date(record.due_date).toLocaleDateString('zh-CN')})
        </span>
      );
    } else {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          借阅中 (截止 {new Date(record.due_date).toLocaleDateString('zh-CN')})
        </span>
      );
    }
  };

  const handleReturnBook = async (recordId: string) => {
    try {
      console.log('归还图书ID:', recordId);
      const supabase = createBrowserSupabaseClient();
      
      // 更新借阅记录，添加归还日期
      const { error: recordError } = await supabase
        .from('borrow_records')
        .update({ 
          return_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId);

      if (recordError) throw new Error(recordError.message);
      
      // 获取关联的图书ID
      const { data: recordData, error: getRecordError } = await supabase
        .from('borrow_records')
        .select('book_id')
        .eq('id', recordId)
        .single();
        
      if (getRecordError) throw new Error(getRecordError.message);
      
      // 更新图书状态
      const { error: bookError } = await supabase
        .from('books')
        .update({ 
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', recordData.book_id);
        
      if (bookError) throw new Error(bookError.message);
      
      // 重新获取借阅记录列表
      fetchBorrowRecords();
    } catch (error) {
      console.error('归还图书失败', error);
      alert('归还图书失败，请稍后再试');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">正在加载借阅记录...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchBorrowRecords}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          重试
        </button>
      </div>
    );
  }

  const filteredRecords = getFilteredRecords();

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="md:flex-1">
          <input
            type="text"
            placeholder="搜索图书、作者或用户"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:w-48">
          <select
            value={filterStatus}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">所有记录</option>
            <option value="active">借阅中</option>
            <option value="returned">已归还</option>
            <option value="overdue">已逾期</option>
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">没有找到符合条件的借阅记录</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  图书
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  借阅人
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  借阅日期
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <Link href={`/books/${record.book.id}`} className="hover:text-blue-600 hover:underline">
                        {record.book.title}
                      </Link>
                    </div>
                    <div className="text-xs text-gray-500">
                      作者: 
                      <Link 
                        href={`/authors/${record.book.author.id}`} 
                        className="ml-1 text-blue-600 hover:underline"
                      >
                        {record.book.author.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.borrow_date).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {!record.return_date && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleReturnBook(String(record.id))}
                        >
                          归还
                        </Button>
                      )}
                      <Link href={`/borrow-records/${record.id}`}>
                        <Button variant="outline" size="sm">查看</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BorrowRecordList;