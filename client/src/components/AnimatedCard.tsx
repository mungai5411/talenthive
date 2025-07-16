import React, { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hover = true 
}) => {
  return (
    <div
      className={`
        card transform transition-all duration-300 ease-in-out
        ${hover ? 'hover:scale-105 hover:shadow-xl hover:-translate-y-1' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;