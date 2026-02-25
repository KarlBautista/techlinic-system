import MedicineForm from '../components/MedicineForm.jsx'
import AddMedicineModal from '../components/AddMedicineModal.jsx'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMedicine from '../store/useMedicineStore'
import { motion } from 'framer-motion'
import { Search, Plus, Pill, ChevronRight } from 'lucide-react'

const newMedicine = () => {
  const { medicines, updateMedicine, deleteMedicine } = useMedicine();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [medicineFormData, setMedicineFormData] = useState({});
  const [search, setSearch] = useState("");

  const handleAddMedicine = () => {
    setShowAddForm(true);
  };

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const handleUpdateMedicine = (medicine) => {
    setShowForm(!showForm);
    setMedicineFormData(medicine);
  };

  const filteredMedicines = medicines?.filter((medicine) => {
    const matchesSearch = medicine.medicine_name?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
      {showForm && (
        <MedicineForm
          medicine={medicineFormData}
          onClose={() => setShowForm(false)}
          onUpdate={(updatedForm) => updateMedicine(updatedForm)}
          onDelete={(medicineId) => deleteMedicine(medicineId)}
        />
      )}

      {showAddForm && (
        <AddMedicineModal onClose={() => setShowAddForm(false)} />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className='flex flex-col gap-4'
      >

        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className='text-2xl font-bold text-gray-800'>Medicine Inventory</h1>
          <p className='text-sm text-gray-500 mt-1'>Manage medicines and inventory</p>
        </motion.div>

        {/* ─── Search & Add Bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className='flex items-center gap-3 flex-wrap'
        >
          <div className='flex items-center flex-1 min-w-[200px] max-w-md h-10 px-3 rounded-xl bg-white ring-1 ring-gray-200 focus-within:ring-crimson-400 focus-within:ring-2 transition-all'>
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              className='outline-none w-full ml-2 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent'
              placeholder='Search medicines...'
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => handleAddMedicine()}
            className='inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-crimson-600 text-white text-sm font-medium hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer'
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </button>

          {filteredMedicines && (
            <span className='text-xs text-gray-400 font-medium ml-auto'>
              {filteredMedicines.length} item{filteredMedicines.length !== 1 ? 's' : ''}
            </span>
          )}
        </motion.div>

        {/* ─── Table Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className='bg-white rounded-xl shadow-sm ring-1 ring-gray-100 flex-1 flex flex-col overflow-hidden'
        >
          <div className='overflow-auto flex-1'>
            <table className='w-full'>
              <thead className='sticky top-0 bg-gray-50/90 backdrop-blur-sm'>
                <tr>
                  <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Medicine Name</th>
                  <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Generic Name</th>
                  <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell'>Brand</th>
                  <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Type</th>
                  <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell'>Dosage</th>
                  <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Stock</th>
                  <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Batch #</th>
                  <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Expiry</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {filteredMedicines && filteredMedicines.length > 0 ? (
                  filteredMedicines.map((medicine, idx) => (
                    <motion.tr
                      key={medicine.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.25 }}
                      className='hover:bg-crimson-50/40 cursor-pointer transition-colors group'
                      onClick={() => handleUpdateMedicine(medicine)}
                    >
                      <td className='px-5 py-3.5'>
                        <span className='text-sm font-medium text-gray-900 group-hover:text-crimson-600 transition-colors'>
                          {medicine.medicine_name}
                        </span>
                      </td>
                      <td className='px-5 py-3.5 hidden sm:table-cell'>
                        <span className='text-sm text-gray-600'>{medicine.generic_name}</span>
                      </td>
                      <td className='px-5 py-3.5 hidden lg:table-cell'>
                        <span className='text-sm text-gray-600'>{medicine.brand}</span>
                      </td>
                      <td className='px-5 py-3.5 hidden md:table-cell'>
                        <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 ring-1 ring-gray-100'>
                          {medicine.type}
                        </span>
                      </td>
                      <td className='px-5 py-3.5 hidden lg:table-cell'>
                        <span className='text-sm text-gray-600'>{medicine.dosage} {medicine.unit_of_measure}</span>
                      </td>
                      <td className='px-5 py-3.5'>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ring-1 ${
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
                        <span className='text-sm text-gray-500'>{medicine.batch_number}</span>
                      </td>
                      <td className='px-5 py-3.5 hidden sm:table-cell'>
                        <span className='text-sm text-gray-500'>{formatDate(medicine.expiry_date)}</span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className='px-5 py-16 text-center'>
                      <div className='flex flex-col items-center text-gray-400'>
                        <div className='w-16 h-16 mb-3 rounded-2xl bg-gray-50 flex items-center justify-center'>
                          <Pill className="w-7 h-7 text-gray-300" />
                        </div>
                        <p className='text-sm font-medium text-gray-500'>No medicines found</p>
                        <p className='text-xs text-gray-400 mt-1'>Try a different search or add new medicines</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </motion.div>
    </>
  );
};

export default newMedicine