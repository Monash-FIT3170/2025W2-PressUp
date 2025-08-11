import React from "react";

interface FinanceCardProps {
  title: string;
  amount: number;
  isSelected?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'large';
  showCurrency?: boolean;
  className?: string;
}

export const FinanceCard = ({ 
  title, 
  amount, 
  isSelected = false, 
  onClick,
  variant = 'default',
  showCurrency = true,
  className = ''
}: FinanceCardProps) => {
  const isNegative = amount < 0;
  const sign = isNegative ? '-' : '';
  const isClickable = onClick !== undefined;
  
  const baseClasses = "rounded-lg transition-all duration-200";
  const interactiveClasses = isClickable 
    ? "cursor-pointer hover:shadow-md" 
    : "";
  
  const selectedClasses = isSelected 
    ? "bg-pink-300 ring-2 ring-pink-400 shadow-lg" 
    : "bg-pink-200 hover:bg-pink-250";
    
  const variantClasses = {
    default: "p-6",
    compact: "p-4",
    large: "p-8"
  };
  
  const titleSizes = {
    default: "text-3xl",
    compact: "text-2xl", 
    large: "text-4xl"
  };
  
  const amountSizes = {
    default: "text-xl",
    compact: "text-lg",
    large: "text-2xl"
  };

  return (
    <div 
      className={`
        ${baseClasses} 
        ${interactiveClasses} 
        ${selectedClasses} 
        ${variantClasses[variant]}
        ${className}
        text-center
      `}
      onClick={onClick}
    >
      {showCurrency && (
        <div className={`${titleSizes[variant]} font-bold text-gray-800 mb-2`}>
          $
        </div>
      )}
      
      <div className={`${amountSizes[variant]} font-semibold mb-1 ${
        isNegative ? 'text-red-700' : 'text-green-700'
      }`}>
        ({sign}) {Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
      
      <div className="text-sm text-gray-600 font-medium">
        {title}
      </div>
    </div>
  );
};