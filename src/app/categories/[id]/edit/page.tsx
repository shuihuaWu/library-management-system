import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import CategoryForm from '@/components/categories/CategoryForm';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditCategoryPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = createServerClient();
  
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', id)
    .single();

  return {
    title: category ? `编辑${category.name} - 图书管理系统` : '编辑分类 - 图书管理系统',
  };
}

const EditCategoryPage = async ({ params }: EditCategoryPageProps) => {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = createServerClient();
  
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !category) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="flex justify-between items-start">
        <PageTitle 
          title={`编辑 ${category.name}`} 
          description="更新分类信息" 
        />
        <div className="flex space-x-3">
          <Link href={`/categories/${id}`}>
            <Button variant="outline">查看详情</Button>
          </Link>
          <Link href="/categories">
            <Button variant="outline">返回列表</Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
        <CategoryForm category={category} />
      </div>
    </MainLayout>
  );
};

export default EditCategoryPage; 