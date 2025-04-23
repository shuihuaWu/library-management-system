'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { createBrowserSupabaseClient } from '@/lib/supabase';

const bookSchema = z.object({
  title: z.string().min(1, '书名不能为空'),
  author_id: z.string().min(1, '请选择作者'),
  category_id: z.string().min(1, '请选择分类'),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  publication_date: z.string().optional(),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  status: z.string().optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

interface Author {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface BookFormProps {
  book?: any;
}

const BookForm: React.FC<BookFormProps> = ({ book }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const isEditing = !!book;
  
  // 添加调试日志
  useEffect(() => {
    if (book) {
      console.log('BookForm 接收到的图书数据:', {
        bookId: book.id,
        title: book.title,
        author: book.author,
        author_id: book.author_id,
        category: book.category,
        category_id: book.category_id
      });
    }
  }, [book]);

  // 添加调试钩子，监控表单值的变化
  useEffect(() => {
    console.log('表单值已加载');
    
    if (book) {
      console.log('当前author_id值:', book?.author_id?.toString() || book?.author?.id?.toString() || '未设置');
      console.log('当前category_id值:', book?.category_id?.toString() || book?.category?.id?.toString() || '未设置');
    }
  }, [book]);
  
  // 添加钩子，监控下拉框选项加载
  useEffect(() => {
    if (authors.length > 0) {
      console.log(`已加载${authors.length}个作者选项`);
      if (book?.author_id || (book?.author && book?.author.id)) {
        const authorId = book?.author_id?.toString() || book?.author?.id?.toString();
        const authorExists = authors.some(a => a.id.toString() === authorId);
        console.log(`作者ID ${authorId} ${authorExists ? '存在' : '不存在'}于选项列表中`);
      }
    }
  }, [authors, book]);
  
  useEffect(() => {
    if (categories.length > 0) {
      console.log(`已加载${categories.length}个分类选项`);
      if (book?.category_id || (book?.category && book?.category.id)) {
        const categoryId = book?.category_id?.toString() || book?.category?.id?.toString();
        const categoryExists = categories.some(c => c.id.toString() === categoryId);
        console.log(`分类ID ${categoryId} ${categoryExists ? '存在' : '不存在'}于选项列表中`);
      }
    }
  }, [categories, book]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book?.title || '',
      author_id: book?.author_id?.toString() || book?.author?.id?.toString() || '',
      category_id: book?.category_id?.toString() || book?.category?.id?.toString() || '',
      isbn: book?.isbn || '',
      publisher: book?.publisher || '',
      publication_date: book?.publication_date ? new Date(book.publication_date).toISOString().split('T')[0] : '',
      description: book?.description || '',
      cover_image_url: book?.cover_image_url || '',
      status: book?.status || 'available',
    },
  });

  // 确保在book数据加载后，手动更新表单值
  useEffect(() => {
    if (book) {
      // 确保表单重置为正确的值
      setTimeout(() => {
        // 设置作者ID (优先使用author_id，如果没有则尝试使用author.id)
        if (book.author_id) {
          setValue('author_id', book.author_id.toString());
          console.log('设置author_id为:', book.author_id.toString());
        } else if (book.author && book.author.id) {
          setValue('author_id', book.author.id.toString());
          console.log('设置author_id为:', book.author.id.toString());
        }
        
        // 设置分类ID (优先使用category_id，如果没有则尝试使用category.id)
        if (book.category_id) {
          setValue('category_id', book.category_id.toString());
          console.log('设置category_id为:', book.category_id.toString());
        } else if (book.category && book.category.id) {
          setValue('category_id', book.category.id.toString());
          console.log('设置category_id为:', book.category.id.toString());
        }
      }, 100); // 添加延迟确保组件已经完全加载
    }
  }, [book, setValue]); // 移除authors和categories依赖，它们不需要在这里

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        
        // 获取所有作者
        const { data: authorsData, error: authorsError } = await supabase
          .from('authors')
          .select('id, name')
          .order('name');

        if (authorsError) throw new Error('获取作者数据失败');
        setAuthors(authorsData || []);
        
        // 获取所有分类
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');

        if (categoriesError) throw new Error('获取分类数据失败');
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('获取表单选项失败', error);
        setServerError('加载表单数据失败，请刷新页面重试');
      }
    };

    fetchOptions();
  }, []);

  const onSubmit = async (data: BookFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const supabase = createBrowserSupabaseClient();
      
      // 准备提交的数据
      const bookData = {
        title: data.title,
        author_id: parseInt(data.author_id),
        category_id: parseInt(data.category_id),
        isbn: data.isbn || null,
        publisher: data.publisher || null,
        publication_date: data.publication_date || null,
        description: data.description || null,
        cover_image_url: data.cover_image_url || null,
        status: data.status || 'available',
        updated_at: new Date().toISOString(),
      };
      
      if (isEditing) {
        // 更新现有图书
        const { error } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', book.id);

        if (error) throw new Error(error.message);
        
        router.push(`/books/${book.id}`);
      } else {
        // 创建新图书
        const { data: newBook, error } = await supabase
          .from('books')
          .insert({
            ...bookData,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) throw new Error(error.message);
        
        router.push(`/books/${newBook.id}`);
      }
      
      router.refresh();
    } catch (error) {
      console.error('保存图书失败', error);
      setServerError('保存图书信息时出错，请稍后再试');
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="title"
          label="书名"
          placeholder="请输入图书名称"
          error={errors.title?.message}
          fullWidth
          {...register('title')}
        />
        
        <Controller
          name="author_id"
          control={control}
          render={({ field }) => (
            <Select
              id="author_id"
              label="作者"
              options={authors.map((author) => ({
                value: author.id.toString(),
                label: author.name,
              }))}
              error={errors.author_id?.message}
              fullWidth
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        
        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <Select
              id="category_id"
              label="分类"
              options={categories.map((category) => ({
                value: category.id.toString(),
                label: category.name,
              }))}
              error={errors.category_id?.message}
              fullWidth
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        
        <Input
          id="isbn"
          label="ISBN"
          placeholder="请输入ISBN号（可选）"
          error={errors.isbn?.message}
          fullWidth
          {...register('isbn')}
        />
        
        <Input
          id="publisher"
          label="出版社"
          placeholder="请输入出版社名称（可选）"
          error={errors.publisher?.message}
          fullWidth
          {...register('publisher')}
        />
        
        <Input
          id="publication_date"
          type="date"
          label="出版日期"
          error={errors.publication_date?.message}
          fullWidth
          {...register('publication_date')}
        />
        
        <Input
          id="cover_image_url"
          label="封面图片URL"
          placeholder="请输入封面图片链接（可选）"
          error={errors.cover_image_url?.message}
          fullWidth
          {...register('cover_image_url')}
        />
        
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              id="status"
              label="状态"
              options={[
                { value: 'available', label: '可借阅' },
                { value: 'borrowed', label: '已借出' },
              ]}
              error={errors.status?.message}
              fullWidth
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      
      <TextArea
        id="description"
        label="图书简介"
        placeholder="请输入图书简介（可选）"
        rows={5}
        error={errors.description?.message}
        fullWidth
        {...register('description')}
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/books')}
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? '保存中...' : isEditing ? '更新图书' : '添加图书'}
        </Button>
      </div>
    </form>
  );
};

export default BookForm; 