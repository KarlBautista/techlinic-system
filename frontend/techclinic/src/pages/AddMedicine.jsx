import React, { useState } from 'react';
import { showToast } from '../components/Toast';
import useMedicine from '../store/useMedicineStore';
import { ButtonLoader } from '../components/PageLoader';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import { validateMedicineForm, hasErrors } from '../lib/validation';

const AddMedicine = () => {
  const { insertMedicine } = useMedicine();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [medicine, setMedicine] = useState({
    name: '',
    generic: '',
    brand: '',
    type: '',
    dosage: '',
    unit: '',
    stock: '',
    batch: '',
    expiry: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicine(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const allErrors = validateMedicineForm({ ...medicine, [name]: value });
      setErrors(prev => ({ ...prev, [name]: allErrors[name] || '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const allErrors = validateMedicineForm(medicine);
    setErrors(prev => ({ ...prev, [field]: allErrors[field] || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate all fields
    const allErrors = validateMedicineForm(medicine);
    setErrors(allErrors);
    setTouched({ name: true, generic: true, brand: true, type: true, dosage: true, unit: true, stock: true, batch: true, expiry: true });

    if (hasErrors(allErrors)) {
      const firstError = Object.values(allErrors).find(e => e !== '');
      showToast({ title: 'Validation Error', message: firstError, type: 'warning' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await insertMedicine(medicine);
      if(!response.success) {
        showToast({
          title: "Something went wrong",
          message: response.errors ? response.errors.map(e => e.message).join(', ') : "Could not add medicine, please retry",
          type: "error",
        });
      
        return;
      }
      showToast({
        title: "Medicine Successfully Inserted",
        message: "The medicine you added will be displayed in the table",
        type: "success",
      });
        setMedicine({
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
        setErrors({});
        setTouched({});
    } catch (err) {
      console.error(`Something went wrong adding medicine: ${err.message}`);
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all dark:bg-[#0C111D] dark:text-white ${
      touched[field] && errors[field]
        ? 'border-red-400 focus:ring-red-100 focus:border-red-400 dark:border-red-500'
        : 'border-gray-200 dark:border-[#1F2A37] focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400'
    }`;

  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className='flex flex-col gap-4'
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Add Medicine</h1>
          <p className='text-sm text-gray-500 dark:text-[#94969C] mt-1'>Fill in the details below to add a new medicine</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-6'
        >
          <div className='flex items-center gap-2.5 mb-5'>
            <div className='w-8 h-8 rounded-lg bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center'>
              <Pill className="w-4 h-4 text-crimson-600" />
            </div>
            <h2 className='text-base font-semibold text-gray-800 dark:text-white'>Medicine Details</h2>
          </div>

          <form 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Medicine Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={medicine.name} onChange={handleChange} onBlur={() => handleBlur('name')} placeholder="Paracetamol" maxLength={200}
                className={inputClass('name')} />
              {touched.name && errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Generic Name</label>
              <input type="text" name="generic" value={medicine.generic} onChange={handleChange} onBlur={() => handleBlur('generic')} placeholder="Acetaminophen" maxLength={200}
                className={inputClass('generic')} />
              {touched.generic && errors.generic && <p className="text-xs text-red-500 mt-0.5">{errors.generic}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Brand / Manufacturer</label>
              <input type="text" name="brand" value={medicine.brand} onChange={handleChange} onBlur={() => handleBlur('brand')} placeholder="ABC Pharma" maxLength={200}
                className={inputClass('brand')} />
              {touched.brand && errors.brand && <p className="text-xs text-red-500 mt-0.5">{errors.brand}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Type / Form</label>
              <input type="text" name="type" value={medicine.type} onChange={handleChange} onBlur={() => handleBlur('type')} placeholder="Tablet" maxLength={100}
                className={inputClass('type')} />
              {touched.type && errors.type && <p className="text-xs text-red-500 mt-0.5">{errors.type}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Dosage <span className="text-red-500">*</span></label>
              <input type="text" name="dosage" value={medicine.dosage} onChange={handleChange} onBlur={() => handleBlur('dosage')} placeholder="500mg" maxLength={100}
                className={inputClass('dosage')} />
              {touched.dosage && errors.dosage && <p className="text-xs text-red-500 mt-0.5">{errors.dosage}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Unit of Measure <span className="text-red-500">*</span></label>
              <input type="text" name="unit" value={medicine.unit} onChange={handleChange} onBlur={() => handleBlur('unit')} placeholder="mg" maxLength={50}
                className={inputClass('unit')} />
              {touched.unit && errors.unit && <p className="text-xs text-red-500 mt-0.5">{errors.unit}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Stock Level <span className="text-red-500">*</span></label>
              <input type="number" name="stock" value={medicine.stock} onChange={handleChange} onBlur={() => handleBlur('stock')} placeholder="100" min="0" max="999999"
                className={inputClass('stock')} />
              {touched.stock && errors.stock && <p className="text-xs text-red-500 mt-0.5">{errors.stock}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Batch Number <span className="text-red-500">*</span></label>
              <input type="text" name="batch" value={medicine.batch} onChange={handleChange} onBlur={() => handleBlur('batch')} placeholder="B1234" maxLength={50}
                className={inputClass('batch')} />
              {touched.batch && errors.batch && <p className="text-xs text-red-500 mt-0.5">{errors.batch}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Expiry Date <span className="text-red-500">*</span></label>
              <input type="date" name="expiry" value={medicine.expiry} onChange={handleChange} onBlur={() => handleBlur('expiry')}
                className={inputClass('expiry')} />
              {touched.expiry && errors.expiry && <p className="text-xs text-red-500 mt-0.5">{errors.expiry}</p>}
            </div>

            <div className="col-span-full flex justify-end mt-4 pt-4 border-t border-gray-100 dark:border-[#1F2A37]">
              <button type="submit" disabled={isSubmitting}
                className="bg-crimson-600 text-white px-6 py-2.5 rounded-xl hover:bg-crimson-700 transition-colors text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
                {isSubmitting ? <><ButtonLoader /> Adding...</> : 'Add Medicine'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
  );
};

export default AddMedicine;
