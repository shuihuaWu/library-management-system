'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';

interface Author {
  id: number;
  name: string;
  biography: string | null;
  book_count: number;
}

const AuthorList = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 每页显示10个作者，适合3列布局

  // 获取作者总数的函数
  const fetchTotalCount = useCallback(async (query = searchQuery) => {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 构建查询
      let baseQuery = supabase
        .from('authors')
        .select('id', { count: 'exact', head: true });
      
      // 如果有搜索条件，添加过滤
      if (query) {
        baseQuery = baseQuery.ilike('name', `%${query}%`);
      }
      
      // 执行查询
      const { count, error } = await baseQuery;
      
      if (error) {
        throw error;
      }
      
      setTotalItems(count || 0);
    } catch (error) {
      console.error('获取作者总数失败', error);
    }
  }, [searchQuery]);

  // 获取作者数据的函数
  const fetchAuthors = useCallback(async (page = currentPage, query = searchQuery) => {
    try {
      setIsLoading(true);
      setError(null);

      // 获取总数
      await fetchTotalCount(query);
      
      // 计算分页参数
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;


      const supabase = createBrowserSupabaseClient();
      
      // 构建查询
      let baseQuery = supabase
        .from('authors')
        .select(`
          id, 
          name, 
          biography,
          books:books(count)
        `)
        .range(from, to);
      
      // 如果有搜索条件，添加过滤
      if (query) {
        baseQuery = baseQuery.ilike('name', `%${query}%`);
      }
      
      // 执行查询
      const { data, error } = await baseQuery.order('name');

      if (error) {
        throw new Error(error.message);
      }

      // 处理数据，提取图书数量
      const processedData = data?.map(author => ({
        id: author.id,
        name: author.name,
        biography: author.biography,
        book_count: author.books[0]?.count || 0
      })) || [];

      setAuthors(processedData);
    } catch (error) {
      console.error('获取作者数据失败', error);
      setError('加载作者数据时出错');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, fetchTotalCount]);

  // 初始加载
  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAuthors(page);
  };

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // 重置为第一页
    fetchAuthors(1, query); // 搜索
  };

  // 修复每页条数变化的处理函数
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    // 保存当前的搜索条件，以便在状态更新后使用
    const currentSearchQuery = searchQuery;
    
    // 先更新状态
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 重置到第一页
    
    // 使用当前的查询条件和新的每页条数直接计算分页参数
    const from = 0; // 第一页的起始索引
    const to = newItemsPerPage - 1;
    
    
    // 直接使用supabase查询，而不通过useCallback包装的函数
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const supabase = createBrowserSupabaseClient();
        
        // 获取总数
        let countQuery = supabase
          .from('authors')
          .select('id', { count: 'exact', head: true });
        
        // 如果有搜索条件，添加过滤
        if (currentSearchQuery) {
          countQuery = countQuery.ilike('name', `%${currentSearchQuery}%`);
        }
        
        const { count, error: countError } = await countQuery;
        
        if (countError) {
          throw countError;
        }
        
        setTotalItems(count || 0);
        
        // 构建查询
        let baseQuery = supabase
          .from('authors')
          .select(`
            id, 
            name, 
            biography,
            books:books(count)
          `)
          .range(from, to);
        
        // 如果有搜索条件，添加过滤
        if (currentSearchQuery) {
          baseQuery = baseQuery.ilike('name', `%${currentSearchQuery}%`);
        }
        
        // 执行查询
        const { data, error } = await baseQuery.order('name');

        if (error) {
          throw new Error(error.message);
        }

        // 处理数据，提取图书数量
        const processedData = data?.map(author => ({
          id: author.id,
          name: author.name,
          biography: author.biography,
          book_count: author.books[0]?.count || 0
        })) || [];

        setAuthors(processedData);
      } catch (error) {
        console.error('获取作者数据失败', error);
        setError('加载作者数据时出错');
      } finally {
        setIsLoading(false);
      }
    })();
  };

  if (isLoading && authors.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3 text-muted-foreground">正在加载作者数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md animate-fadeIn">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={() => fetchAuthors()}
          className="mt-2 text-sm text-primary hover:underline"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索作者"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200"
        />
      </div>

      {authors.length === 0 ? (
        <div className="text-center py-10 bg-secondary rounded-md">
          <p className="text-muted-foreground">没有找到符合条件的作者</p>
          <Link href="/authors/new">
            <Button variant="primary" className="mt-4">添加作者</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <div 
                key={author.id}
                className="card p-5 hover:border-primary hover:translate-y-[-2px] animate-fadeIn"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-foreground">
                    <Link href={`/authors/${author.id}`} className="hover:text-primary hover:underline transition-colors duration-200">
                      {author.name}
                    </Link>
                  </h3>
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {author.book_count} 本图书
                  </span>
                </div>
                
                <p className="mt-3 text-muted-foreground line-clamp-3">
                  {author.biography || '暂无作者简介'}
                </p>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <Link href={`/authors/${author.id}`}>
                    <Button variant="outline" size="sm">查看</Button>
                  </Link>
                  <Link href={`/authors/${author.id}/edit`}>
                    <Button variant="secondary" size="sm">编辑</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            {/* 分页组件 */}
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AuthorList; 