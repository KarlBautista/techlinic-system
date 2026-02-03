import { useState } from 'react'

function Dropdown({ options = [], placeholder = 'Select an option', value = '', onChange, name }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        if (onChange) {
            onChange({ target: { name, value: option } });
        }
        setIsOpen(false);
    };

    return (
        <>
            <div className="relative shrink-0 h-[60px] items-center flex w-full">
                <div className="relative w-full">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center justify-between text-[.9rem] px-4 py-2 outline outline-[black] rounded-[5px] bg-white"
                    >
                        <span className={value ? 'text-black' : 'text-gray-400'}>{value || placeholder}</span>
                        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white outline outline-[black] rounded-[5px] z-10">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className="w-full text-left px-4 py-2 text-[.9rem] hover:bg-gray-100 cursor-pointer"
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