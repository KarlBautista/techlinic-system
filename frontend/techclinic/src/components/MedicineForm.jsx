import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { showToast } from './Toast'
import { showModal } from './Modal'
import { validateMedicineForm, hasErrors } from '../lib/validation'

const MedicineForm = ({ medicine, onUpdate, onDelete, onClose, open }) => {
  const [form, setForm] = useState({})
  const [originalForm, setOriginalForm] = useState({})
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    setForm(prev => ({ ...prev, ...medicine }))
    setOriginalForm(prev => ({ ...prev, ...medicine }))
    setErrors({})
    setTouched({})
  }, [medicine])

  const hasChanges = useMemo(() => {
    const fields = ['medicine_name', 'generic_name', 'brand', 'type', 'dosage', 'unit_of_measure', 'stock_level', 'batch_number', 'expiry_date'];
    return fields.some(f => String(form[f] ?? '') !== String(originalForm[f] ?? ''));
  }, [form, originalForm])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      const allErrors = validateMedicineForm({ ...form, [name]: value })
      // Map field keys for edit form (uses different keys than insert)
      const fieldMap = { medicine_name: 'name', generic_name: 'generic', unit_of_measure: 'unit', stock_level: 'stock', batch_number: 'batch', expiry_date: 'expiry' }
      const mappedKey = fieldMap[name] || name
      setErrors(prev => ({ ...prev, [name]: allErrors[mappedKey] || '' }))
    }
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const allErrors = validateMedicineForm(form)
    const fieldMap = { medicine_name: 'name', generic_name: 'generic', unit_of_measure: 'unit', stock_level: 'stock', batch_number: 'batch', expiry_date: 'expiry' }
    const mappedKey = fieldMap[field] || field
    setErrors(prev => ({ ...prev, [field]: allErrors[mappedKey] || '' }))
  }

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleUpdate = async (e) => {
    e.preventDefault()

    // Validate all fields before update
    const allErrors = validateMedicineForm(form)
    const fieldMap = { name: 'medicine_name', generic: 'generic_name', unit: 'unit_of_measure', stock: 'stock_level', batch: 'batch_number', expiry: 'expiry_date' }
    const mappedErrors = {}
    for (const [key, val] of Object.entries(allErrors)) {
      mappedErrors[fieldMap[key] || key] = val
    }
    setErrors(mappedErrors)
    setTouched(Object.fromEntries(Object.keys(mappedErrors).map(k => [k, true])))

    if (hasErrors(mappedErrors)) {
      const firstError = Object.values(mappedErrors).find(e => e !== '')
      showToast({ title: 'Validation Error', message: firstError, type: 'warning' })
      return
    }

    if (onUpdate) onUpdate(form)
    showToast({ title: "Medicine updated successfully", message: "The updated medicine version will be displayed in the table", type: "success" })
    handleClose()
    window.location.reload()
  }

  const handleDelete = async () => {
    const confirmed = await showModal({
      type: "delete",
      title: "Delete Medicine?",
      message: `Are you sure you want to delete this medicine (${form.id} - ${form.medicine_name})? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    })
    if (confirmed) {
      if (onDelete) onDelete(form.id)
      showToast({ title: "Medicine deleted successfully", message: "The table will be updated", type: "success" })
      onClose()
      window.location.reload()
    }
  }
  
  
    function formatDateForInput(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); 
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`; 
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/60" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white dark:bg-[#161B26] rounded-2xl shadow-2xl flex flex-col overflow-hidden mx-4"
          >
      <form onSubmit={handleUpdate} className="flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Medicine Details</h2>
            <div className="flex items-center gap-1">
              {hasChanges && (
                <button
                  type="submit"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#94969C] hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                  title="Update medicine"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={handleDelete}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#94969C] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                title="Delete medicine"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#94969C] hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F242F] transition-colors cursor-pointer"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Medicine Name <span className="text-red-500">*</span></span>
            <input
              name="medicine_name"
              value={form?.medicine_name || ''}
              onChange={handleChange}
              onBlur={() => handleBlur('medicine_name')}
              maxLength={200}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.medicine_name && errors.medicine_name ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="Medicine name"
              required
            />
            {touched.medicine_name && errors.medicine_name && <p className="text-xs text-red-500">{errors.medicine_name}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Generic Name</span>
            <input
              name="generic_name"
              value={form.generic_name || ''}
              onChange={handleChange}
              onBlur={() => handleBlur('generic_name')}
              maxLength={200}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.generic_name && errors.generic_name ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="Generic name"
            />
            {touched.generic_name && errors.generic_name && <p className="text-xs text-red-500">{errors.generic_name}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Brand / Manufacturer</span>
            <input
              name="brand"
              value={form.brand || ''}
              onChange={handleChange}
              onBlur={() => handleBlur('brand')}
              maxLength={200}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.brand && errors.brand ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="Brand or manufacturer"
            />
            {touched.brand && errors.brand && <p className="text-xs text-red-500">{errors.brand}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Type / Form</span>
            <input
              name="type"
              value={form.type || ''}
              onChange={handleChange}
              onBlur={() => handleBlur('type')}
              maxLength={100}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.type && errors.type ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="e.g. Tablet, Syrup, Injection"
            />
            {touched.type && errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Dosage <span className="text-red-500">*</span></span>
            <input
              name="dosage"
              value={form.dosage || ''}
              onChange={handleChange}
              onBlur={() => handleBlur('dosage')}
              maxLength={100}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.dosage && errors.dosage ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="e.g. 500 mg"
            />
            {touched.dosage && errors.dosage && <p className="text-xs text-red-500">{errors.dosage}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Unit of Measure <span className="text-red-500">*</span></span>
            <input
              name="unit_of_measure"
              value={form.unit_of_measure || ''}
              onChange={handleChange}
              onBlur={() => handleBlur('unit_of_measure')}
              maxLength={50}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.unit_of_measure && errors.unit_of_measure ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="e.g. mg, mL, IU"
            />
            {touched.unit_of_measure && errors.unit_of_measure && <p className="text-xs text-red-500">{errors.unit_of_measure}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Stock Level <span className="text-red-500">*</span></span>
            <input
              name="stock_level"
              value={form.stock_level || ''}
              onChange={handleChange}
              onBlur={() => handleBlur('stock_level')}
              type="number"
              min="0"
              max="999999"
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.stock_level && errors.stock_level ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="Quantity in stock"
            />
            {touched.stock_level && errors.stock_level && <p className="text-xs text-red-500">{errors.stock_level}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Batch Number <span className="text-red-500">*</span></span>
            <input
              name="batch_number"
              value={form.batch_number || ''}
              onChange={handleChange}
              onBlur={() => handleBlur('batch_number')}
              maxLength={50}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.batch_number && errors.batch_number ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="Batch number"
            />
            {touched.batch_number && errors.batch_number && <p className="text-xs text-red-500">{errors.batch_number}</p>}
          </label>

          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Expiry Date <span className="text-red-500">*</span></span>
            <input
              name="expiry_date"
              value={formatDateForInput(form.expiry_date) || ''}
              onChange={handleChange}
              onBlur={() => handleBlur('expiry_date')}
              type="date"
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none max-w-xs ${touched.expiry_date && errors.expiry_date ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
            />
            {touched.expiry_date && errors.expiry_date && <p className="text-xs text-red-500">{errors.expiry_date}</p>}
          </label>
        </div>
      </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MedicineForm