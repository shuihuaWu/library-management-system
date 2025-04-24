'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/components/auth/AuthProvider';
import MainLayout from '@/components/layout/MainLayout';

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserSupabaseClient();
  const { isAdmin } = useAuthContext();
  
  // 查询条件状态 - 分离输入状态和查询状态
  const [titleInput, setTitleInput] = useState('');     // 用户输入的标题
  const [searchTitle, setSearchTitle] = useState('');   // 实际查询用的标题
  const [authorInput, setAuthorInput] = useState('');   // 用户选择的作者
  const [searchAuthor, setSearchAuthor] = useState(''); // 实际查询用的作者
  const [categoryInput, setCategoryInput] = useState(''); // 用户选择的分类
  const [searchCategory, setSearchCategory] = useState(''); // 实际查询用的分类
  
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);

  // 加载分类和作者数据，用于筛选
  useEffect(() => {
    async function fetchFilterData() {
      try {
        // 获取所有分类
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');
        
        // 获取所有作者
        const { data: authorsData } = await supabase
          .from('authors')
          .select('id, name')
          .order('name');
        
        setCategories(categoriesData || []);
        setAuthors(authorsData || []);
      } catch (error) {
        console.error('获取筛选数据失败:', error);
      }
    }
    
    fetchFilterData();
  }, []);

  // 根据查询条件获取图书 - 使用useCallback缓存函数以避免不必要的重新创建
  const fetchBooks = useCallback(async (title = searchTitle, author = searchAuthor, category = searchCategory) => {
    try {
      setLoading(true);
      
      // 构建查询
      let query = supabase
        .from('books')
        .select(`
          id,
          title,
          isbn,
          publisher,
          publication_date,
          status,
          author_id,
          category_id,
          authors(id, name),
          categories(id, name)
        `);
      
      // 添加标题筛选
      if (title) {
        query = query.ilike('title', `%${title}%`);
      }
      
      // 添加作者筛选
      if (author) {
        query = query.eq('author_id', author);
      }
      
      // 添加分类筛选
      if (category) {
        query = query.eq('category_id', category);
      }
      
      // 执行查询并排序
      const { data, error } = await query.order('title');
      
      if (error) {
        throw error;
      }
      
      setBooks(data || []);
    } catch (error: any) {
      console.error('获取图书列表失败:', error);
      setError(error.message || '获取图书列表失败');
    } finally {
      setLoading(false);
    }
  }, [searchTitle, searchAuthor, searchCategory, supabase]);

  // 初始加载
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // 搜索按钮处理 - 提交时将输入状态复制到查询状态
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 更新实际查询条件
    setSearchTitle(titleInput);
    setSearchAuthor(authorInput);
    setSearchCategory(categoryInput);
    // 使用新的查询条件进行查询
    fetchBooks(titleInput, authorInput, categoryInput);
  };

  // 重置搜索 - 优化以立即重置
  const resetSearch = async () => {
    // 清空输入框和查询条件
    setTitleInput('');
    setAuthorInput('');
    setCategoryInput('');
    setSearchTitle('');
    setSearchAuthor('');
    setSearchCategory('');
    
    // 使用空条件查询所有图书
    await fetchBooks('', '', '');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除此图书吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // 更新本地状态
      setBooks(books.filter(book => book.id !== id));
    } catch (error: any) {
      console.error('删除图书失败:', error);
      alert('删除图书失败: ' + error.message);
    }
  };

  // 用于渲染添加按钮
  const renderAddButton = () => {
    return isAdmin && (
      <Link href="/books/new">
        <Button variant="primary" className="whitespace-nowrap">
          添加图书
        </Button>
      </Link>
    );
  };

  const renderContent = () => {
    if (loading && books.length === 0) {
      return <div className="text-center p-8">加载中...</div>;
    }

    if (error) {
      return <div className="text-center text-red-600 p-8">错误: {error}</div>;
    }

    return (
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">图书管理</h1>
          {renderAddButton()}
        </div>
        
        {/* 查询条件区域 */}
        <div className="bg-white p-4 mb-6 rounded-lg shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="searchTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  图书标题
                </label>
                <input
                  id="searchTitle"
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="输入图书标题关键字"
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="searchAuthor" className="block text-sm font-medium text-gray-700 mb-1">
                  作者
                </label>
                <select
                  id="searchAuthor"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">全部作者</option>
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="searchCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  分类
                </label>
                <select
                  id="searchCategory"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">全部分类</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetSearch}
              >
                重置
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                搜索
              </Button>
            </div>
          </form>
        </div>
        
        {/* 当前搜索条件提示 */}
        {(searchTitle || searchAuthor || searchCategory) && (
          <div className="mb-4 px-1">
            <p className="text-sm text-gray-600">
              当前搜索条件: 
              {searchTitle && ` 标题包含"${searchTitle}"`}
              {searchAuthor && ` 作者ID为"${searchAuthor}"`}
              {searchCategory && ` 分类ID为"${searchCategory}"`}
            </p>
          </div>
        )}
        
        {books.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">暂无图书数据</p>
            {isAdmin && (
              <Link 
                href="/books/new"
                className="mt-4 inline-block px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                添加第一本图书
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {loading && (
              <div className="text-center py-4 bg-gray-50">
                <p className="text-gray-500">加载中...</p>
              </div>
            )}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出版社</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                      <div className="text-xs text-gray-500">{book.isbn || '无ISBN'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.authors?.name || '未知作者'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.categories?.name || '未分类'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.publisher || '未知出版社'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        book.status === 'available' ? 'bg-green-100 text-green-800' : 
                        book.status === 'borrowed' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {book.status === 'available' ? '可借阅' : 
                         book.status === 'borrowed' ? '已借出' : 
                         '未知状态'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* 查看按钮 */}
                        <Link 
                          href={`/books/${book.id}`}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          查看
                        </Link>
                        
                        {/* 编辑按钮 */}
                        {isAdmin && (
                          <Link 
                            href={`/books/${book.id}/edit`}
                            className="text-gray-600 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                          >
                            编辑
                          </Link>
                        )}
                        
                        {/* 删除按钮 */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100"
                          >
                            删除
                          </button>
                        )}
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

  return (
    <MainLayout>
      {renderContent()}
    </MainLayout>
  );
} 