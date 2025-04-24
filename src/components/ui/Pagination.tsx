import React, { useState, useRef, useEffect } from 'react';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 30, 50],
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [jumpPage, setJumpPage] = useState<string>(currentPage.toString());
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 当当前页改变时，更新跳转输入框
  useEffect(() => {
    setJumpPage(currentPage.toString());
  }, [currentPage]);
  
  // 监听itemsPerPage变化的useEffect
  useEffect(() => {
    console.log('itemsPerPage变化:', itemsPerPage);
  }, [itemsPerPage]);
  
  // 处理页面跳转
  const handleJumpToPage = () => {
    const page = parseInt(jumpPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      // 如果输入无效，重置为当前页
      setJumpPage(currentPage.toString());
    }
  };
  
  // 如果没有数据，不显示分页
  if (totalItems === 0) return null;
  
  return (
    <div className="flex items-center justify-between mt-2">
      <div className="text-sm text-gray-500">
        共 {totalItems} 条
      </div>
      
      <div className="flex items-center">
        {/* 每页显示条数选择框 */}
        <div className="relative mr-2" ref={dropdownRef} style={{ zIndex: 50 }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between w-auto min-w-[80px] px-2 py-1 text-sm border border-gray-300 rounded bg-white"
          >
            {itemsPerPage}条/页
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
          
          {dropdownOpen && (
            <div 
              className="absolute bg-white border border-gray-300 shadow-sm" 
              style={{ 
                minWidth: '80px', 
                width: 'auto',
                zIndex: 100,
                bottom: '100%',
                left: 0,
                marginBottom: '2px'
              }}
            >
              {itemsPerPageOptions.map((option) => (
                <button
                  key={option}
                  className="block w-full py-2 text-sm text-center hover:bg-gray-100"
                  onClick={() => {
                    if (onItemsPerPageChange) {
                      console.log('选择每页显示条数:', option, '当前:', itemsPerPage);
                      onItemsPerPageChange(option);
                      // 延迟记录以查看回调是否正确执行
                      setTimeout(() => {
                        console.log('每页显示条数变化回调已执行，期望值:', option);
                      }, 0);
                    } else {
                      console.warn('没有提供onItemsPerPageChange回调函数');
                    }
                    setDropdownOpen(false);
                  }}
                >
                  {option}条/页
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* 上一页按钮 */}
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-8 h-8 flex items-center justify-center border border-gray-300 ${
            currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
          </svg>
        </button>
        
        {/* 页码按钮 */}
        {Array.from({ length: Math.min(totalPages, 3) }).map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`w-8 h-8 flex items-center justify-center border-t border-b border-r border-gray-300 ${
                currentPage === pageNumber ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
        
        {/* 下一页按钮 */}
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-8 h-8 flex items-center justify-center border-t border-b border-r border-gray-300 ${
            currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
          </svg>
        </button>
        
        {/* 跳转到指定页 */}
        <div className="flex items-center ml-4">
          <span className="text-sm text-gray-500 mr-1">前往</span>
          <input
            type="text"
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onBlur={handleJumpToPage}
            onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
            className="w-8 h-8 text-sm text-center border border-gray-300"
          />
          <span className="text-sm text-gray-500 ml-1">页</span>
        </div>
      </div>
    </div>
  );
};

export default Pagination; 