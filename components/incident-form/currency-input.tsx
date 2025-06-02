'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { useGuaraniFormatter } from '@/hooks/useGuaraniFormatter';

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CurrencyInput({ 
  label, 
  value, 
  onChange, 
  placeholder = "0", 
  disabled = false,
  className 
}: CurrencyInputProps) {
  const { formatInputValue, parseNumber, formatCurrency } = useGuaraniFormatter();
  const [displayValue, setDisplayValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  // Update display value when value prop changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatInputValue(value));
    }
  }, [value, formatInputValue, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    // Parse and call onChange
    const numericValue = parseNumber(inputValue);
    onChange(numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number for editing
    setDisplayValue(value > 0 ? value.toString() : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format the display value
    setDisplayValue(formatInputValue(value));
  };

  return (
    <div className="space-y-2">
      <FormLabel className="flex items-center gap-2">
        {label}
        {value > 0 && !isFocused && (
          <span className="text-xs text-muted-foreground font-normal">
            ({formatCurrency(value)})
          </span>
        )}
      </FormLabel>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
          ₲
        </span>
        <Input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`pl-8 ${className}`}
        />
      </div>
    </div>
  );
} 