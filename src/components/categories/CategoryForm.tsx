'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';
import { createBrowserSupabaseClient } from '@/lib/supabase';

const categorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空'),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: {
    id: number;
    name: string;
    description: string | null;
  };
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const supabase = createBrowserSupabaseClient();
      
      // 准备提交的数据
      const categoryData = {
        name: data.name,
        description: data.description || null,
        updated_at: new Date().toISOString(),
      };
      
      if (isEditing) {
        // 更新现有分类
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id);

        if (error) throw new Error(error.message);
        
        router.push(`/categories/${category.id}`);
      } else {
        // 创建新分类
        const { data: newCategory, error } = await supabase
          .from('categories')
          .insert({
            ...categoryData,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw new Error(error.message);
        
        router.push(`/categories/${newCategory.id}`);
      }
      
      router.refresh();
    } catch (error) {
      console.error('保存分类失败', error);
      setServerError('保存分类信息时出错，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {serverError}
        </div>
      )}
      
      <Input
        id="name"
        label="分类名称"
        placeholder="请输入分类名称"
        error={errors.name?.message}
        fullWidth
        {...register('name')}
      />
      
      <TextArea
        id="description"
        label="分类描述"
        placeholder="请输入分类描述（可选）"
        rows={5}
        error={errors.description?.message}
        fullWidth
        {...register('description')}
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/categories')}
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? '保存中...' : isEditing ? '更新分类' : '添加分类'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm; 