'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { createBrowserSupabaseClient } from '@/lib/supabase';

const loginSchema = z.object({
  email: z.string().email('请输入有效的电子邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      // 登录成功，重定向到首页
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('登录失败', error);
      setServerError('登录时出现错误，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {serverError}
        </div>
      )}
      
      <Input
        id="email"
        type="email"
        label="电子邮箱"
        placeholder="请输入您的电子邮箱"
        error={errors.email?.message}
        fullWidth
        {...register('email')}
      />
      
      <Input
        id="password"
        type="password"
        label="密码"
        placeholder="请输入您的密码"
        error={errors.password?.message}
        fullWidth
        {...register('password')}
      />
      
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? '登录中...' : '登录'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm; 