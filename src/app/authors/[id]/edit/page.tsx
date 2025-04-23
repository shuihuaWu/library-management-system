import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import AuthorForm from '@/components/authors/AuthorForm';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    title: author ? `编辑${author.name} - 图书管理系统` : '编辑作者 - 图书管理系统',
  };
}

const EditAuthorPage = async ({ params }: AuthorPageProps) => {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = createServerClient();
  
  const { data: author, error } = await supabase
    .from('authors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !author) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title={`编辑 ${author.name}`} 
          description="更新作者信息" 
        />
        <div className="flex space-x-3">
          <Link href={`/authors/${id}`}>
            <Button variant="outline">查看详情</Button>
          </Link>
          <Link href="/authors">
            <Button variant="outline">返回列表</Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
        <AuthorForm author={author} />
      </div>
    </MainLayout>
  );
};

export default EditAuthorPage; 