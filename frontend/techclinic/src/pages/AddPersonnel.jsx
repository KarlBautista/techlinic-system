import React, { useState } from 'react';
import Navigation from '../components/newNavigation';
import Swal from 'sweetalert2';
import { ButtonLoader } from '../components/PageLoader';
// import usePersonnel from '../store/usePersonnelStore'; // You'll need to create this
import useData from '../store/useDataStore';
const AddPersonnel = () => {
  // const { insertPersonnel } = usePersonnel(); // Uncomment when store is ready
  const [personnel, setPersonnel] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    address: '',
    date_of_birth: '',
    role: '',
    sex: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { insertPersonnel } = useData();

  const handleChange = (e) => {
    setPersonnel({ ...personnel, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log(personnel);
    
    // Validation
    if (!personnel.first_name || !personnel.last_name || !personnel.email || 
        !personnel.password || !personnel.confirm_password ||
        !personnel.address || !personnel.date_of_birth || !personnel.role || !personnel.sex) {
      Swal.fire({
        title: "Missing Information",
        text: "Please fill in all required fields",
        icon: "warning",
        showConfirmButton: true
      });
      return;
    }

    // Password validation
    if (personnel.password.length < 8) {
      Swal.fire({
        title: "Weak Password",
        text: "Password must be at least 8 characters long",
        icon: "warning",
        showConfirmButton: true
      });
      return;
    }

    if (personnel.password !== personnel.confirm_password) {
      Swal.fire({
        title: "Password Mismatch",
        text: "Password and Confirm Password do not match",
        icon: "error",
        showConfirmButton: true
      });
      return;
    }

    try {
  
      const response = await insertPersonnel(personnel);
        if(!response.success) {
          Swal.fire({
           title: "Something went wrong",
           text: "Could not add personnel, please retry",
            icon: "error",
            showConfirmButton: true
          });
           return;
        }
      
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
        password: '',
        confirm_password: '',
        address: '',
        date_of_birth: '',
        role: '',
        sex: ''
      });
      return;
    } catch (err) {
      console.error(`Something went wrong adding personnel: ${err.message}`);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred",
        icon: "error",
        showConfirmButton: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='h-screen w-full flex flex-col sm:flex-row'>
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
        <Navigation />
      </div>
      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-6 flex flex-col gap-4'>
        <div className="w-full flex flex-col gap-2">
          <h1 className='text-2xl font-bold text-gray-800'>Add Personnel</h1>
          <p className='text-sm text-gray-500 mt-1'>Fill in the details below to add a new staff member</p>
        </div>

        <form 
          className="w-[90%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          onSubmit={handleSubmit}
        >
          {/* First Name */}
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

          {/* Last Name */}
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

          {/* Email */}
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

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={personnel.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                minLength="8"
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Confirm Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={personnel.confirm_password}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                minLength="8"
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#b01c34] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must match password</p>
          </div>

          {/* Address */}
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

          {/* Date of Birth */}
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

          {/* Role */}
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

          {/* Sex */}
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

          {/* Submit Button */}
          <div className="col-span-full flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#A12217] text-white px-6 py-2 rounded-md hover:bg-[#b01c34] transition inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <><ButtonLoader /> Adding...</> : 'Add Personnel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPersonnel;