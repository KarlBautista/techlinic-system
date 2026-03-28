import React, { useState } from 'react'
import { showToast } from './Toast'
import { showModal } from './Modal'
import useMedicine from '../store/useMedicineStore'
import { validateMedicineForm, hasErrors } from '../lib/validation'

const AddMedicineModal = ({ onClose }) => {
  const { insertMedicine } = useMedicine()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [form, setForm] = useState({
    name: '',
    generic: '',
    brand: '',
    type: '',
    dosage: '',
    unit: '',
    stock: '',
    batch: '',
    expiry: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      const allErrors = validateMedicineForm({ ...form, [name]: value })
      setErrors(prev => ({ ...prev, [name]: allErrors[name] || '' }))
    }
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const allErrors = validateMedicineForm(form)
    setErrors(prev => ({ ...prev, [field]: allErrors[field] || '' }))
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      if (onClose) onClose()
    }, 150)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    // Validate all fields
    const allErrors = validateMedicineForm(form)
    setErrors(allErrors)
    setTouched({ name: true, generic: true, brand: true, type: true, dosage: true, unit: true, stock: true, batch: true, expiry: true })

    if (hasErrors(allErrors)) {
      const firstError = Object.values(allErrors).find(e => e !== '')
      showToast({ title: 'Validation Error', message: firstError, type: 'warning' })
      return
    }

    const confirmed = await showModal({
      type: "confirm",
      title: "Confirm Add Medicine",
      confirmLabel: "Add Medicine",
      cancelLabel: "Cancel",
    })
    if (!confirmed) return

    setIsSubmitting(true)

    try {
      const response = await insertMedicine(form)
      if (!response.success) {
        showToast({ title: 'Something went wrong', message: 'Could not add medicine, please retry', type: 'error' })
        return
      }
      showToast({ title: 'Medicine Added Successfully', message: 'The new medicine has been added to inventory', type: 'success' })
      setForm({ name: '', generic: '', brand: '', type: '', dosage: '', unit: '', stock: '', batch: '', expiry: '' })
      setErrors({})
      setTouched({})
      handleClose()
      window.location.reload()
    } catch (err) {
      console.error(`Something went wrong adding medicine: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 ${isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className={`relative z-10 w-[min(640px,92%)] bg-white dark:bg-[#161B26] rounded-2xl shadow-2xl overflow-hidden ${isClosing ? 'modal-content-exit' : 'modal-content-enter'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#1F2A37]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#b01c34]/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#b01c34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Medicine</h3>
              <p className="text-xs text-gray-500 dark:text-[#94969C]">Fill in the details to add to inventory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#94969C] hover:text-gray-600 dark:hover:text-gray-300  hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Medicine Name <span className="text-red-500">*</span></span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              maxLength={200}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.name && errors.name ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="Paracetamol"
              required
            />
            {touched.name && errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Generic Name</span>
            <input
              name="generic"
              value={form.generic}
              onChange={handleChange}
              onBlur={() => handleBlur('generic')}
              maxLength={200}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.generic && errors.generic ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="Acetaminophen"
            />
            {touched.generic && errors.generic && <p className="text-xs text-red-500">{errors.generic}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Brand / Manufacturer</span>
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              onBlur={() => handleBlur('brand')}
              maxLength={200}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.brand && errors.brand ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="ABC Pharma"
            />
            {touched.brand && errors.brand && <p className="text-xs text-red-500">{errors.brand}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Type / Form</span>
            <input
              name="type"
              value={form.type}
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
              value={form.dosage}
              onChange={handleChange}
              onBlur={() => handleBlur('dosage')}
              maxLength={100}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.dosage && errors.dosage ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="500mg"
            />
            {touched.dosage && errors.dosage && <p className="text-xs text-red-500">{errors.dosage}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Unit of Measure <span className="text-red-500">*</span></span>
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              onBlur={() => handleBlur('unit')}
              maxLength={50}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.unit && errors.unit ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="e.g. mg, mL, IU"
            />
            {touched.unit && errors.unit && <p className="text-xs text-red-500">{errors.unit}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Stock Level <span className="text-red-500">*</span></span>
            <input
              name="stock"
              value={form.stock}
              onChange={handleChange}
              onBlur={() => handleBlur('stock')}
              type="number"
              min="0"
              max="999999"
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.stock && errors.stock ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="100"
            />
            {touched.stock && errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Batch Number <span className="text-red-500">*</span></span>
            <input
              name="batch"
              value={form.batch}
              onChange={handleChange}
              onBlur={() => handleBlur('batch')}
              maxLength={50}
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none ${touched.batch && errors.batch ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
              placeholder="B1234"
            />
            {touched.batch && errors.batch && <p className="text-xs text-red-500">{errors.batch}</p>}
          </label>

          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Expiry Date <span className="text-red-500">*</span></span>
            <input
              name="expiry"
              value={form.expiry}
              onChange={handleChange}
              onBlur={() => handleBlur('expiry')}
              type="date"
              className={`h-10 px-3 rounded-lg border text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:focus:bg-[#161B26] focus:ring-1 transition-all outline-none max-w-xs ${touched.expiry && errors.expiry ? 'border-red-400 dark:border-red-500 focus:border-red-400 focus:ring-red-200' : 'border-gray-200 dark:border-[#1F2A37] focus:border-[#b01c34] focus:ring-[#b01c34]/20'}`}
            />
            {touched.expiry && errors.expiry && <p className="text-xs text-red-500">{errors.expiry}</p>}
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-[#1F2A37] bg-gray-50/50 dark:bg-[#0C111D]">
          <button
            type="button"
            onClick={handleClose}
            className="text-sm px-4 py-2 rounded-lg text-gray-600 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-sm px-5 py-2 rounded-lg bg-[#b01c34] text-white hover:bg-[#8f1629] font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              'Add Medicine'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddMedicineModal