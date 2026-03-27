import { useState } from 'react'

function RegistrationInfo({ message, type = 'text', value = '', onChange, name, onClear, onBlur, showValidation = false, disabled = false }) {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = () => {
        if (onClear) {
            onClear();
        } else if (onChange) {
            onChange({ target: { name, value: '' } });
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (onBlur) {
            onBlur();
        }
    };

    const borderColor = showValidation && !value
        ? 'ring-crimson-500'
        : isFocused
            ? 'ring-crimson-400 ring-2'
            : 'ring-gray-200 dark:ring-[#1F2A37]';

    return (
        <div className="w-full">
            <label
                htmlFor={name}
                className="block text-xs font-medium text-gray-500 dark:text-[#94969C] mb-1.5 pl-1"
            >
                {message}
            </label>
            <div className="relative">
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    disabled={disabled}
                    className={`w-full text-sm px-4 py-2.5 ring-1 ${borderColor} rounded-xl outline-none text-gray-800 dark:text-white transition-all ${disabled ? 'bg-gray-100 dark:bg-[#1F242F] cursor-not-allowed' : 'bg-white dark:bg-[#161B26]'}`}
                />
                {value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#94969C] hover:text-gray-600 dark:hover:text-gray-300  font-bold text-xs"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}

export default RegistrationInfo;