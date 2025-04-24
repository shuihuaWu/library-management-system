'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';

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
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // 保存所有记录，用于客户端筛选
  const [allRecords, setAllRecords] = useState<BorrowRecord[]>([]);

  // 获取借阅记录
  const fetchBorrowRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createBrowserSupabaseClient();
      
      // 执行查询，获取所有记录
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
        console.log('未找到借阅记录');
        setAllRecords([]);
        setRecords([]);
        setTotalItems(0);
        return;
      }

      console.log(`查询到 ${data.length} 条借阅记录`);

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

        // 保存所有记录，用于本地筛选
        setAllRecords(processedRecords);
        
        // 初始筛选和分页
        updateDisplayedRecords(processedRecords);
      } else {
        setAllRecords([]);
        setRecords([]);
        setTotalItems(0);
      }
    } catch (error) {
      setError('加载借阅记录时出错');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchBorrowRecords();
  }, [fetchBorrowRecords]);
  
  // 当筛选条件变化时更新显示的记录
  useEffect(() => {
    console.log('筛选条件变化，重新过滤记录', {
      searchQuery,
      filterStatus,
      currentPage,
      itemsPerPage
    });
    updateDisplayedRecords(allRecords);
  }, [searchQuery, filterStatus, currentPage, itemsPerPage, allRecords]);

  // 更新要显示的记录
  const updateDisplayedRecords = (allRecs: BorrowRecord[]) => {
    // 应用搜索和状态筛选
    let filtered = allRecs.filter(record => 
      record.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.book.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // 应用状态筛选
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(record => !record.return_date);
      } else if (filterStatus === 'returned') {
        filtered = filtered.filter(record => !!record.return_date);
      } else if (filterStatus === 'overdue') {
        filtered = filtered.filter(record => isOverdue(record));
      }
    }
    
    // 更新总数
    console.log(`筛选后共有 ${filtered.length} 条记录`);
    setTotalItems(filtered.length);
    
    // 应用分页
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    console.log(`分页参数: 当前页=${currentPage}, 每页条数=${itemsPerPage}, 起始索引=${startIndex}, 结束索引=${endIndex}`);
    
    const paginatedRecords = filtered.slice(startIndex, endIndex);
    
    console.log(`当前第 ${currentPage} 页，每页 ${itemsPerPage} 条，显示 ${paginatedRecords.length} 条记录`);
    setRecords(paginatedRecords);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // 重置为第一页
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value as any);
    setCurrentPage(1); // 重置为第一页
  };
  
  // 处理页码变化
  const handlePageChange = (page: number) => {
    console.log('页码变化:', page);
    setCurrentPage(page);
  };

  const isOverdue = (record: BorrowRecord) => {
    if (record.return_date) return false;
    
    const today = new Date();
    const dueDate = new Date(record.due_date);
    
    return today > dueDate;
  };

  // 用于状态显示的徽章组件
  const getStatusBadge = (record: BorrowRecord) => {
    if (record.return_date) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          已归还 ({new Date(record.return_date).toLocaleDateString()})
        </span>
      );
    }
    
    if (isOverdue(record)) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          已逾期 ({Math.floor((new Date().getTime() - new Date(record.due_date).getTime()) / (1000 * 60 * 60 * 24))}天)
        </span>
      );
    }
    
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        借阅中 (还剩{Math.max(0, Math.floor((new Date(record.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}天)
      </span>
    );
  };

  const handleReturnBook = async (recordId: string) => {
    if (!window.confirm('确认归还该图书？')) {
      return;
    }
    
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 更新借阅记录的归还日期为当前日期
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('borrow_records')
        .update({ return_date: today })
        .eq('id', recordId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // 将相应图书状态更新为可借阅
      const record = records.find(r => r.id === recordId);
      if (record) {
        const { error: bookError } = await supabase
          .from('books')
          .update({ status: 'available' })
          .eq('id', record.book.id);
        
        if (bookError) {
          console.error('更新图书状态失败:', bookError);
        }
      }
      
      // 刷新借阅记录列表
      await fetchBorrowRecords();
      
    } catch (error) {
      console.error('归还图书失败', error);
      alert('归还图书失败，请重试');
    }
  };

  // 修复每页条数变化的处理函数
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    console.log(`每页条数变化: ${itemsPerPage} -> ${newItemsPerPage}`);
    
    // 直接使用allRecords的当前值，而不依赖状态
    const currentAllRecords = [...allRecords];
    const currentSearchQuery = searchQuery;
    const currentFilterStatus = filterStatus;
    
    // 先更新状态
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 重置到第一页
    
    // 立即应用筛选和分页，不依赖于useEffect
    console.log('立即使用新的每页条数更新显示记录');
    
    // 复制updateDisplayedRecords的逻辑，但使用新的每页条数和保存的当前变量
    // 应用搜索和状态筛选
    let filtered = currentAllRecords.filter(record => 
      record.book.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
      record.book.author.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
      record.user.username.toLowerCase().includes(currentSearchQuery.toLowerCase())
    );
    
    // 应用状态筛选
    if (currentFilterStatus !== 'all') {
      if (currentFilterStatus === 'active') {
        filtered = filtered.filter(record => !record.return_date);
      } else if (currentFilterStatus === 'returned') {
        filtered = filtered.filter(record => !!record.return_date);
      } else if (currentFilterStatus === 'overdue') {
        filtered = filtered.filter(record => isOverdue(record));
      }
    }
    
    // 更新总数
    console.log(`筛选后共有 ${filtered.length} 条记录`);
    setTotalItems(filtered.length);
    
    // 应用分页
    const startIndex = 0; // 第一页的起始索引
    const endIndex = newItemsPerPage;
    console.log(`分页参数: 当前页=1, 每页条数=${newItemsPerPage}, 起始索引=${startIndex}, 结束索引=${endIndex}`);
    
    const paginatedRecords = filtered.slice(startIndex, endIndex);
    
    console.log(`当前第 1 页，每页 ${newItemsPerPage} 条，显示 ${paginatedRecords.length} 条记录`);
    setRecords(paginatedRecords);
  };

  if (isLoading && records.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3 text-muted-foreground">正在加载借阅记录...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md animate-fadeIn">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={() => fetchBorrowRecords()}
          className="mt-2 text-sm text-primary hover:underline"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 筛选控件 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索图书、作者或用户"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200"
          />
        </div>
        <div className="md:w-64">
          <select
            value={filterStatus}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-secondary transition-colors duration-200"
          >
            <option value="all">所有状态</option>
            <option value="active">借阅中</option>
            <option value="returned">已归还</option>
            <option value="overdue">已逾期</option>
          </select>
        </div>
      </div>

      {/* 记录列表 */}
      {records.length === 0 ? (
        <div className="text-center py-10 bg-secondary rounded-md">
          <p className="text-muted-foreground">没有找到符合条件的借阅记录</p>
          <Link href="/borrow-records/new">
            <Button variant="primary" className="mt-4">
              添加借阅记录
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* 使用表格显示借阅记录 */}
          <div className="bg-white dark:bg-secondary shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">图书</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">借阅人</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">借阅日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">应还日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-secondary divide-y divide-border">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-muted transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{record.book.title}</div>
                        <div className="text-xs text-muted-foreground">作者: {record.book.author.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {record.user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(record.borrow_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(record.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(record)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!record.return_date && (
                          <button
                            onClick={() => handleReturnBook(record.id)}
                            className="text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            归还
                          </button>
                        )}
                        <Link
                          href={`/borrow-records/${record.id}`}
                          className="ml-2 text-foreground bg-secondary hover:bg-muted px-3 py-1 rounded-md transition-colors duration-200"
                        >
                          详情
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 分页组件 */}
            <div className="px-6 pb-4">
              <Pagination
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BorrowRecordList;