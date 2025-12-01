import React, { useState } from 'react';
import Navigation from '../components/newNavigation';
import Swal from 'sweetalert2';
import useData from '../store/useDataStore';

const AddPersonnel = () => {

  const [personnel, setPersonnel] = useState({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    date_of_birth: '',
    role: '',
    sex: ''
  });

  const handleChange = (e) => {
    setPersonnel({ ...personnel, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(personnel);
    
    
    if (!personnel.first_name || !personnel.last_name || !personnel.email || 
        !personnel.address || !personnel.date_of_birth || !personnel.role || !personnel.sex) {
      Swal.fire({
        title: "Missing Information",
        text: "Please fill in all required fields",
        icon: "warning",
        showConfirmButton: true
      });
      return;
    }

    try {
      // Uncomment when API is ready
      // const response = await insertPersonnel(personnel);
      // if(!response.success) {
      //   Swal.fire({
      //     title: "Something went wrong",
      //     text: "Could not add personnel, please retry",
      //     icon: "error",
      //     showConfirmButton: true
      //   });
      //   return;
      // }
      
      Swal.fire({
        title: "Personnel Successfully Added",
        text: "The personnel record has been created",
        icon: "success",
        showConfirmButton: true
      });
      
      setPersonnel({
        first_name: '',
        last_name: '',
        email: '',
        address: '',
        date_of_birth: '',
        role: '',
        sex: ''
      });
    } catch (err) {
      console.error(`Something went wrong adding personnel: ${err.message}`);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred",
        icon: "error",
        showConfirmButton: true
      });
    }
  };

  return (
    <div className="flex h-full w-full gap-2 overflow-y-auto">
      <div className="sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[17%] sticky top-0">
        <Navigation />
      </div>
      <div className="p-5 w-[83%] h-full flex flex-col gap-5">
        <div className="w-full flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-gray-900">Add Personnel</h2>
          <p className="text-gray-500">Fill in the details below to add a new staff member</p>
        </div>

        <form 
          className="w-[90%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          onSubmit={handleSubmit}
        >
        
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">First Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="first_name"
              value={personnel.first_name}
              onChange={handleChange}
              placeholder="Juan"
              required
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

        
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Last Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="last_name"
              value={personnel.last_name}
              onChange={handleChange}
              placeholder="Dela Cruz"
              required
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

        
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={personnel.email}
              onChange={handleChange}
              placeholder="juan.delacruz@hospital.com"
              required
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

          
          <div className="flex flex-col md:col-span-2">
            <label className="text-gray-700 font-medium mb-1">Address <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="address"
              value={personnel.address}
              onChange={handleChange}
              placeholder="123 Main Street, Manila, Metro Manila"
              required
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

      
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Date of Birth <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="date_of_birth"
              value={personnel.date_of_birth}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
            />
          </div>

        
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Role <span className="text-red-500">*</span></label>
            <select
              name="role"
              value={personnel.role}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent bg-white"
            >
              <option value="">Select Role</option>
              <option value="NURSE">Nurse</option>
              <option value="DOCTOR">Doctor</option>
            </select>
          </div>

         
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Sex <span className="text-red-500">*</span></label>
            <select
              name="sex"
              value={personnel.sex}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent bg-white"
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

       
          <div className="col-span-full flex justify-end mt-4">
            <button
              type="submit"
              className="bg-[#A12217] text-white px-6 py-2 rounded-md hover:bg-[#b01c34] transition"
            >
              Add Personnel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPersonnel;