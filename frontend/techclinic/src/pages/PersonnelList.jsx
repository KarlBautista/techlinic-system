import React, { useEffect, useState } from 'react'
import useAuth from '../store/useAuthStore'
import useData from '../store/useDataStore'
import { ButtonLoader } from '../components/PageLoader'
import { showToast } from '../components/Toast'
import { motion } from 'framer-motion'
import { Search, Plus, Users, X, Eye, EyeOff } from 'lucide-react'

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
      showToast({ title: "Missing Information", message: "Please fill in all required fields", type: "warning" });
      setIsSubmitting(false);
      return;
    }

    if (personnel.password.length < 8) {
      showToast({ title: "Weak Password", message: "Password must be at least 8 characters long", type: "warning" });
      setIsSubmitting(false);
      return;
    }

    if (personnel.password !== personnel.confirm_password) {
      showToast({ title: "Password Mismatch", message: "Password and Confirm Password do not match", type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await insertPersonnel(personnel);
      if (!response.success) {
        showToast({ title: "Something went wrong", message: "Could not add personnel, please retry", type: "error" });
        return;
      }
      showToast({ title: "Personnel Successfully Added", message: "The personnel record has been created", type: "success" });
      closeModal();
      await getAllUsers();
    } catch (err) {
      console.error(`Something went wrong adding personnel: ${err.message}`);
      showToast({ title: "Error", message: "An unexpected error occurred", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className='flex flex-col gap-4'>
        {initialLoading || isLoadingUsers ? (
          <div className='w-full h-full flex flex-col gap-5 animate-pulse'>
            {/* Skeleton Header */}
            <div>
              <div className='h-6 w-36 bg-gray-200 rounded-lg' />
              <div className='h-4 w-52 bg-gray-100 rounded-lg mt-2' />
            </div>
            {/* Skeleton Search & Filter Bar */}
            <div className='flex items-center gap-3 flex-wrap'>
              <div className='h-10 w-64 bg-gray-200 rounded-xl' />
              <div className='h-10 w-28 bg-gray-200 rounded-xl' />
              <div className='h-10 w-36 bg-gray-200 rounded-xl ml-auto' />
            </div>
            {/* Skeleton Table */}
            <div className='bg-white rounded-xl ring-1 ring-gray-100 overflow-hidden'>
              <div className='px-5 py-3 flex gap-4 border-b border-gray-100'>
                {[100, 60, 140, 60, 80].map((w, i) => (
                  <div key={i} className='h-4 bg-gray-200 rounded' style={{ width: w }} />
                ))}
              </div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='px-5 py-4 flex items-center gap-4 border-b border-gray-50'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-gray-200' />
                    <div className='h-4 w-28 bg-gray-100 rounded' />
                  </div>
                  <div className='h-6 w-16 bg-gray-100 rounded-full' />
                  <div className='h-4 w-36 bg-gray-100 rounded' />
                  <div className='h-4 w-14 bg-gray-100 rounded' />
                  <div className='h-4 w-24 bg-gray-100 rounded' />
                </div>
              ))}
            </div>
          </div>
        ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='w-full h-full flex flex-col gap-5'
        >
          {/* ─── Page Header ─── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className='text-2xl font-bold text-gray-800'>Personnel List</h1>
            <p className='text-sm text-gray-500 mt-1'>Manage clinic staff and personnel</p>
          </motion.div>

          {/* ─── Search & Filter Bar ─── */}
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
                placeholder='Search by name or email...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className='h-10 px-3 rounded-xl bg-white ring-1 ring-gray-200 outline-none text-sm text-gray-700 focus:ring-crimson-400 focus:ring-2 transition-all cursor-pointer'
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="All Roles">All Roles</option>
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
            </select>

            <button
              onClick={openModal}
              className='inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-crimson-600 text-white text-sm font-medium hover:bg-crimson-700 transition-colors shadow-sm ml-auto'
            >
              <Plus className="w-4 h-4" />
              Add Personnel
            </button>

            {filteredUsers && (
              <span className='text-xs text-gray-400 font-medium'>
                {filteredUsers.length} personnel
              </span>
            )}
          </motion.div>

          {/* ─── Personnel Table ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className='bg-white rounded-xl shadow-sm ring-1 ring-gray-100 flex-1 flex flex-col overflow-hidden'
          >
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
                    {filteredUsers.map((user, idx) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02, duration: 0.25 }}
                        className='hover:bg-crimson-50/40 transition-colors group'
                      >
                        <td className='px-5 py-3.5'>
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 rounded-full bg-linear-to-br from-crimson-100 to-crimson-50 flex items-center justify-center text-xs font-bold text-crimson-600 shrink-0 ring-1 ring-crimson-100'>
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </div>
                            <span className='text-sm font-medium text-gray-900 group-hover:text-crimson-600 transition-colors'>
                              {`${user.first_name} ${user.last_name}`}
                            </span>
                          </div>
                        </td>
                        <td className='px-5 py-3.5'>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${
                            user.role === 'DOCTOR'
                              ? 'bg-blue-50 text-blue-700 ring-blue-100'
                              : 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'DOCTOR' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                            {user.role === 'DOCTOR' ? 'Doctor' : 'Nurse'}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 hidden md:table-cell'>
                          <span className='text-sm text-gray-600'>{user.email}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden lg:table-cell'>
                          <span className='text-sm text-gray-600'>{user.sex}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden sm:table-cell'>
                          <span className='text-sm text-gray-600'>{formatDate(user.date_of_birth)}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
                  <div className='w-16 h-16 mb-3 rounded-2xl bg-gray-50 flex items-center justify-center'>
                    <Users className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className='text-sm font-medium text-gray-500'>No personnel found</p>
                  <p className='text-xs text-gray-400 mt-1'>Try a different search or filter</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
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
                className='w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors'
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* First Name */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>First Name <span className='text-red-500'>*</span></label>
                  <input
                    type="text" name="first_name" value={personnel.first_name} onChange={handleChange}
                    placeholder="Juan" required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'
                  />
                </div>

                {/* Last Name */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Last Name <span className='text-red-500'>*</span></label>
                  <input
                    type="text" name="last_name" value={personnel.last_name} onChange={handleChange}
                    placeholder="Dela Cruz" required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'
                  />
                </div>

                {/* Email */}
                <div className='flex flex-col gap-1.5 md:col-span-2'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Email Address <span className='text-red-500'>*</span></label>
                  <input
                    type="email" name="email" value={personnel.email} onChange={handleChange}
                    placeholder="juan.delacruz@tup.edu.ph" required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'
                  />
                </div>

                {/* Password */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Password <span className='text-red-500'>*</span></label>
                  <div className='relative'>
                    <input
                      type={showPassword ? "text" : "password"} name="password" value={personnel.password} onChange={handleChange}
                      placeholder="Min. 8 characters" required minLength="8"
                      className='w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Confirm Password <span className='text-red-500'>*</span></label>
                  <div className='relative'>
                    <input
                      type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={personnel.confirm_password} onChange={handleChange}
                      placeholder="Re-enter password" required minLength="8"
                      className='w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'>
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div className='flex flex-col gap-1.5 md:col-span-2'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Address <span className='text-red-500'>*</span></label>
                  <input
                    type="text" name="address" value={personnel.address} onChange={handleChange}
                    placeholder="123 Main Street, Manila" required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'
                  />
                </div>

                {/* Date of Birth */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Date of Birth <span className='text-red-500'>*</span></label>
                  <input
                    type="date" name="date_of_birth" value={personnel.date_of_birth} onChange={handleChange}
                    required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'
                  />
                </div>

                {/* Role */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Role <span className='text-red-500'>*</span></label>
                  <select
                    name="role" value={personnel.role} onChange={handleChange} required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all bg-white'
                  >
                    <option value="">Select Role</option>
                    <option value="NURSE">Nurse</option>
                    <option value="DOCTOR">Doctor</option>
                  </select>
                </div>

                {/* Sex */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Sex <span className='text-red-500'>*</span></label>
                  <select
                    name="sex" value={personnel.sex} onChange={handleChange} required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all bg-white'
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
                  className='px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className='px-5 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium hover:bg-crimson-700 transition-colors inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm'
                >
                  {isSubmitting ? <><ButtonLoader /> Adding...</> : 'Add Personnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default PersonnelList
