import MedicineForm from '../components/MedicineForm.jsx'
import AddMedicineModal from '../components/AddMedicineModal.jsx'
import React, { useState, useMemo, useEffect, useRef } from 'react'
import useMedicine from '../store/useMedicineStore'
import useAuth from '../store/useAuthStore'
import { motion } from 'framer-motion'
import { Search, Plus, Pill, ChevronRight, ChevronLeft, ChevronDown, Beaker, BarChart3 } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const ROWS_OPTIONS = [5, 10, 20, 50];

const newMedicine = () => {
  const { medicines, updateMedicine, deleteMedicine, isLoading } = useMedicine();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'ADMIN';
  const [showForm, setShowForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [medicineFormData, setMedicineFormData] = useState({});
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All Type");
  const [selectedStock, setSelectedStock] = useState("All Stock");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [typeOpen, setTypeOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const typeRef = useRef(null);
  const stockRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeRef.current && !typeRef.current.contains(e.target)) setTypeOpen(false);
      if (stockRef.current && !stockRef.current.contains(e.target)) setStockOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddMedicine = () => {
    setShowAddForm(true);
  };

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const handleUpdateMedicine = (medicine) => {
    setShowForm(!showForm);
    setMedicineFormData(medicine);
  };

  const medicineTypes = useMemo(() => {
    if (!medicines) return [];
    const types = [...new Set(medicines.map(m => m.type).filter(Boolean))];
    return types.sort();
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    if (!medicines) return [];
    return medicines.filter((medicine) => {
      const matchesSearch = medicine.medicine_name?.toLowerCase().includes(search.toLowerCase()) ||
        medicine.generic_name?.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === "All Type" || medicine.type === selectedType;
      const matchesStock = selectedStock === "All Stock" ||
        (selectedStock === "Low" && medicine.stock_level <= 10) ||
        (selectedStock === "Medium" && medicine.stock_level > 10 && medicine.stock_level <= 50) ||
        (selectedStock === "Good" && medicine.stock_level > 50);
      return matchesSearch && matchesType && matchesStock;
    });
  }, [medicines, search, selectedType, selectedStock]);

  const totalPages = Math.ceil((filteredMedicines?.length || 0) / rowsPerPage);
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMedicines.slice(start, start + rowsPerPage);
  }, [filteredMedicines, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedType, selectedStock, rowsPerPage]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <>
      <MedicineForm
        medicine={medicineFormData}
        open={showForm}
        onClose={() => setShowForm(false)}
        onUpdate={(updatedForm) => updateMedicine(updatedForm)}
        onDelete={(medicineId) => deleteMedicine(medicineId)}
      />

      {showAddForm && (
        <AddMedicineModal onClose={() => setShowAddForm(false)} />
      )}

      <div className='flex flex-col gap-4 h-full'>
        {isLoading && !medicines ? (
          <div className='w-full h-full flex flex-col gap-5 animate-pulse print:hidden'>
            {/* Skeleton Header */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 rounded-xl bg-gray-200 dark:bg-[#1F242F]' />
                <div>
                  <div className='h-6 w-48 bg-gray-200 dark:bg-[#1F242F] rounded-lg' />
                  <div className='h-4 w-28 bg-gray-100 dark:bg-[#1F242F] rounded-lg mt-2' />
                </div>
              </div>
              <div className='h-9 w-32 bg-gray-200 dark:bg-[#1F242F] rounded-lg' />
            </div>
            {/* Skeleton Filters */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-28 bg-gray-200 dark:bg-[#1F242F] rounded-full' />
                <div className='h-10 w-28 bg-gray-200 dark:bg-[#1F242F] rounded-full' />
              </div>
              <div className='h-10 w-56 bg-gray-200 dark:bg-[#1F242F] rounded-full' />
            </div>
            {/* Skeleton Table */}
            <div className='bg-white dark:bg-[#161B26] rounded-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] flex-1 flex flex-col overflow-hidden'>
              <div className='px-5 py-3 flex gap-4 border-b border-gray-100 dark:border-[#1F2A37]'>
                {[120, 100, 80, 60, 70, 50, 80].map((w, i) => (
                  <div key={i} className='h-4 bg-gray-200 dark:bg-[#1F242F] rounded' style={{ width: w }} />
                ))}
              </div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='px-5 py-4 flex gap-4 border-b border-gray-50 dark:border-[#1F2A37]'>
                  {[140, 110, 90, 70, 80, 45, 90].map((w, j) => (
                    <div key={j} className='h-4 bg-gray-100 dark:bg-[#1F242F] rounded' style={{ width: w + Math.random() * 20 }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className='w-full h-full flex flex-col gap-5 print:hidden'
        >
          {/* ─── Page Header ─── */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-xl bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center ring-1 ring-crimson-100 dark:ring-[#333741]'>
                <Pill className="w-6 h-6 text-crimson-600" />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Medicine Inventory</h1>
                <p className='text-sm text-gray-400 dark:text-[#94969C] mt-0.5'>
                  {filteredMedicines.length} item{filteredMedicines.length !== 1 ? 's' : ''} total
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => window.print()}
                className='inline-flex items-center justify-center w-10 h-10 bg-white dark:bg-[#161B26] ring-1 ring-gray-200 dark:ring-[#333741] rounded-lg text-gray-600 dark:text-[#94969C] hover:ring-gray-300 dark:hover:ring-[#4B5563] hover:text-gray-800 dark:hover:text-gray-200 dark:hover:bg-[#1F242F] transition-all print:hidden'
                title='Print inventory'
              >
                <i className="fa-solid fa-print text-sm"></i>
              </button>
              <button
                onClick={() => handleAddMedicine()}
                className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-crimson-600 text-white text-xs font-medium hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer print:hidden ${isAdmin ? 'hidden' : ''}`}
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            </div>
          </motion.div>

          {/* ─── Filters & Search ─── */}
          <motion.div variants={itemVariants} className='flex items-center justify-between gap-3 flex-wrap'>
            {/* Left: Filters */}
            <div className='flex items-center gap-2 flex-wrap'>
              {/* Type Dropdown */}
              <div ref={typeRef} className='relative'>
                <button
                  onClick={() => { setTypeOpen(!typeOpen); setStockOpen(false); }}
                  className='inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white dark:bg-[#161B26] ring-1 ring-gray-200 dark:ring-[#333741] text-xs font-medium text-gray-600 dark:text-[#94969C] hover:ring-gray-300 dark:hover:ring-[#4B5563] dark:hover:bg-[#1F242F] transition-all cursor-pointer'
                >
                  <Beaker className="w-4 h-4 text-gray-400 dark:text-[#94969C]" />
                  <span>{selectedType}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-[#94969C] transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
                </button>
                {typeOpen && (
                  <div className='absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#161B26] rounded-2xl shadow-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] py-2 z-20'>
                    <button
                      onClick={() => { setSelectedType("All Type"); setTypeOpen(false); }}
                      className='w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#293040] transition-colors cursor-pointer'
                    >
                      <div className='flex items-center gap-3'>
                        <Beaker className="w-4 h-4 text-gray-400 dark:text-[#94969C]" />
                        <span className={`text-sm font-medium ${selectedType === "All Type" ? 'text-crimson-600' : 'text-gray-700 dark:text-gray-200'}`}>All Type</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedType === "All Type" ? 'border-crimson-600 bg-crimson-600' : 'border-gray-300 dark:border-[#333741]'}`}>
                        {selectedType === "All Type" && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        )}
                      </div>
                    </button>
                    {medicineTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => { setSelectedType(type); setTypeOpen(false); }}
                        className='w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#293040] transition-colors cursor-pointer'
                      >
                        <div className='flex items-center gap-3'>
                          <Pill className="w-4 h-4 text-gray-400 dark:text-[#94969C]" />
                          <span className={`text-sm font-medium ${selectedType === type ? 'text-crimson-600' : 'text-gray-700 dark:text-gray-200'}`}>{type}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedType === type ? 'border-crimson-600 bg-crimson-600' : 'border-gray-300 dark:border-[#333741]'}`}>
                          {selectedType === type && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Stock Dropdown */}
              <div ref={stockRef} className='relative'>
                <button
                  onClick={() => { setStockOpen(!stockOpen); setTypeOpen(false); }}
                  className='inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white dark:bg-[#161B26] ring-1 ring-gray-200 dark:ring-[#333741] text-xs font-medium text-gray-600 dark:text-[#94969C] hover:ring-gray-300 dark:hover:ring-[#4B5563] dark:hover:bg-[#1F242F] transition-all cursor-pointer'
                >
                  <BarChart3 className="w-4 h-4 text-gray-400 dark:text-[#94969C]" />
                  <span>{selectedStock}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-[#94969C] transition-transform ${stockOpen ? 'rotate-180' : ''}`} />
                </button>
                {stockOpen && (
                  <div className='absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#161B26] rounded-2xl shadow-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] py-2 z-20'>
                    {[
                      { value: "All Stock", label: "All Stock" },
                      { value: "Low", label: "Low (≤10)" },
                      { value: "Medium", label: "Medium (11-50)" },
                      { value: "Good", label: "Good (50+)" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSelectedStock(opt.value); setStockOpen(false); }}
                        className='w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#293040] transition-colors cursor-pointer'
                      >
                        <div className='flex items-center gap-3'>
                          <BarChart3 className="w-4 h-4 text-gray-400 dark:text-[#94969C]" />
                          <span className={`text-sm font-medium ${selectedStock === opt.value ? 'text-crimson-600' : 'text-gray-700 dark:text-gray-200'}`}>{opt.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedStock === opt.value ? 'border-crimson-600 bg-crimson-600' : 'border-gray-300 dark:border-[#333741]'}`}>
                          {selectedStock === opt.value && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Search */}
            <div className='flex items-center gap-2'>
              <div className='flex items-center h-10 w-56 px-3 rounded-full bg-white dark:bg-[#161B26] ring-1 ring-gray-200 dark:ring-[#1F2A37] focus-within:ring-crimson-400 transition-all'>
                <Search className="w-3.5 h-3.5 text-gray-400 dark:text-[#94969C] shrink-0" />
                <input
                  type="text"
                  className='outline-none w-full ml-2 text-xs text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-[#94969C] bg-transparent'
                  placeholder='Search medicines...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
          </motion.div>

          {/* ─── Table Card ─── */}
          <motion.div variants={itemVariants} className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden ring-1 ring-gray-100 dark:ring-[#1F2A37]'>
            <div className='overflow-auto flex-1'>
              {paginatedMedicines.length > 0 ? (
                <table className='w-full'>
                  <thead className='sticky top-0 bg-gray-50/95 dark:bg-[#1F242F]/95 backdrop-blur-sm'>
                    <tr>
                      <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3'>Medicine Name</th>
                      <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Generic Name</th>
                      <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3 hidden lg:table-cell'>Brand</th>
                      <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Type</th>
                      <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3 hidden lg:table-cell'>Dosage</th>
                      <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3'>Stock</th>
                      <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Expiry</th>
                      <th className='w-10'></th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50 dark:divide-[#1F2A37]'>
                    {paginatedMedicines.map((medicine) => (
                      <tr
                        key={medicine.id}
                        className={`${isAdmin ? '' : 'cursor-pointer'} hover:bg-crimson-50/40 dark:hover:bg-[#293040] transition-colors group`}
                        onClick={() => !isAdmin && handleUpdateMedicine(medicine)}
                      >
                        <td className='px-5 py-3.5'>
                          <span className='text-sm font-medium text-gray-900 dark:text-white group-hover:text-crimson-600 dark:group-hover:text-crimson-300 transition-colors'>
                            {medicine.medicine_name}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 hidden sm:table-cell'>
                          <span className='text-sm text-gray-600 dark:text-[#94969C]'>{medicine.generic_name}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden lg:table-cell'>
                          <span className='text-sm text-gray-600 dark:text-[#94969C]'>{medicine.brand}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden md:table-cell'>
                          <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-[#1F242F] text-gray-600 dark:text-[#94969C] ring-1 ring-gray-100 dark:ring-[#1F2A37]'>
                            {medicine.type}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 hidden lg:table-cell'>
                          <span className='text-sm text-gray-600 dark:text-[#94969C]'>{medicine.dosage} {medicine.unit_of_measure}</span>
                        </td>
                        <td className='px-5 py-3.5'>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${
                            medicine.stock_level <= 10
                              ? 'bg-red-50 text-red-700 ring-red-100'
                              : medicine.stock_level <= 50
                                ? 'bg-amber-50 text-amber-700 ring-amber-100'
                                : 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                          }`}>
                            {medicine.stock_level}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 hidden md:table-cell'>
                          <span className='text-sm text-gray-500 dark:text-[#94969C]'>{formatDate(medicine.expiry_date)}</span>
                        </td>
                        <td className='px-3 py-3.5'>
                          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-[#94969C] group-hover:text-crimson-500 group-hover:translate-x-0.5 transition-all" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className='flex flex-col items-center justify-center py-20 text-gray-400 dark:text-[#94969C]'>
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#1F242F] flex items-center justify-center mb-4">
                    <Pill className="w-8 h-8 text-gray-300 dark:text-[#94969C]" />
                  </div>
                  <p className='text-sm font-medium text-gray-500 dark:text-[#94969C]'>No medicines found</p>
                  <p className='text-xs text-gray-400 dark:text-[#94969C] mt-1'>Try a different search or filter</p>
                </div>
              )}
            </div>

            {/* ─── Pagination ─── */}
            {totalPages > 0 && (
              <div className='flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-[#1F2A37]'>
                <span className='text-xs text-gray-500 dark:text-[#94969C] font-medium'>
                  Total Items: {filteredMedicines.length}
                </span>

                <div className='flex items-center gap-1'>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-[#94969C] hover:text-crimson-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer'
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer
                        ${currentPage === page
                          ? 'bg-crimson-600 text-white shadow-sm'
                          : 'text-gray-500 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#293040]'}`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-[#94969C] hover:text-crimson-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer'
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-xs text-gray-500 dark:text-[#94969C] font-medium'>Show per Page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className='h-8 px-2 rounded-lg bg-white dark:bg-[#161B26] ring-1 ring-gray-200 dark:ring-[#1F2A37] outline-none text-xs font-medium text-gray-600 dark:text-[#94969C] focus:ring-crimson-400 transition-all cursor-pointer'
                  >
                    {ROWS_OPTIONS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
        )}

        {/* ─── Print-Only Table ─── */}
        <div className='hidden print:block'>
          <h2 className='text-xl font-bold mb-1'>Medicine Inventory</h2>
          <p className='text-sm text-gray-500 mb-4'>Printed on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='border-b-2 border-gray-300'>
                <th className='text-left py-2 font-semibold'>Medicine Name</th>
                <th className='text-left py-2 font-semibold'>Generic Name</th>
                <th className='text-left py-2 font-semibold'>Type</th>
                <th className='text-left py-2 font-semibold'>Dosage</th>
                <th className='text-left py-2 font-semibold'>Stock</th>
                <th className='text-left py-2 font-semibold'>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className='border-b border-gray-200'>
                  <td className='py-2'>{medicine.medicine_name}</td>
                  <td className='py-2'>{medicine.generic_name}</td>
                  <td className='py-2'>{medicine.type}</td>
                  <td className='py-2'>{medicine.dosage} {medicine.unit_of_measure}</td>
                  <td className='py-2'>{medicine.stock_level}</td>
                  <td className='py-2'>{formatDate(medicine.expiry_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className='text-xs text-gray-500 mt-3'>Total: {filteredMedicines.length} item(s)</p>
        </div>
      </div>
    </>
  );
};

export default newMedicine
