import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import { createServerClient } from '@/lib/supabase';
import CategoryLink from '@/components/ui/CategoryLink';
import AuthorLink from '@/components/ui/AuthorLink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BookPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: BookPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = createServerClient();
  
  const { data: book } = await supabase
    .from('books')
    .select('title')
    .eq('id', id)
    .single();

  return {
    title: book ? `${book.title} - 图书管理系统` : '图书详情 - 图书管理系统',
  };
}

const BookPage = async ({ params }: BookPageProps) => {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = createServerClient();
  
  const { data: book, error } = await supabase
    .from('books')
    .select(`
      *,
      author:author_id(id, name),
      category:category_id(id, name)
    `)
    .eq('id', id)
    .single();

  if (error || !book) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title={book.title}
          description={`ISBN: ${book.isbn || '暂无'}`}
        />
        <div className="flex space-x-3">
          <Link href={`/books/${id}/edit`}>
            <Button>编辑图书</Button>
          </Link>
          <Link href="/books">
            <Button variant="outline">返回列表</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">图书详细信息</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">图书的完整信息和元数据</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">书名</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{book.title}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">作者</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <AuthorLink authorId={book.author.id} authorName={book.author.name} />
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">分类</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <CategoryLink categoryId={book.category.id} categoryName={book.category.name} />
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ISBN</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{book.isbn || '暂无'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">出版社</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{book.publisher || '暂无'}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">出版日期</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {book.publication_date ? new Date(book.publication_date).toLocaleDateString('zh-CN') : '暂无'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">状态</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  book.status === 'available' ? 'bg-green-100 text-green-800' : 
                  book.status === 'borrowed' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {book.status === 'available' ? '可借阅' : 
                   book.status === 'borrowed' ? '已借出' : 
                   '未知'}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">简介</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{book.description || '暂无简介'}</dd>
            </div>
            {book.cover_image_url && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">封面</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <img 
                    src={book.cover_image_url} 
                    alt={`${book.title}封面`} 
                    className="w-48 h-auto object-cover rounded-md shadow-sm"
                  />
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookPage; 