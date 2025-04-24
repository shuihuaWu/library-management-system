import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import { createServerClient } from '@/lib/supabase';
import AuthorLink from '@/components/ui/AuthorLink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CategoryBooks {
  id: number;
  title: string;
  author: {
    id: number;
    name: string;
  };
  isbn: string | null;
  publisher: string | null;
  status: string | null;
}

interface CategoryPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const id = params.id;
  const supabase = createServerClient();
  
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', id)
    .single();

  return {
    title: category ? `${category.name} - 图书管理系统` : '分类详情 - 图书管理系统',
  };
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const id = params.id;
  const supabase = createServerClient();
  
  // 获取分类信息
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  // 获取该分类的所有图书
  const { data: books } = await supabase
    .from('books')
    .select(`
      id, 
      title, 
      isbn, 
      publisher, 
      status,
      author:author_id(id, name)
    `)
    .eq('category_id', id)
    .order('title');

  const categoryBooks: CategoryBooks[] = books || [];

  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title={category.name}
          description="分类详细信息"
        />
        <div className="flex space-x-3">
          <Link href={`/categories/${id}/edit`}>
            <Button>编辑分类</Button>
          </Link>
          <Link href="/categories">
            <Button variant="outline">返回列表</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">分类信息</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">分类名称</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{category.name}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">图书数量</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{categoryBooks.length}本</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 mb-2">描述</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {category.description || '暂无分类描述'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">该分类的图书</h3>
              <Link href={`/books/new?category=${id}`}>
                <Button size="sm">添加图书</Button>
              </Link>
            </div>
            <div className="border-t border-gray-200">
              {categoryBooks.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">该分类暂无图书</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {categoryBooks.map((book) => (
                    <li key={book.id} className="px-4 py-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <Link href={`/books/${book.id}`}>
                            <h4 className="text-base font-medium text-gray-900 hover:text-blue-600 hover:underline">{book.title}</h4>
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="text-gray-700">作者: </span>
                            <AuthorLink authorId={book.author.id} authorName={book.author.name} />
                            {book.publisher ? ` | ${book.publisher}出版` : ''} 
                            {book.isbn ? ` | ISBN: ${book.isbn}` : ''}
                          </p>
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          book.status === 'available' ? 'bg-green-100 text-green-800' : 
                          book.status === 'borrowed' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {book.status === 'available' ? '可借阅' : 
                          book.status === 'borrowed' ? '已借出' : 
                          '未知'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoryPage; 