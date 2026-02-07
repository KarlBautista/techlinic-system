import React, { useEffect, useState } from 'react'
import Navigation from '../components/newNavigation'
import useAuth from '../store/useAuthStore'
import useData from '../store/useDataStore'
import { PageLoader, ButtonLoader } from '../components/PageLoader'
import Swal from 'sweetalert2'

const PersonnelList = () => {
  const [search, setSearch] = useState("");
  const { allUsers, getAllUsers, isLoadingUsers } = useAuth();
  const { insertPersonnel } = useData();
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  useEffect(() => {
    const getAllUsersData = async () => {
      try {
        await getAllUsers();
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    getAllUsersData();
  }, []);

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const filteredUsers = allUsers?.filter((user) => {
    const fullname = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch =
      fullname.includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === "All Roles" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleChange = (e) => {
    setPersonnel({ ...personnel, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setPersonnel({
      first_name: '', last_name: '', email: '', password: '',
      confirm_password: '', address: '', date_of_birth: '', role: '', sex: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
    setIsModalVisible(true);
    setIsModalClosing(false);
  };

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsModalVisible(false);
      setIsModalClosing(false);
      setShowModal(false);
      resetForm();
    }, 150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!personnel.first_name || !personnel.last_name || !personnel.email ||
      !personnel.password || !personnel.confirm_password ||
      !personnel.address || !personnel.date_of_birth || !personnel.role || !personnel.sex) {
      Swal.fire({ title: "Missing Information", text: "Please fill in all required fields", icon: "warning" });
      setIsSubmitting(false);
      return;
    }

    if (personnel.password.length < 8) {
      Swal.fire({ title: "Weak Password", text: "Password must be at least 8 characters long", icon: "warning" });
      setIsSubmitting(false);
      return;
    }

    if (personnel.password !== personnel.confirm_password) {
      Swal.fire({ title: "Password Mismatch", text: "Password and Confirm Password do not match", icon: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await insertPersonnel(personnel);
      if (!response.success) {
        Swal.fire({ title: "Something went wrong", text: "Could not add personnel, please retry", icon: "error" });
        return;
      }
      Swal.fire({ title: "Personnel Successfully Added", text: "The personnel record has been created", icon: "success", timer: 1500, showConfirmButton: false });
      closeModal();
      await getAllUsers();
    } catch (err) {
      console.error(`Something went wrong adding personnel: ${err.message}`);
      Swal.fire({ title: "Error", text: "An unexpected error occurred", icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='h-screen w-full flex flex-col sm:flex-row'>
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[20%] sm:h-full md:w-[16%] lg:w-[14%]'>
        <Navigation />
      </div>
      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[80%] md:w-[84%] lg:w-[86%] overflow-auto p-6 flex flex-col gap-4'>
        {initialLoading || isLoadingUsers ? (
          <PageLoader message="Loading personnel list..." />
        ) : (
        <div className='w-full h-full flex flex-col gap-5'>
          {/* ─── Page Header ─── */}
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>Personnel List</h1>
            <p className='text-sm text-gray-500 mt-1'>Manage clinic staff and personnel</p>
          </div>

          {/* ─── Search & Filter Bar ─── */}
          <div className='flex items-center gap-3 flex-wrap'>
            <div className='flex items-center flex-1 min-w-[200px] max-w-md h-10 px-3 rounded-lg bg-white ring-1 ring-gray-200 focus-within:ring-[#b01c34] transition-all'>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                className='outline-none w-full ml-2 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent'
                placeholder='Search by name or email...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className='h-10 px-3 rounded-lg bg-white ring-1 ring-gray-200 outline-none text-sm text-gray-700 focus:ring-[#b01c34] transition-all cursor-pointer'
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="All Roles">All Roles</option>
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
            </select>

            <button
              onClick={openModal}
              className='inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#b01c34] text-white text-sm font-medium hover:bg-[#8f1629] transition-colors shadow-sm ml-auto'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Personnel
            </button>

            {filteredUsers && (
              <span className='text-xs text-gray-400 font-medium'>
                {filteredUsers.length} personnel
              </span>
            )}
          </div>

          {/* ─── Personnel Table ─── */}
          <div className='bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden'>
            <div className='overflow-auto flex-1'>
              {filteredUsers?.length > 0 ? (
                <table className='w-full'>
                  <thead className='sticky top-0 bg-gray-50/90 backdrop-blur-sm'>
                    <tr>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Name</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Role</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Email</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell'>Sex</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Date of Birth</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50'>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className='hover:bg-gray-50/60 transition-colors group'
                      >
                        <td className='px-5 py-3.5'>
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0'>
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </div>
                            <span className='text-sm font-medium text-gray-900 group-hover:text-[#b01c34] group-hover:underline transition-colors'>
                              {`${user.first_name} ${user.last_name}`}
                            </span>
                          </div>
                        </td>
                        <td className='px-5 py-3.5'>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.role === 'DOCTOR'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'DOCTOR' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                            {user.role === 'DOCTOR' ? 'Doctor' : 'Nurse'}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 hidden md:table-cell'>
                          <span className='text-sm text-gray-600 group-hover:underline'>{user.email}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden lg:table-cell'>
                          <span className='text-sm text-gray-600 group-hover:underline'>{user.sex}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden sm:table-cell'>
                          <span className='text-sm text-gray-600 group-hover:underline'>{formatDate(user.date_of_birth)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                  <p className='text-sm font-medium text-gray-500'>No personnel found</p>
                  <p className='text-xs text-gray-400 mt-1'>Try a different search or filter</p>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* ─── Add Personnel Modal ─── */}
      {isModalVisible && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 ${isModalClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`}
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className={`relative z-10 bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${isModalClosing ? 'modal-content-exit' : 'modal-content-enter'}`}>
            {/* Modal Header */}
            <div className='sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl z-10'>
              <div>
                <h2 className='text-lg font-bold text-gray-800'>Add Personnel</h2>
                <p className='text-xs text-gray-400 mt-0.5'>Fill in the details to add a new staff member</p>
              </div>
              <button
                onClick={closeModal}
                className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors'
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* First Name */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>First Name <span className='text-red-500'>*</span></label>
                  <input
                    type="text" name="first_name" value={personnel.first_name} onChange={handleChange}
                    placeholder="Juan" required
                    className='px-3 py-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'
                  />
                </div>

                {/* Last Name */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Last Name <span className='text-red-500'>*</span></label>
                  <input
                    type="text" name="last_name" value={personnel.last_name} onChange={handleChange}
                    placeholder="Dela Cruz" required
                    className='px-3 py-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'
                  />
                </div>

                {/* Email */}
                <div className='flex flex-col gap-1.5 md:col-span-2'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Email Address <span className='text-red-500'>*</span></label>
                  <input
                    type="email" name="email" value={personnel.email} onChange={handleChange}
                    placeholder="juan.delacruz@tup.edu.ph" required
                    className='px-3 py-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'
                  />
                </div>

                {/* Password */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Password <span className='text-red-500'>*</span></label>
                  <div className='relative'>
                    <input
                      type={showPassword ? "text" : "password"} name="password" value={personnel.password} onChange={handleChange}
                      placeholder="Min. 8 characters" required minLength="8"
                      className='w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Confirm Password <span className='text-red-500'>*</span></label>
                  <div className='relative'>
                    <input
                      type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={personnel.confirm_password} onChange={handleChange}
                      placeholder="Re-enter password" required minLength="8"
                      className='w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                      <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div className='flex flex-col gap-1.5 md:col-span-2'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Address <span className='text-red-500'>*</span></label>
                  <input
                    type="text" name="address" value={personnel.address} onChange={handleChange}
                    placeholder="123 Main Street, Manila" required
                    className='px-3 py-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'
                  />
                </div>

                {/* Date of Birth */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Date of Birth <span className='text-red-500'>*</span></label>
                  <input
                    type="date" name="date_of_birth" value={personnel.date_of_birth} onChange={handleChange}
                    required
                    className='px-3 py-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'
                  />
                </div>

                {/* Role */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Role <span className='text-red-500'>*</span></label>
                  <select
                    name="role" value={personnel.role} onChange={handleChange} required
                    className='px-3 py-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors bg-white'
                  >
                    <option value="">Select Role</option>
                    <option value="NURSE">Nurse</option>
                    <option value="DOCTOR">Doctor</option>
                  </select>
                </div>

                {/* Sex */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>Sex <span className='text-red-500'>*</span></label>
                  <select
                    name="sex" value={personnel.sex} onChange={handleChange} required
                    className='px-3 py-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors bg-white'
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100'>
                <button
                  type="button"
                  onClick={closeModal}
                  className='px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className='px-5 py-2 rounded-lg bg-[#b01c34] text-white text-sm font-medium hover:bg-[#8f1629] transition-colors inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm'
                >
                  {isSubmitting ? <><ButtonLoader /> Adding...</> : 'Add Personnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PersonnelList
