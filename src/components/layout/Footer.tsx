import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { name: '关于我们', href: '#' },
    { name: '联系方式', href: '#' },
    { name: '帮助中心', href: '#' },
    { name: '隐私政策', href: '#' },
  ];

  return (
    <footer className="bg-secondary border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">图书管理系统</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              一个现代化的图书管理系统，帮助您高效管理图书、作者、分类和借阅信息。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">快速链接</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">联系我们</h3>
            <p className="text-sm text-muted-foreground">电子邮件: contact@example.com</p>
            <p className="text-sm text-muted-foreground">电话: +86 123 4567 8901</p>
          </div>
        </div>
        
        <div className="fancy-divider"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} 图书管理系统. 保留所有权利.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              <span className="sr-only">微信</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M9.5,4C5.36,4 2,6.69 2,10C2,11.89 3.08,13.56 4.78,14.66L4,17L6.5,15.5C7.39,15.81 8.37,16 9.41,16C9.15,16.39 9,16.83 9,17.3C9,20.07 11.13,22 13.7,22C14.58,22 15.37,21.82 16.05,21.5L18,23L17.38,20.91C18.6,20.05 19.5,18.78 19.5,17.3C19.5,14.86 17.24,12.91 14.3,12.91C13.81,12.91 13.34,13 12.9,13.16C12.25,8.06 7.67,4 9.5,4Z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              <span className="sr-only">微博</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.9,18.3C7.8,18.7 5,16.8 4.7,14.1C4.5,12.3 5.5,10.8 7.1,9.9C7.3,9.8 7.6,9.8 7.8,10C7.9,10.1 8,10.3 8,10.5C8,10.8 7.3,12.3 8.3,13.8C9,14.9 10.4,15.5 11.7,15.1L11.4,14.2C11,13.1 11.2,11.8 12.1,11C13.2,10 15.2,10.2 16,11.5C16.2,11.9 16.5,12 16.9,12C17.4,11.9 17.9,11.8 18.4,11.7C18.6,11.7 18.7,11.7 18.8,11.9C19,12.1 18.9,12.3 18.8,12.5L18.3,13.6L17.1,15.6C16.8,16.2 15.5,18.1 13.5,18.3C12.5,18.4 11.6,18.4 10.9,18.3M20.4,5C20.8,5 21.3,5.2 21.6,5.5C21.8,5.8 22,6.2 22,6.7C22,7.1 21.9,7.5 21.6,7.8C21.4,8 21.1,8.2 20.7,8.2C20.3,8.2 19.8,8 19.5,7.7C19.3,7.4 19.1,7.1 19.1,6.6C19.1,6.2 19.2,5.8 19.5,5.5C19.7,5.2 20.1,5 20.4,5Z" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              <span className="sr-only">GitHub</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 