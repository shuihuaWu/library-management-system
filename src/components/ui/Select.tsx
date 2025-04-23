import React, { forwardRef } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
  onValueChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, fullWidth = false, className = '', onChange, onValueChange, value, ...props }, ref) => {
    const baseStyles = 'block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:outline-none sm:text-sm sm:leading-6';
    const errorStyles = error
      ? 'ring-red-300 focus:ring-red-500'
      : 'ring-gray-300 focus:ring-blue-600';
    const widthStyle = fullWidth ? 'w-full' : '';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e);
      }
      
      if (onValueChange) {
        onValueChange(e.target.value);
      }
    };

    // 检查是否有有效的选项
    const hasValue = value !== undefined && value !== null && value !== '';
    
    // 检查选中的值是否在选项列表中
    const valueInOptions = hasValue && options.some(option => option.value.toString() === value.toString());
    
    // 如果有值，但不在选项中，添加到控制台日志
    if (hasValue && !valueInOptions && options.length > 0) {
      console.log(`警告: Select 组件选中值 ${value} 不在选项列表中`, options);
    }

    return (
      <div className={`${widthStyle} ${className}`}>
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="block text-sm font-medium leading-6 text-gray-900 mb-1"
          >
            {label}
          </label>
        )}
        <div>
          <select
            ref={ref}
            className={`${baseStyles} ${errorStyles}`}
            onChange={handleChange}
            value={value}
            {...props}
          >
            <option value="" disabled={hasValue}>请选择</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 