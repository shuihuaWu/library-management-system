'use client';

import React from 'react';
import Link from 'next/link';

interface AuthorLinkProps {
  authorId: number;
  authorName: string;
}

const AuthorLink: React.FC<AuthorLinkProps> = ({ authorId, authorName }) => {
  // 检查作者页面是否存在
  const authorPageExists = true; // 你可以根据实际情况调整这个值

  // 如果作者页面存在，则渲染为链接
  if (authorPageExists) {
    return (
      <Link href={`/authors/${authorId}`} className="text-blue-600 hover:underline">
        {authorName}
      </Link>
    );
  }

  // 如果作者页面不存在，则渲染为普通文本
  return <span>{authorName}</span>;
};

export default AuthorLink; 