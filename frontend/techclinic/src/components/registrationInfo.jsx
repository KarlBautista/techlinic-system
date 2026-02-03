import { useState } from 'react'

function RegistrationInfo({ message, type = 'text', value = '', onChange, name, onClear, onBlur }) {
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
                    className="w-full flex items-center text-[.9rem] px-4 py-2 outline outline-[black] rounded-[5px]"
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
                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${isFocused || value
                        ? 'top-[-5px] left-[0] text-[.6rem] text-gray-600'
                        : 'top-5  text-[.8rem] text-gray-400'
                        }`}
                >
                    {message}
                </label>
            </div>
        </>
    )
}

export default RegistrationInfo;