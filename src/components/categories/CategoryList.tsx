'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';

interface Category {
  id: number;
  name: string;
  description: string | null;
  book_count: number;
}

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 每页显示10个分类，适合3列布局

  // 获取分类总数的函数
  const fetchTotalCount = useCallback(async (query = searchQuery) => {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 构建查询
      let baseQuery = supabase
        .from('categories')
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
      
      console.log('分类总数:', count);
      setTotalItems(count || 0);
    } catch (error) {
      console.error('获取分类总数失败', error);
    }
  }, [searchQuery]);

  // 获取分类数据的函数
  const fetchCategories = useCallback(async (page = currentPage, query = searchQuery) => {
    try {
      setIsLoading(true);
      setError(null);

      // 获取总数
      await fetchTotalCount(query);
      
      // 计算分页参数
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      console.log(`获取分类数据，页码:${page}, 每页条数:${itemsPerPage}, 范围:${from}-${to}`);

      const supabase = createBrowserSupabaseClient();
      
      // 构建查询
      let baseQuery = supabase
        .from('categories')
        .select(`
          id, 
          name, 
          description,
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
      const processedData = data?.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        book_count: category.books[0]?.count || 0
      })) || [];

      console.log(`获取分类数据成功，第${page}页，每页${itemsPerPage}条，共${processedData.length}条`);
      setCategories(processedData);
    } catch (error) {
      console.error('获取分类数据失败', error);
      setError('加载分类数据时出错');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, fetchTotalCount]);

  // 初始加载
  useEffect(() => {
    console.log('初始加载分类数据');
    fetchCategories();
  }, [fetchCategories]);

  // 处理页码变化
  const handlePageChange = (page: number) => {
    console.log('页码变化:', page);
    setCurrentPage(page);
    fetchCategories(page);
  };

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // 重置为第一页
    fetchCategories(1, query); // 搜索
  };

  // 修复每页条数变化的处理函数
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    console.log(`每页条数变化: ${itemsPerPage} -> ${newItemsPerPage}`);
    // 保存当前的搜索条件，以便在状态更新后使用
    const currentSearchQuery = searchQuery;
    
    // 先更新状态
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 重置到第一页
    
    // 使用当前的查询条件和新的每页条数直接计算分页参数
    const from = 0; // 第一页的起始索引
    const to = newItemsPerPage - 1;
    
    console.log(`每页条数变化后重新获取数据，页码:1, 每页条数:${newItemsPerPage}, 范围:${from}-${to}`);
    
    // 直接使用supabase查询，而不通过useCallback包装的函数
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const supabase = createBrowserSupabaseClient();
        
        // 获取总数
        let countQuery = supabase
          .from('categories')
          .select('id', { count: 'exact', head: true });
        
        // 如果有搜索条件，添加过滤
        if (currentSearchQuery) {
          countQuery = countQuery.ilike('name', `%${currentSearchQuery}%`);
        }
        
        const { count, error: countError } = await countQuery;
        
        if (countError) {
          throw countError;
        }
        
        console.log('分类总数:', count);
        setTotalItems(count || 0);
        
        // 构建查询
        let baseQuery = supabase
          .from('categories')
          .select(`
            id, 
            name, 
            description,
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
        const processedData = data?.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          book_count: category.books[0]?.count || 0
        })) || [];

        console.log(`获取分类数据成功，第1页，每页${newItemsPerPage}条，共${processedData.length}条`);
        setCategories(processedData);
      } catch (error) {
        console.error('获取分类数据失败', error);
        setError('加载分类数据时出错');
      } finally {
        setIsLoading(false);
      }
    })();
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3 text-muted-foreground">正在加载分类数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md animate-fadeIn">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={() => fetchCategories()}
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
          placeholder="搜索分类"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200"
        />
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-10 bg-secondary rounded-md">
          <p className="text-muted-foreground">没有找到符合条件的分类</p>
          <Link href="/categories/new">
            <Button variant="primary" className="mt-4">添加分类</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="card p-5 hover:border-primary hover:translate-y-[-2px] animate-fadeIn"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-foreground">
                    <Link href={`/categories/${category.id}`} className="hover:text-primary hover:underline transition-colors duration-200">
                      {category.name}
                    </Link>
                  </h3>
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {category.book_count} 本图书
                  </span>
                </div>
                
                <p className="mt-3 text-muted-foreground line-clamp-2">
                  {category.description || '暂无描述'}
                </p>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <Link href={`/categories/${category.id}`}>
                    <Button variant="outline" size="sm">查看</Button>
                  </Link>
                  <Link href={`/categories/${category.id}/edit`}>
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

export default CategoryList; 