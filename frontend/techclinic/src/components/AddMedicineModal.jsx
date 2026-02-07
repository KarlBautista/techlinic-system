import React, { useState } from 'react'
import Swal from 'sweetalert2'
import useMedicine from '../store/useMedicineStore'

const AddMedicineModal = ({ onClose }) => {
  const { insertMedicine } = useMedicine()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
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
    setIsSubmitting(true)

    try {
      const response = await insertMedicine(form)
      if (!response.success) {
        Swal.fire({
          title: 'Something went wrong',
          text: 'Could not add medicine, please retry',
          icon: 'error',
          showConfirmButton: true
        })
        return
      }
      const result = await Swal.fire({
        title: 'Medicine Added Successfully',
        text: 'The new medicine has been added to inventory',
        icon: 'success',
        showConfirmButton: true
      })
      if (result.isConfirmed) {
        handleClose()
        window.location.reload()
      }
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
        className={`relative z-10 w-[min(640px,92%)] bg-white rounded-2xl shadow-2xl overflow-hidden ${isClosing ? 'modal-content-exit' : 'modal-content-enter'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#b01c34]/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#b01c34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add New Medicine</h3>
              <p className="text-xs text-gray-500">Fill in the details to add to inventory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Medicine Name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="Paracetamol"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Generic Name</span>
            <input
              name="generic"
              value={form.generic}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="Acetaminophen"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Brand / Manufacturer</span>
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="ABC Pharma"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Type / Form</span>
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="e.g. Tablet, Syrup, Injection"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Dosage</span>
            <input
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="500mg"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Unit of Measure</span>
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="e.g. mg, mL, IU"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Stock Level</span>
            <input
              name="stock"
              value={form.stock}
              onChange={handleChange}
              type="number"
              min="0"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="100"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Batch Number</span>
            <input
              name="batch"
              value={form.batch}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none"
              placeholder="B1234"
            />
          </label>

          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Expiry Date</span>
            <input
              name="expiry"
              value={form.expiry}
              onChange={handleChange}
              type="date"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:border-[#b01c34] focus:ring-1 focus:ring-[#b01c34]/20 transition-all outline-none max-w-xs"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={handleClose}
            className="text-sm px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors cursor-pointer"
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
