import { useState } from 'react';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export default function Checkbox({ 
  checked = false, 
  onChange, 
  className = '', 
  disabled = false 
}: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(!!checked);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    onChange?.(e.target.checked);
  };

  return (
    <input
      type="checkbox"
      className={`h-4 w-4 text-primary border-gray-300 rounded ${className}`}
      checked={isChecked}
      onChange={handleChange}
      disabled={disabled}
    />
  );
}
