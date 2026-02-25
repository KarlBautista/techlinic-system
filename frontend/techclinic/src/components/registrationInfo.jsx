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
            : 'ring-gray-200';

    return (
        <div className="w-full">
            <label
                htmlFor={name}
                className="block text-xs font-medium text-gray-500 mb-1.5 pl-1"
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
                    className={`w-full text-sm px-4 py-2.5 ring-1 ${borderColor} rounded-xl outline-none text-gray-800 transition-all ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
                {value && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}

export default RegistrationInfo;