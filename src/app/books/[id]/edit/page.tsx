import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import BookForm from '@/components/books/BookForm';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EditBookPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditBookPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = createServerClient();
  
  const { data: book } = await supabase
    .from('books')
    .select('title')
    .eq('id', id)
    .single();

  return {
    title: book ? `编辑${book.title} - 图书管理系统` : '编辑图书 - 图书管理系统',
  };
}

const EditBookPage = async ({ params }: EditBookPageProps) => {
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


  const bookData = {
    ...book,
    author_id: book.author_id,
    author: book.author,
    category_id: book.category_id,
    category: book.category
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title={`编辑 ${book.title}`} 
          description="更新图书信息" 
        />
        <div className="flex space-x-3">
          <Link href={`/books/${id}`}>
            <Button variant="outline">查看详情</Button>
          </Link>
          <Link href="/books">
            <Button variant="outline">返回列表</Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
        <BookForm book={bookData} />
      </div>
    </MainLayout>
  );
};

export default EditBookPage; 