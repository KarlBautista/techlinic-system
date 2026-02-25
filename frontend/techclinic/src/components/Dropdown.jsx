import { useState } from 'react'

function Dropdown({ options = [], placeholder = 'Select an option', value = '', onChange, name, showValidation = false, disabled = false }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        if (onChange && !disabled) {
            onChange({ target: { name, value: option } });
        }
        setIsOpen(false);
    };

    const borderColor = showValidation && !value ? 'ring-crimson-500' : (isOpen ? 'ring-crimson-400 ring-2' : 'ring-gray-200');

    return (
        <>
            <div className="relative shrink-0 h-[60px] items-center flex w-full">
                <div className="relative w-full">
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        disabled={disabled}
                        className={`w-full flex items-center justify-between text-sm px-4 py-2.5 ring-1 ${borderColor} rounded-xl outline-none transition-all ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    >
                        <span className={value ? 'text-gray-800' : 'text-gray-400'}>{value || placeholder}</span>
                        <span className={`transition-transform duration-300 text-gray-400 text-xs ${isOpen ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {isOpen && (
                        <div className='absolute top-full left-0 right-0 mt-1 bg-white ring-1 ring-gray-200 rounded-xl z-10 shadow-lg overflow-hidden'>
                            {options.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-crimson-50 hover:text-crimson-600 cursor-pointer transition-colors"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Dropdown;