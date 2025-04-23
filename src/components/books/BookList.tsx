'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import Button from '@/components/ui/Button';

interface Book {
  id: number;
  title: string;
  author: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  isbn: string | null;
  publisher: string | null;
  status: string | null;
}

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createBrowserSupabaseClient();
      
      const { data, error } = await supabase
        .from('books')
        .select(`
          id, 
          title, 
          isbn,
          publisher,
          publication_date,
          status,
          author:author_id(id, name),
          category:category_id(id, name)
        `)
        .order('title');

      if (error) {
        throw new Error(error.message);
      }

      setBooks(data || []);
    } catch (error) {
      console.error('获取图书数据失败', error);
      setError('加载图书数据时出错');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.isbn && book.isbn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">正在加载图书数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchBooks}
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
          placeholder="搜索图书（书名、作者、ISBN）"
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">没有找到符合条件的图书</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  书名
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作者
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  出版社
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
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <Link href={`/books/${book.id}`} className="hover:text-blue-600 hover:underline">
                        {book.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <Link href={`/authors/${book.author.id}`} className="hover:text-blue-600 hover:underline">
                        {book.author.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <Link href={`/categories/${book.category.id}`} className="hover:text-blue-600 hover:underline">
                        {book.category.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.isbn || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.publisher || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      book.status === 'available' ? 'bg-green-100 text-green-800' : 
                      book.status === 'borrowed' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {book.status === 'available' ? '可借阅' : 
                       book.status === 'borrowed' ? '已借出' : 
                       '未知'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/books/${book.id}`}>
                        <Button variant="outline" size="sm">查看</Button>
                      </Link>
                      <Link href={`/books/${book.id}/edit`}>
                        <Button variant="secondary" size="sm">编辑</Button>
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

export default BookList; 