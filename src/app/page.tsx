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

  return (
    <MainLayout>
      <div className="relative isolate overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              图书管理系统
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              一个功能完整的图书管理系统，帮助您高效管理图书、作者、分类和借阅信息。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/books"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                浏览图书
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                登录系统 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {features.map((feature) => (
                <Link key={feature.title} href={feature.href} className="group">
                  <div className="flex flex-col rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all duration-300">
                    <dt className="text-lg font-semibold leading-7 text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">{feature.icon}</span> {feature.title}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{feature.description}</p>
                      <p className="mt-6 text-sm font-semibold text-blue-600 group-hover:underline">
                        查看详情 <span aria-hidden="true">→</span>
                      </p>
                    </dd>
                  </div>
                </Link>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
