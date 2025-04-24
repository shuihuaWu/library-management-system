"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';

const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, signOut } = useAuthContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: '首页', href: '/' },
    { name: '图书管理', href: '/books' },
    { name: '作者管理', href: '/authors' },
    { name: '分类管理', href: '/categories' },
    { name: '借阅记录', href: '/borrow-records' },
    ...(isAdmin ? [{ name: '管理面板', href: '/admin' }] : []),
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 
      ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md dark:bg-background/90' : 'bg-white dark:bg-background shadow'}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-2xl font-bold gradient-heading">
                图书管理系统
              </Link>
            </div>
            <nav className="ml-6 hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    pathname === item.href
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* 移动端菜单按钮 */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none"
              onClick={toggleDropdown}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isDropdownOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
          
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-muted transition-colors duration-200 focus:outline-none"
                >
                  <span>{user?.username || user?.email}</span>
                  {isAdmin && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      管理员
                    </span>
                  )}
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-secondary py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn">
                    <div className="px-4 py-2 text-xs text-muted-foreground">
                      <p>角色: {isAdmin ? '管理员' : '普通用户'}</p>
                      <p className="truncate">邮箱: {user?.email}</p>
                    </div>
                    <div className="border-t border-border"></div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors duration-150"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        管理面板
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-secondary transition-colors duration-150"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  href="/auth/login"
                  className="btn-secondary"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 移动端下拉菜单 */}
      {isDropdownOpen && (
        <div className="md:hidden border-t border-border animate-slideUp">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-secondary hover:text-foreground'
                }`}
                onClick={() => setIsDropdownOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  <p>用户: {user?.username || user?.email}</p>
                  <p>角色: {isAdmin ? '管理员' : '普通用户'}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary"
                >
                  退出登录
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 p-2">
                <Link
                  href="/auth/login"
                  className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-secondary text-foreground hover:bg-muted"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-primary-hover"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 