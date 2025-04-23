'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import Button from '@/components/ui/Button';

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createBrowserSupabaseClient();
      
      // 使用连接查询获取分类信息和关联的图书数量
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id, 
          name, 
          description,
          books:books(count)
        `)
        .order('name');

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

      setCategories(processedData);
    } catch (error) {
      console.error('获取分类数据失败', error);
      setError('加载分类数据时出错');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">正在加载分类数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchCategories}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索分类"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">没有找到符合条件的分类</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div 
              key={category.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900">
                    <Link href={`/categories/${category.id}`} className="hover:text-blue-600 hover:underline">
                      {category.name}
                    </Link>
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {category.book_count} 本图书
                  </span>
                </div>
                
                <p className="mt-3 text-gray-600 line-clamp-2">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList; 