import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface AuthorBooks {
  id: number;
  title: string;
  isbn: string | null;
  publisher: string | null;
  publication_date: string | null;
  status: string | null;
}

interface AuthorPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: AuthorPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = createServerClient();
  
  const { data: author } = await supabase
    .from('authors')
    .select('name')
    .eq('id', id)
    .single();

  return {
    title: author ? `${author.name} - 图书管理系统` : '作者详情 - 图书管理系统',
  };
}

const AuthorPage = async ({ params }: AuthorPageProps) => {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = createServerClient();
  
  // 获取作者信息
  const { data: author, error: authorError } = await supabase
    .from('authors')
    .select('*')
    .eq('id', id)
    .single();

  if (authorError || !author) {
    notFound();
  }

  // 获取该作者的所有图书
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, title, isbn, publisher, publication_date, status')
    .eq('author_id', id)
    .order('title');

  const authorBooks: AuthorBooks[] = books || [];

  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title={author.name}
          description="作者详细信息"
        />
        <div className="flex space-x-3">
          <Link href={`/authors/${id}/edit`}>
            <Button>编辑作者</Button>
          </Link>
          <Link href="/authors">
            <Button variant="outline">返回列表</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">作者信息</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">姓名</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{author.name}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">图书数量</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{authorBooks.length}本</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 mb-2">简介</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {author.biography || '暂无作者简介'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">该作者的图书</h3>
              <Link href={`/books/new?author=${id}`}>
                <Button size="sm">添加图书</Button>
              </Link>
            </div>
            <div className="border-t border-gray-200">
              {authorBooks.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">该作者暂无图书</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {authorBooks.map((book) => (
                    <li key={book.id} className="px-4 py-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <Link href={`/books/${book.id}`}>
                            <h4 className="text-base font-medium text-gray-900 hover:text-blue-600 hover:underline">{book.title}</h4>
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {book.publisher ? `${book.publisher}出版` : ''} 
                            {book.publication_date ? ` | ${new Date(book.publication_date).toLocaleDateString('zh-CN')}` : ''}
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

export default AuthorPage; 