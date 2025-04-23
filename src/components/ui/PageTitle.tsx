import React from 'react';

interface PageTitleProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, description, action }) => {
  return (
    <div className="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageTitle; 