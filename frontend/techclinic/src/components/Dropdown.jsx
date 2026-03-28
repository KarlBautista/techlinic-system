import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'

function Dropdown({ options = [], placeholder = 'Select an option', label, value = '', onChange, name, showValidation = false, disabled = false, lightOnly = false, error }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Support both string options and {label, value} object options
    const normalizedOptions = options.map((opt) =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
    );

    const selectedLabel = normalizedOptions.find((opt) => String(opt.value) === String(value))?.label || '';

    const handleSelect = (option) => {
        if (onChange && !disabled) {
            onChange({ target: { name, value: option.value } });
        }
        setIsOpen(false);
    };

    const borderColor = error
        ? 'ring-red-400 dark:ring-red-500'
        : showValidation && !value
            ? 'ring-crimson-500'
            : isOpen
                ? 'ring-crimson-400 ring-2'
                : lightOnly ? 'ring-gray-200' : 'ring-gray-200 dark:ring-[#1F2A37]';

    return (
        <div className="w-full relative" ref={dropdownRef}>
            {(label || placeholder) && (
                <label className={`block text-xs font-medium uppercase tracking-wider mb-1.5 ${lightOnly ? 'text-gray-500' : 'text-gray-500 dark:text-[#94969C]'}`}>
                    {label || placeholder}
                </label>
            )}
            <button
                type="button"
                onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
                disabled={disabled}
                className={`w-full flex items-center justify-between text-sm px-4 py-3 ring-1 ${borderColor} rounded-xl outline-none transition-all cursor-pointer ${disabled ? (lightOnly ? 'bg-gray-100 !cursor-not-allowed' : 'bg-gray-100 dark:bg-[#1F242F] !cursor-not-allowed') : (lightOnly ? 'bg-white' : 'bg-white dark:bg-[#161B26]')}`}
            >
                <span className={selectedLabel ? (lightOnly ? 'text-gray-800' : 'text-gray-800 dark:text-white') : (lightOnly ? 'text-gray-400' : 'text-gray-400 dark:text-[#94969C]')}>{selectedLabel || placeholder}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${lightOnly ? 'text-gray-400' : 'text-gray-400 dark:text-[#94969C]'} ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute top-full left-0 right-0 mt-1 ring-1 rounded-xl z-[100] shadow-lg max-h-60 overflow-y-auto ${lightOnly ? 'bg-white ring-gray-200' : 'bg-white dark:bg-[#161B26] ring-gray-200 dark:ring-[#1F2A37]'}`}>
                    {normalizedOptions.length === 0 ? (
                        <div className={`px-4 py-3 text-sm ${lightOnly ? 'text-gray-400' : 'text-gray-400 dark:text-[#94969C]'}`}>No options available</div>
                    ) : normalizedOptions.map((option) => {
                        const isSelected = String(option.value) === String(value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${isSelected
                                    ? (lightOnly ? 'bg-crimson-50 text-crimson-600 font-medium' : 'bg-crimson-50 dark:bg-[#1F242F] text-crimson-600 font-medium')
                                    : (lightOnly ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1F242F] dark:bg-[#1F242F]')
                                    }`}
                            >
                                <span>{option.label}</span>
                                {isSelected && <Check className="w-4 h-4 text-crimson-500" />}
                            </button>
                        );
                    })}
                </div>
            )}
            {error && <p className="text-xs text-red-500 mt-1 pl-1">{error}</p>}
        </div>
    )
}

export default Dropdown;
