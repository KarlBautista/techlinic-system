import React, { useEffect, useState } from 'react'
import { showToast } from './Toast'
import { showModal } from './Modal'
const MedicineForm = ({ medicine, onUpdate, onDelete, onClose }) => {
  const [form, setForm] = useState({})
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    setForm(prev => ({ ...prev, ...medicine }))
  }, [medicine])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      if (onClose) onClose();
    }, 150);
  };

  const handleUpdate = async (e) => {
    e.preventDefault()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 ${isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <form
        onSubmit={handleUpdate}
        className={`relative z-10 w-[min(640px,92%)] bg-white dark:bg-[#161B26] rounded-2xl shadow-2xl overflow-hidden ${isClosing ? 'modal-content-exit' : 'modal-content-enter'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#1F2A37]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#b01c34]/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#b01c34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medicine Details</h3>
              <p className="text-xs text-gray-500 dark:text-[#94969C]">Update or remove this medicine</p>
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
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Medicine Name</span>
            <input
              name="medicine_name"
              value={form?.medicine_name || ''}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:bg-[#161B26] focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="Medicine name"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Generic Name</span>
            <input
              name="generic_name"
              value={form.generic_name || ''}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:bg-[#161B26] focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="Generic name"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Brand / Manufacturer</span>
            <input
              name="brand"
              value={form.brand || ''}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:bg-[#161B26] focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="Brand or manufacturer"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Type / Form</span>
            <input
              name="type"
              value={form.type || ''}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:bg-[#161B26] focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="e.g. Tablet, Syrup, Injection"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Dosage</span>
            <input
              name="dosage"
              value={form.dosage || ''}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:bg-[#161B26] focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="e.g. 500 mg"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Unit of Measure</span>
            <input
              name="unit_of_measure"
              value={form.unit_of_measure || ''}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:bg-[#161B26] focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="e.g. mg, mL, IU"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Stock Level</span>
            <input
              name="stock_level"
              value={form.stock_level || ''}
              onChange={handleChange}
              type="number"
              min="0"
              className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:bg-[#161B26] focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="Quantity in stock"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Batch Number</span>
            <input
              name="batch_number"
              value={form.batch_number || ''}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:bg-[#161B26] focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="Batch number"
            />
          </label>

          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs font-medium text-gray-600 dark:text-[#94969C] uppercase tracking-wide">Expiry Date</span>
            <input
              name="expiry_date"
              value={formatDateForInput(form.expiry_date) || ''}
              onChange={handleChange}
              type="date"
              className="h-10 px-3 rounded-lg border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F] focus:bg-white dark:bg-[#161B26] focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none max-w-xs"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-[#1F2A37] bg-gray-50/50 dark:bg-[#0C111D]">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            Delete
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="text-sm px-4 py-2 rounded-lg text-gray-600 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm px-5 py-2 rounded-lg bg-[#b01c34] text-white hover:bg-[#8f1629] font-medium transition-colors shadow-sm cursor-pointer"
            >
              Update Medicine
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default MedicineForm