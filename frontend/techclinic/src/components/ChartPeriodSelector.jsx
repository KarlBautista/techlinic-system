import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'quarter', label: 'Quarterly' },
  { value: 'year', label: 'Yearly' },
  { value: 'custom', label: 'Custom Range' },
];

function ChartPeriodSelector({ selectedCategory, onCategoryChange, customStart, customEnd, onCustomStartChange, onCustomEndChange, onCustomApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const currentLabel = PERIOD_OPTIONS.find(opt => opt.value === selectedCategory)?.label || 'Weekly';

  const handleSelect = (value) => {
    onCategoryChange(value);
    setIsOpen(false);
  };

  return (
    <div className='flex items-center gap-2 flex-wrap'>
      <div ref={dropdownRef} className='relative'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white ring-1 ring-gray-200 text-[11px] font-medium text-gray-600 hover:ring-gray-300 transition-all cursor-pointer'
        >
          <Calendar className="w-3 h-3 text-gray-400" />
          <span>{currentLabel}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className='absolute top-full right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl ring-1 ring-gray-100 py-1.5 z-20'
            >
              {PERIOD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className='w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer'
                >
                  <span className={`text-xs font-medium ${selectedCategory === opt.value ? 'text-crimson-600' : 'text-gray-700'}`}>
                    {opt.label}
                  </span>
                  {selectedCategory === opt.value && (
                    <Check className="w-3.5 h-3.5 text-crimson-500" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedCategory === 'custom' && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className='flex items-center gap-1.5 overflow-hidden'
          >
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className='text-[10px] h-7 px-2 rounded-full ring-1 ring-gray-200 bg-white text-gray-600 outline-none focus:ring-crimson-400 transition-all'
            />
            <span className='text-[10px] text-gray-400'>to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className='text-[10px] h-7 px-2 rounded-full ring-1 ring-gray-200 bg-white text-gray-600 outline-none focus:ring-crimson-400 transition-all'
            />
            <button
              onClick={onCustomApply}
              disabled={!customStart || !customEnd}
              className='text-[10px] font-medium h-7 px-3 rounded-full bg-crimson-600 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-crimson-700 transition-all cursor-pointer'
            >
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChartPeriodSelector;
