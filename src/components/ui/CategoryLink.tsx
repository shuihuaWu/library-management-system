'use client';

import React from 'react';
import Link from 'next/link';

interface CategoryLinkProps {
  categoryId: number;
  categoryName: string;
}

const CategoryLink: React.FC<CategoryLinkProps> = ({ categoryId, categoryName }) => {
  // 检查分类页面是否存在
  const categoryPageExists = true; // 你可以根据实际情况调整这个值

  // 如果分类页面存在，则渲染为链接
  if (categoryPageExists) {
    return (
      <Link href={`/categories/${categoryId}`} className="text-blue-600 hover:underline">
        {categoryName}
      </Link>
    );
  }

  // 如果分类页面不存在，则渲染为普通文本
  return <span>{categoryName}</span>;
};

export default CategoryLink; 