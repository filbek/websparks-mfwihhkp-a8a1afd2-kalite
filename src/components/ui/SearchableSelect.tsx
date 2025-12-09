import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    label?: string;
    error?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    error,
    options,
    value,
    onChange,
    placeholder = 'Seçiniz...',
    disabled = false,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-1" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-secondary-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={cn(
                        'w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors bg-white flex justify-between items-center',
                        error ? 'border-danger-500 focus:ring-danger-500' : 'border-secondary-300',
                        disabled && 'bg-secondary-50 cursor-not-allowed opacity-70',
                        className
                    )}
                    disabled={disabled}
                >
                    <span className={cn('block truncate', !selectedOption && 'text-secondary-400')}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <i className="bi bi-chevron-down text-secondary-400 text-xs ml-2"></i>
                </button>

                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-secondary-100">
                            <input
                                type="text"
                                className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:outline-none focus:border-primary-500"
                                placeholder="Ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={cn(
                                            'w-full px-3 py-2 text-left text-sm hover:bg-primary-50 transition-colors',
                                            option.value === value && 'bg-primary-50 text-primary-700 font-medium'
                                        )}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setSearchQuery('');
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-secondary-500 text-center">
                                    Sonuç bulunamadı
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && (
                <p className="text-sm text-danger-600">{error}</p>
            )}
        </div>
    );
};
