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

const authorSchema = z.object({
  name: z.string().min(1, '作者姓名不能为空'),
  biography: z.string().optional(),
});

type AuthorFormData = z.infer<typeof authorSchema>;

interface AuthorFormProps {
  author?: {
    id: number;
    name: string;
    biography: string | null;
  };
}

const AuthorForm: React.FC<AuthorFormProps> = ({ author }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = !!author;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: author?.name || '',
      biography: author?.biography || '',
    },
  });

  const onSubmit = async (data: AuthorFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const supabase = createBrowserSupabaseClient();
      
      // 准备提交的数据
      const authorData = {
        name: data.name,
        biography: data.biography || null,
        updated_at: new Date().toISOString(),
      };
      
      if (isEditing) {
        // 更新现有作者
        const { error } = await supabase
          .from('authors')
          .update(authorData)
          .eq('id', author.id);

        if (error) throw new Error(error.message);
        
        router.push(`/authors/${author.id}`);
      } else {
        // 创建新作者
        const { data: newAuthor, error } = await supabase
          .from('authors')
          .insert({
            ...authorData,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw new Error(error.message);
        
        router.push(`/authors/${newAuthor.id}`);
      }
      
      router.refresh();
    } catch (error) {
      console.error('保存作者失败', error);
      setServerError('保存作者信息时出错，请稍后再试');
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
        label="作者姓名"
        placeholder="请输入作者姓名"
        error={errors.name?.message}
        fullWidth
        {...register('name')}
      />
      
      <TextArea
        id="biography"
        label="作者简介"
        placeholder="请输入作者简介（可选）"
        rows={5}
        error={errors.biography?.message}
        fullWidth
        {...register('biography')}
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/authors')}
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? '保存中...' : isEditing ? '更新作者' : '添加作者'}
        </Button>
      </div>
    </form>
  );
};

export default AuthorForm; 