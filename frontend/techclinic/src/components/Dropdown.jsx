import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'

function Dropdown({ options = [], placeholder = 'Select an option', label, value = '', onChange, name, showValidation = false, disabled = false }) {
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

    const borderColor = showValidation && !value
        ? 'ring-crimson-500'
        : isOpen
            ? 'ring-crimson-400 ring-2'
            : 'ring-gray-200';

    return (
        <div className="w-full relative" ref={dropdownRef}>
            {(label || placeholder) && (
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                    {label || placeholder}
                </label>
            )}
            <button
                type="button"
                onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
                disabled={disabled}
                className={`w-full flex items-center justify-between text-sm px-4 py-3 ring-1 ${borderColor} rounded-xl outline-none transition-all cursor-pointer ${disabled ? 'bg-gray-100 !cursor-not-allowed' : 'bg-white'}`}
            >
                <span className={selectedLabel ? 'text-gray-800' : 'text-gray-400'}>{selectedLabel || placeholder}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white ring-1 ring-gray-200 rounded-xl z-[100] shadow-lg max-h-60 overflow-y-auto'>
                    {normalizedOptions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400">No options available</div>
                    ) : normalizedOptions.map((option) => {
                        const isSelected = String(option.value) === String(value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${isSelected
                                    ? 'bg-crimson-50 text-crimson-600 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span>{option.label}</span>
                                {isSelected && <Check className="w-4 h-4 text-crimson-500" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default Dropdown;