import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  const features = [
    {
      title: '图书管理',
      description: '添加、编辑、删除和浏览图书信息，包括书名、作者、分类、ISBN等。',
      icon: '📚',
      href: '/books',
    },
    {
      title: '作者管理',
      description: '管理作者信息，包括姓名、简介等。',
      icon: '✍️',
      href: '/authors',
    },
    {
      title: '分类管理',
      description: '管理图书分类，方便组织和检索图书。',
      icon: '🏷️',
      href: '/categories',
    },
    {
      title: '借阅管理',
      description: '记录图书借阅和归还信息，追踪借阅状态。',
      icon: '📋',
      href: '/borrow-records',
    },
  ];

  const stats = [
    { label: '藏书量', value: '10,000+' },
    { label: '注册用户', value: '500+' },
    { label: '月借阅量', value: '2,000+' },
    { label: '覆盖分类', value: '50+' },
  ];

  return (
    <MainLayout>
      {/* 英雄区域 */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
          <div 
            className="mx-auto max-w-2xl text-center animate-slideUp"
            style={{ animationDelay: '0.1s' }}
          >
            <h1 className="text-4xl font-bold tracking-tight gradient-heading sm:text-6xl mb-4">
              图书管理系统
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-6"></div>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              一个功能完整的图书管理系统，帮助您高效管理图书、作者、分类和借阅信息。
              现代化界面设计，提供流畅的用户体验。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/books"
                className="btn-primary"
              >
                浏览图书
              </Link>
              <Link
                href="/auth/login"
                className="group flex items-center text-sm font-semibold text-foreground"
              >
                登录系统 
                <span className="ml-1 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          
          {/* 统计数据 */}
          <div className="mx-auto mt-20 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="border border-border rounded-lg p-6 text-center bg-white/50 backdrop-blur-sm dark:bg-secondary/50 hover:shadow-md transition-all duration-300 animate-fadeIn"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* 功能特点 */}
          <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
            <h2 className="text-3xl font-bold text-center mb-12 gradient-heading">系统功能</h2>
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
              {features.map((feature, index) => (
                <Link 
                  key={feature.title} 
                  href={feature.href} 
                  className="group" 
                >
                  <div 
                    className="card p-6 hover:border-primary hover:translate-y-[-4px] animate-fadeIn" 
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <dt className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <span className="text-2xl">{feature.icon}</span> {feature.title}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base text-muted-foreground">
                      <p className="flex-auto">{feature.description}</p>
                      <p className="mt-6 flex items-center text-sm font-semibold text-primary">
                        查看详情 
                        <span className="ml-1 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">→</span>
                      </p>
                    </dd>
                  </div>
                </Link>
              ))}
            </dl>
          </div>
          
          {/* 关于我们 */}
          <div className="mt-24 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold mb-6 gradient-heading">关于我们</h2>
              <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-6"></div>
              <p className="text-muted-foreground">
                我们致力于为图书馆和图书管理机构提供高效、便捷的图书管理解决方案。
                通过我们的系统，您可以轻松管理图书、作者、分类和借阅信息，提高工作效率。
              </p>
              <div className="mt-10">
                <Link
                  href="#"
                  className="btn-secondary"
                >
                  了解更多
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
