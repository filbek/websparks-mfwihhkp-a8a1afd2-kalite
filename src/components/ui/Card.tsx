import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-secondary-200 p-6', className)}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('mb-4 pb-4 border-b border-secondary-200', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <h3 className={cn('text-lg font-semibold text-secondary-900', className)}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
};
