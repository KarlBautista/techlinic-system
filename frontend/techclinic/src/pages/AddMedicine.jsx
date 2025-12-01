import React, { useState } from 'react';
import Navigation from '../components/newNavigation';
import Swal from 'sweetalert2';
import useMedicine from '../store/useMedicineStore';

const AddMedicine = () => {
  const { insertMedicine } = useMedicine();
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
    }
  };

  return (
    <div className="flex h-full w-full gap-2 overflow-y-auto">
      <div className="sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[17%] sticky top-0">
        <Navigation />
      </div>
      <div className="p-5 w-[83%] h-full flex flex-col gap-5 ">
        <div className="w-full flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-gray-900">Add Medicine</h2>
          <p className="text-gray-500">Fill in the details below to add a new medicine</p>
        </div>

        <form 
          className="w-[90%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          onSubmit={handleSubmit}
        >
         
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Medicine Name</label>
            <input
              type="text"
              name="name"
              value={medicine.name}
              onChange={handleChange}
              placeholder="Paracetamol"
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

     
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Generic Name</label>
            <input
              type="text"
              name="generic"
              value={medicine.generic}
              onChange={handleChange}
              placeholder="Acetaminophen"
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

     
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Brand / Manufacturer</label>
            <input
              type="text"
              name="brand"
              value={medicine.brand}
              onChange={handleChange}
              placeholder="ABC Pharma"
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

     
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Type / Form</label>
            <input
              type="text"
              name="type"
              value={medicine.type}
              onChange={handleChange}
              placeholder="Tablet"
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

      
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Dosage</label>
            <input
              type="text"
              name="dosage"
              value={medicine.dosage}
              onChange={handleChange}
              placeholder="500mg"
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

      
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Unit of Measure</label>
            <input
              type="text"
              name="unit"
              value={medicine.unit}
              onChange={handleChange}
              placeholder="mg"
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

       
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Stock Level</label>
            <input
              type="number"
              name="stock"
              value={medicine.stock}
              onChange={handleChange}
              placeholder="100"
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Batch Number</label>
            <input
              type="text"
              name="batch"
              value={medicine.batch}
              onChange={handleChange}
              placeholder="B1234"
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

   
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Expiry Date</label>
            <input
              type="date"
              name="expiry"
              value={medicine.expiry}
              onChange={handleChange}
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

  
          <div className="col-span-full flex justify-end mt-4">
            <button
              type="submit"
              className="bg-[#A12217] text-white px-6 py-2 rounded-md hover:bg-[#b01c34] transition"
            >
              Add Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicine;
