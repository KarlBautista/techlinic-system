import React, { useState } from 'react';
import Swal from 'sweetalert2';
import useMedicine from '../store/useMedicineStore';
import { ButtonLoader } from '../components/PageLoader';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';

const AddMedicine = () => {
  const { insertMedicine } = useMedicine();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setMedicine({ ...medicine, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log(medicine);
    try {
      const response = await insertMedicine(medicine);
      if(!response.success) {
        Swal.fire({
          title: "Something went wrong",
          text: "Could not add medicine, please retry",
          icon: "error",
          showConfirmButton: true
        });
      
        return;
      }
      Swal.fire({
        title: "Medicine Successfully Inserted",
        text: "The medicine you added will be display in the table",
        icon: "success",
        showConfirmButton: true
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
    } catch (err) {
      console.error(`Something went wrong adding medicine: ${err.message}`);
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className='text-2xl font-bold text-gray-800'>Add Medicine</h1>
          <p className='text-sm text-gray-500 mt-1'>Fill in the details below to add a new medicine</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className='bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6'
        >
          <div className='flex items-center gap-2.5 mb-5'>
            <div className='w-8 h-8 rounded-lg bg-crimson-50 flex items-center justify-center'>
              <Pill className="w-4 h-4 text-crimson-600" />
            </div>
            <h2 className='text-base font-semibold text-gray-800'>Medicine Details</h2>
          </div>

          <form 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</label>
              <input type="text" name="name" value={medicine.name} onChange={handleChange} placeholder="Paracetamol"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-100 focus:border-crimson-400 transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Generic Name</label>
              <input type="text" name="generic" value={medicine.generic} onChange={handleChange} placeholder="Acetaminophen"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-100 focus:border-crimson-400 transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Brand / Manufacturer</label>
              <input type="text" name="brand" value={medicine.brand} onChange={handleChange} placeholder="ABC Pharma"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-100 focus:border-crimson-400 transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Form</label>
              <input type="text" name="type" value={medicine.type} onChange={handleChange} placeholder="Tablet"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-100 focus:border-crimson-400 transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</label>
              <input type="text" name="dosage" value={medicine.dosage} onChange={handleChange} placeholder="500mg"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-100 focus:border-crimson-400 transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unit of Measure</label>
              <input type="text" name="unit" value={medicine.unit} onChange={handleChange} placeholder="mg"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-100 focus:border-crimson-400 transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</label>
              <input type="number" name="stock" value={medicine.stock} onChange={handleChange} placeholder="100"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-100 focus:border-crimson-400 transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</label>
              <input type="text" name="batch" value={medicine.batch} onChange={handleChange} placeholder="B1234"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-100 focus:border-crimson-400 transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</label>
              <input type="date" name="expiry" value={medicine.expiry} onChange={handleChange}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-100 focus:border-crimson-400 transition-all" />
            </div>

            <div className="col-span-full flex justify-end mt-4 pt-4 border-t border-gray-100">
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
