import { useState } from 'react'

function RegistrationInfo({ message, type = 'text', value = '', onChange, name, onClear, onBlur, showValidation = false, disabled = false, labelPosition = 'left' }) {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = () => {
        if (onClear) {
            onClear();
        } else if (onChange) {
            onChange({ target: { name, value: '' } });
        }
        setIsFocused(false);
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (onBlur) {
            onBlur();
        }
    };

    const borderColor = showValidation && !value ? 'ring-crimson-500' : (isFocused ? 'ring-crimson-400 ring-2' : 'ring-gray-200');

    const labelPositionClass = labelPosition === 'right'
        ? (isFocused || value ? 'top-[-5px] right-[0] text-[.6rem] text-gray-600' : 'top-5 right-4 text-[.8rem] text-gray-400')
        : (isFocused || value ? 'top-[-5px] left-[0] text-[.6rem] text-gray-600' : 'top-5 left-4 text-[.8rem] text-gray-400');

    return (
        <>
            <div className="relative shrink-0 h-[60px] items-center flex w-full">
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    disabled={disabled}
                    className={`w-full flex items-center text-sm px-4 py-2.5 ring-1 ${borderColor} rounded-xl outline-none text-gray-800 transition-all ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 font-bold"
                    >
                        ✕
                    </button>
                )}
                <label
                    htmlFor={name}
                    className={`absolute transition-all duration-300 pointer-events-none ${labelPositionClass}`}
                >
                    {message}
                </label>
            </div>
        </>
    )
}

export default RegistrationInfo;