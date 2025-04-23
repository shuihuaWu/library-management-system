'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { createBrowserSupabaseClient } from '@/lib/supabase';

const registerSchema = z
  .object({
    username: z.string().min(2, '用户名至少需要2个字符'),
    email: z.string().email('请输入有效的电子邮箱地址'),
    password: z.string().min(6, '密码至少需要6个字符'),
    confirmPassword: z.string().min(6, '确认密码至少需要6个字符'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const supabase = createBrowserSupabaseClient();
      
      // 注册用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setServerError(authError.message);
        return;
      }

      // 如果注册成功，创建用户档案
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: data.username,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('创建用户档案失败', profileError);
          setServerError('创建用户档案失败');
          return;
        }
      }

      // 注册成功，重定向到登录页面
      router.push('/auth/login?registered=true');
    } catch (error) {
      console.error('注册失败', error);
      setServerError('注册时出现错误，请稍后再试');
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
        id="username"
        type="text"
        label="用户名"
        placeholder="请输入用户名"
        error={errors.username?.message}
        fullWidth
        {...register('username')}
      />
      
      <Input
        id="email"
        type="email"
        label="电子邮箱"
        placeholder="请输入电子邮箱"
        error={errors.email?.message}
        fullWidth
        {...register('email')}
      />
      
      <Input
        id="password"
        type="password"
        label="密码"
        placeholder="请输入密码"
        error={errors.password?.message}
        fullWidth
        {...register('password')}
      />
      
      <Input
        id="confirmPassword"
        type="password"
        label="确认密码"
        placeholder="请再次输入密码"
        error={errors.confirmPassword?.message}
        fullWidth
        {...register('confirmPassword')}
      />
      
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? '注册中...' : '注册'}
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm; 