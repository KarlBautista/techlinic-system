import React, { useEffect, useState } from 'react'

const MedicineForm = ({ medicine, onUpdate, onDelete, onClose }) => {
  const [form, setForm] = useState({})

  useEffect(() => {
    setForm(prev => ({ ...prev, ...medicine }))
  }, [medicine])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdate = e => {
    e.preventDefault()
    if (onUpdate) onUpdate(form)
  }

  const handleDelete = () => {
    const ok = window.confirm(`Delete medicine "${form.name || form.id}"?`)
    if (!ok) return
    if (onDelete) onDelete(form.id ?? form)
  }
  
  console.log(form);
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
  
      <div
        className="absolute inset-0 bg-black/60 "
        onClick={() => onClose && onClose()}
      />

    
      <form
        onSubmit={handleUpdate}
        className="relative z-10 w-[min(720px,95%)] bg-white/70  border border-white/20 rounded-xl p-6 shadow-xl grid grid-cols-1 gap-4 md:grid-cols-2"
        role="dialog"
        aria-modal="true"
      >
        <div className="md:col-span-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Medicine details</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onClose && onClose()}
              className="text-sm px-3 py-1 rounded-md bg-white/60 hover:bg-white/80"
            >
              Close
            </button>
          </div>
        </div>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">Medicine Name</span>
          <input
            name="medicine_name"
            value={form?.medicine_name || ''}
            onChange={handleChange}
            className="mt-1 p-2 rounded-md border border-white/30 bg-white/80"
            placeholder="Medicine name"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">Generic name</span>
          <input
            name="generic_name"
            value={form.generic_name || ''}
            onChange={handleChange}
            className="mt-1 p-2 rounded-md border border-white/30 bg-white/80"
            placeholder="Generic name"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">Brand / Manufacturer</span>
          <input
            name="brand"
            value={form.brand || ''}
            onChange={handleChange}
            className="mt-1 p-2 rounded-md border border-white/30 bg-white/80"
            placeholder="Brand or manufacturer"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">Type / Form</span>
          <input
            name="type"
            value={form.type || ''}
            onChange={handleChange}
            className="mt-1 p-2 rounded-md border border-white/30 bg-white/80"
            placeholder="e.g. Tablet, Syrup, Injection"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">Dosage</span>
          <input
            name="dosage"
            value={form.dosage || ''}
            onChange={handleChange}
            className="mt-1 p-2 rounded-md border border-white/30 bg-white/80"
            placeholder="e.g. 500 mg"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">Unit of measure</span>
          <input
            name="unit_of_measure"
            value={form.unit_of_measure || ''}
            onChange={handleChange}
            className="mt-1 p-2 rounded-md border border-white/30 bg-white/80"
            placeholder="e.g. mg, mL, IU"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">Stock level</span>
          <input
            name="stock_level"
            value={form.stock_level || ''}
            onChange={handleChange}
            type="number"
            min="0"
            className="mt-1 p-2 rounded-md border border-white/30 bg-white/80"
            placeholder="Quantity in stock"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">Batch number</span>
          <input
            name="batch_number"
            value={form.batch_number || ''}
            onChange={handleChange}
            className="mt-1 p-2 rounded-md border border-white/30 bg-white/80"
            placeholder="Batch number"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium text-slate-700">Expiry date</span>
          <input
            name="expiry_date"
            value={formatDateForInput(form.expiry_date) || ''}
            onChange={handleChange}
            type="date"
            className="mt-1 p-2 rounded-md border border-white/30 bg-white/80"
          />
        </label>

        <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>

          <button
            type="submit"
            className="text-sm px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  )
}

export default MedicineForm
