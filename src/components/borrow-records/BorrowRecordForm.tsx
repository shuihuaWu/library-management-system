'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { createBrowserSupabaseClient } from '@/lib/supabase';

// 设置借阅期限（默认30天）
const DEFAULT_BORROW_DAYS = 30;

const borrowRecordSchema = z.object({
  book_id: z.string().min(1, '请选择图书'),
  user_id: z.string().min(1, '请选择用户'),
  borrow_date: z.string().min(1, '请选择借阅日期'),
  due_date: z.string().min(1, '请选择应还日期'),
});

type BorrowRecordFormData = z.infer<typeof borrowRecordSchema>;

interface Book {
  id: number;
  title: string;
  author: {
    id: number;
    name: string;
  };
}

interface User {
  id: string;
  username: string;
}

const BorrowRecordForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const today = new Date();
  const defaultDueDate = new Date();
  defaultDueDate.setDate(today.getDate() + DEFAULT_BORROW_DAYS);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BorrowRecordFormData>({
    resolver: zodResolver(borrowRecordSchema),
    defaultValues: {
      borrow_date: today.toISOString().split('T')[0],
      due_date: defaultDueDate.toISOString().split('T')[0],
    },
  });

  const selectedBookId = watch('book_id');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        
        // 获取可借阅的图书（状态为available）
        const { data: booksData, error: booksError } = await supabase
          .from('books')
          .select(`
            id, 
            title,
            author:author_id(id, name)
          `)
          .eq('status', 'available')
          .order('title');

        if (booksError) throw new Error('获取图书数据失败');
        setBooks(booksData || []);
        
        // 获取所有用户
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, username')
          .order('username');

        if (usersError) {
          console.error('获取用户数据错误:', usersError);
          throw new Error('获取用户数据失败');
        }
        
        // 检查并记录用户数据
        if (usersData && usersData.length > 0) {
          console.log(`获取到 ${usersData.length} 个用户:`, usersData.map(u => ({id: u.id, username: u.username})));
          setUsers(usersData);
        } else {
          console.warn('未获取到任何用户数据');
          setUsers([]);
        }
      } catch (error) {
        console.error('获取表单选项失败', error);
        setServerError('加载表单数据失败，请刷新页面重试');
      }
    };

    fetchOptions();
  }, []);

  const onSubmit = async (data: BorrowRecordFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      // 输出选择的用户信息
      console.log('选择的用户ID原始值:', data.user_id);
      // 确保ID不含空格
      const cleanUserId = data.user_id.trim();
      console.log('选择的用户ID清理后:', cleanUserId);
      
      const selectedUser = users.find(u => u.id === cleanUserId);
      console.log('选择的用户:', selectedUser);

      const supabase = createBrowserSupabaseClient();
      
      // 创建借阅记录
      const { data: newRecord, error: recordError } = await supabase
        .from('borrow_records')
        .insert({
          book_id: parseInt(data.book_id),
          user_id: cleanUserId, // 使用清理后的用户ID
          borrow_date: data.borrow_date,
          due_date: data.due_date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (recordError) {
        console.error('创建借阅记录失败:', recordError);
        throw new Error(recordError.message);
      }
      
      console.log('创建的借阅记录:', newRecord);
      
      // 更新图书状态为已借出
      const { error: bookError } = await supabase
        .from('books')
        .update({ 
          status: 'borrowed',
          updated_at: new Date().toISOString()
        })
        .eq('id', data.book_id);
        
      if (bookError) throw new Error(bookError.message);
      
      // 重定向到借阅记录详情页
      router.push(`/borrow-records/${newRecord.id}`);
      router.refresh();
    } catch (error) {
      console.error('创建借阅记录失败', error);
      setServerError('创建借阅记录时出错，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const getBookDetails = () => {
    if (!selectedBookId) return null;
    
    const book = books.find(b => b.id.toString() === selectedBookId);
    if (!book) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">已选图书信息:</h3>
        <p className="text-sm text-gray-600">
          <span className="font-medium">书名:</span> {book.title}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">作者:</span> {book.author.name}
        </p>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {serverError}
        </div>
      )}
      
      <Select
        id="book_id"
        label="选择图书"
        options={books.map((book) => ({
          value: book.id.toString(),
          label: `${book.title} (${book.author.name})`,
        }))}
        error={errors.book_id?.message}
        fullWidth
        {...register('book_id')}
      />
      
      {selectedBookId && getBookDetails()}
      
      <Select
        id="user_id"
        label="选择借阅人"
        options={users.map((user) => ({
          value: user.id,
          label: user.username,
        }))}
        error={errors.user_id?.message}
        fullWidth
        {...register('user_id')}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="borrow_date"
          type="date"
          label="借阅日期"
          error={errors.borrow_date?.message}
          fullWidth
          {...register('borrow_date')}
        />
        
        <Input
          id="due_date"
          type="date"
          label="应还日期"
          error={errors.due_date?.message}
          fullWidth
          {...register('due_date')}
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/borrow-records')}
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? '保存中...' : '创建借阅记录'}
        </Button>
      </div>
    </form>
  );
};

export default BorrowRecordForm; 