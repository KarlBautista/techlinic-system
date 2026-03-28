import { useState } from 'react'

function RegistrationInfo({ message, type = 'text', value = '', onChange, name, onClear, onBlur, showValidation = false, disabled = false, lightOnly = false, maxLength, error }) {
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

    const borderColor = error
        ? 'ring-red-400 dark:ring-red-500'
        : showValidation && !value
            ? 'ring-crimson-500'
            : isFocused
                ? 'ring-crimson-400 ring-2'
                : lightOnly ? 'ring-gray-200' : 'ring-gray-200 dark:ring-[#1F2A37]';

    return (
        <div className="w-full">
            <label
                htmlFor={name}
                className={`block text-xs font-medium mb-1.5 pl-1 ${lightOnly ? 'text-gray-500' : 'text-gray-500 dark:text-[#94969C]'}`}
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
                    maxLength={maxLength}
                    className={`w-full text-sm px-4 py-2.5 ring-1 ${borderColor} rounded-xl outline-none transition-all ${lightOnly ? 'text-gray-800' : 'text-gray-800 dark:text-white'} ${disabled ? (lightOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-100 dark:bg-[#1F242F] cursor-not-allowed') : (lightOnly ? 'bg-white' : 'bg-white dark:bg-[#161B26]')}`}
                />
                {value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs ${lightOnly ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 dark:text-[#94969C] hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        ✕
                    </button>
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1 pl-1">{error}</p>}
        </div>
    )
}

export default RegistrationInfo;
