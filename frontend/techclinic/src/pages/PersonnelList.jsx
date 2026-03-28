import React, { useEffect, useState, useMemo, useRef } from 'react'
import useAuth from '../store/useAuthStore'
import useData from '../store/useDataStore'
import { ButtonLoader } from '../components/PageLoader'
import { showToast } from '../components/Toast'
import { motion } from 'framer-motion'
import { Search, Plus, Users, X, Eye, EyeOff, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const ROWS_OPTIONS = [5, 10, 20, 50];

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
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef(null);

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
    const handleClickOutside = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((user) => {
      const fullname = `${user.first_name} ${user.last_name}`.toLowerCase();
      const matchesSearch =
        fullname.includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = selectedRole === "All Roles" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [allUsers, search, selectedRole]);

  const totalPages = Math.ceil((filteredUsers?.length || 0) / rowsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRole, rowsPerPage]);

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

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <div className='flex flex-col gap-4 h-full'>
        {initialLoading || isLoadingUsers ? (
          <div className='w-full h-full flex flex-col gap-5 animate-pulse'>
            {/* Skeleton Header */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 rounded-xl bg-gray-200 dark:bg-[#1F242F]' />
                <div>
                  <div className='h-6 w-44 bg-gray-200 dark:bg-[#1F242F] rounded-lg' />
                  <div className='h-4 w-24 bg-gray-100 dark:bg-[#1F242F] rounded-lg mt-2' />
                </div>
              </div>
              <div className='h-9 w-32 bg-gray-200 dark:bg-[#1F242F] rounded-lg' />
            </div>
            {/* Skeleton Filters */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-28 bg-gray-200 dark:bg-[#1F242F] rounded-full' />
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-56 bg-gray-200 dark:bg-[#1F242F] rounded-full' />
              </div>
            </div>
            {/* Skeleton Table */}
            <div className='bg-white dark:bg-[#161B26] rounded-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] flex-1 flex flex-col overflow-hidden'>
              <div className='px-5 py-3 flex gap-4 border-b border-gray-100 dark:border-[#1F2A37]'>
                {[100, 60, 140, 60, 80].map((w, i) => (
                  <div key={i} className='h-4 bg-gray-200 dark:bg-[#1F242F] rounded' style={{ width: w }} />
                ))}
              </div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='px-5 py-4 flex items-center gap-4 border-b border-gray-50 dark:border-[#1F2A37]'>
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-full bg-gray-200 dark:bg-[#1F242F]' />
                    <div className='h-4 w-28 bg-gray-100 dark:bg-[#1F242F] rounded' />
                  </div>
                  <div className='h-6 w-16 bg-gray-100 dark:bg-[#1F242F] rounded-full' />
                  <div className='h-4 w-36 bg-gray-100 dark:bg-[#1F242F] rounded hidden md:block' />
                  <div className='h-4 w-14 bg-gray-100 dark:bg-[#1F242F] rounded hidden lg:block' />
                  <div className='h-4 w-24 bg-gray-100 dark:bg-[#1F242F] rounded hidden sm:block' />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className='w-full h-full flex flex-col gap-5'
          >
            {/* ─── Page Header ─── */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 rounded-xl bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center ring-1 ring-crimson-100 dark:ring-[#333741]'>
                  <Users className="w-6 h-6 text-crimson-600" />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Personnel List</h1>
                  <p className='text-sm text-gray-400 dark:text-[#94969C] mt-0.5'>
                    Manage clinic staff and personnel
                  </p>
                </div>
              </div>
              <button
                onClick={openModal}
                className='inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-crimson-600 text-white text-xs font-medium hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer'
              >
                <Plus className="w-4 h-4" />
                Add Personnel
              </button>
            </motion.div>

            {/* ─── Filters & Search ─── */}
            <motion.div variants={itemVariants} className='flex items-center justify-between gap-3 flex-wrap'>
              {/* Left: Filters */}
              <div className='flex items-center gap-2 flex-wrap'>
                {/* Role Dropdown */}
                <div ref={roleRef} className='relative'>
                  <button
                    onClick={() => setRoleOpen(!roleOpen)}
                    className='inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white dark:bg-[#161B26] ring-1 ring-gray-200 dark:ring-[#333741] text-xs font-medium text-gray-600 dark:text-[#94969C] hover:ring-gray-300 dark:hover:ring-[#4B5563] dark:hover:bg-[#1F242F] transition-all cursor-pointer'
                  >
                    <Users className="w-4 h-4 text-gray-400 dark:text-[#94969C]" />
                    <span>{selectedRole}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-[#94969C] transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {roleOpen && (
                    <div className='absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#161B26] rounded-2xl shadow-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] py-2 z-20'>
                      {[
                        { value: "All Roles", label: "All Roles" },
                        { value: "DOCTOR", label: "Doctor" },
                        { value: "NURSE", label: "Nurse" },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSelectedRole(opt.value); setRoleOpen(false); }}
                          className='w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#293040] transition-colors cursor-pointer'
                        >
                          <div className='flex items-center gap-3'>
                            <Users className="w-4 h-4 text-gray-400 dark:text-[#94969C]" />
                            <span className={`text-sm font-medium ${selectedRole === opt.value ? 'text-crimson-600' : 'text-gray-700 dark:text-gray-200'}`}>{opt.label}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === opt.value ? 'border-crimson-600 bg-crimson-600' : 'border-gray-300 dark:border-[#333741]'}`}>
                            {selectedRole === opt.value && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Search */}
              <div className='flex items-center gap-2'>
                <div className='flex items-center h-10 w-56 px-3 rounded-full bg-white dark:bg-[#161B26] ring-1 ring-gray-200 dark:ring-[#1F2A37] focus-within:ring-crimson-400 transition-all'>
                  <Search className="w-3.5 h-3.5 text-gray-400 dark:text-[#94969C] shrink-0" />
                  <input
                    type="text"
                    className='outline-none w-full ml-2 text-xs text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-[#94969C] bg-transparent'
                    placeholder='Search by name or email...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>

            {/* ─── Personnel Table ─── */}
            <motion.div
              variants={itemVariants}
              className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] flex-1 flex flex-col overflow-hidden'
            >
              <div className='overflow-auto flex-1'>
                {filteredUsers?.length > 0 ? (
                  <table className='w-full'>
                    <thead className='sticky top-0 bg-gray-50/95 dark:bg-[#1F242F]/95 backdrop-blur-sm'>
                      <tr>
                        <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3'>Name</th>
                        <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3'>Role</th>
                        <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Email</th>
                        <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3 hidden lg:table-cell'>Sex</th>
                        <th className='text-left text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Date of Birth</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-50 dark:divide-[#1F2A37]'>
                      {paginatedUsers.map((user) => (
                        <tr
                          key={user.id}
                          className='hover:bg-crimson-50/40 dark:hover:bg-[#293040] transition-colors group'
                        >
                          <td className='px-5 py-3.5'>
                            <div className='flex items-center gap-3'>
                              <div className='w-8 h-8 rounded-full bg-linear-to-br from-crimson-100 to-crimson-50 flex items-center justify-center text-xs font-bold text-crimson-600 shrink-0 ring-1 ring-crimson-100 dark:ring-[#333741]'>
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </div>
                              <span className='text-sm font-medium text-gray-900 dark:text-white group-hover:text-crimson-600 dark:group-hover:text-crimson-300 transition-colors'>
                                {`${user.first_name} ${user.last_name}`}
                              </span>
                            </div>
                          </td>
                          <td className='px-5 py-3.5'>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${user.role === 'DOCTOR'
                              ? 'bg-blue-50 text-blue-700 ring-blue-100'
                              : 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'DOCTOR' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                              {user.role === 'DOCTOR' ? 'Doctor' : 'Nurse'}
                            </span>
                          </td>
                          <td className='px-5 py-3.5 hidden md:table-cell'>
                            <span className='text-sm text-gray-600 dark:text-[#94969C]'>{user.email}</span>
                          </td>
                          <td className='px-5 py-3.5 hidden lg:table-cell'>
                            <span className='text-sm text-gray-600 dark:text-[#94969C]'>{user.sex}</span>
                          </td>
                          <td className='px-5 py-3.5 hidden sm:table-cell'>
                            <span className='text-sm text-gray-600 dark:text-[#94969C]'>{formatDate(user.date_of_birth)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className='flex flex-col items-center justify-center py-16 text-gray-400 dark:text-[#94969C]'>
                    <div className='w-16 h-16 mb-3 rounded-2xl bg-gray-50 dark:bg-[#1F242F] flex items-center justify-center'>
                      <Users className="w-7 h-7 text-gray-300 dark:text-[#94969C]" />
                    </div>
                    <p className='text-sm font-medium text-gray-500 dark:text-[#94969C]'>No personnel found</p>
                    <p className='text-xs text-gray-400 dark:text-[#94969C] mt-1'>Try a different search or filter</p>
                  </div>
                )}
              </div>

              {/* ─── Pagination Footer ─── */}
              {filteredUsers?.length > 0 && (
                <div className='px-5 py-3 border-t border-gray-100 dark:border-[#1F2A37] flex items-center justify-between text-xs text-gray-500 dark:text-[#94969C]'>
                  <span>{filteredUsers.length} total personnel</span>
                  <div className='flex items-center gap-1'>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className='w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#293040] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer'
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {getPageNumbers().map((p, i) =>
                      p === '...' ? (
                        <span key={`dot-${i}`} className='w-8 h-8 flex items-center justify-center text-gray-400 dark:text-[#94969C]'>...</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium transition-colors cursor-pointer ${currentPage === p ? 'bg-crimson-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-[#293040] text-gray-600 dark:text-[#94969C]'}`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className='w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#293040] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer'
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className='mx-2 text-gray-300 dark:text-[#94969C]'>|</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className='h-8 px-2 rounded-lg bg-white dark:bg-[#161B26] ring-1 ring-gray-200 dark:ring-[#1F2A37] outline-none text-xs cursor-pointer'
                    >
                      {ROWS_OPTIONS.map(n => (
                        <option key={n} value={n}>{n} rows</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
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
          <div className={`relative z-10 bg-white dark:bg-[#161B26] rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${isModalClosing ? 'modal-content-exit' : 'modal-content-enter'}`}>
            {/* Modal Header */}
            <div className='sticky top-0 bg-white dark:bg-[#161B26] px-6 py-4 border-b border-gray-100 dark:border-[#1F2A37] flex items-center justify-between rounded-t-xl z-10'>
              <div>
                <h2 className='text-lg font-bold text-gray-800 dark:text-white'>Add Personnel</h2>
                <p className='text-xs text-gray-400 dark:text-[#94969C] mt-0.5'>Fill in the details to add a new staff member</p>
              </div>
              <button
                onClick={closeModal}
                className='w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] hover:text-gray-600 dark:hover:text-gray-300  transition-colors'
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* First Name */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>First Name <span className='text-red-500'>*</span></label>
                  <input
                    type="text" name="first_name" value={personnel.first_name} onChange={handleChange}
                    placeholder="Juan" required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#1F2A37] outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all'
                  />
                </div>

                {/* Last Name */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Last Name <span className='text-red-500'>*</span></label>
                  <input
                    type="text" name="last_name" value={personnel.last_name} onChange={handleChange}
                    placeholder="Dela Cruz" required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#1F2A37] outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all'
                  />
                </div>

                {/* Email */}
                <div className='flex flex-col gap-1.5 md:col-span-2'>
                  <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Email Address <span className='text-red-500'>*</span></label>
                  <input
                    type="email" name="email" value={personnel.email} onChange={handleChange}
                    placeholder="juan.delacruz@tup.edu.ph" required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#1F2A37] outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all'
                  />
                </div>

                {/* Password */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Password <span className='text-red-500'>*</span></label>
                  <div className='relative'>
                    <input
                      type={showPassword ? "text" : "password"} name="password" value={personnel.password} onChange={handleChange}
                      placeholder="Min. 8 characters" required minLength="8"
                      className='w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-[#1F2A37] outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all'
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#94969C] hover:text-gray-600 dark:hover:text-gray-300'>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Confirm Password <span className='text-red-500'>*</span></label>
                  <div className='relative'>
                    <input
                      type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={personnel.confirm_password} onChange={handleChange}
                      placeholder="Re-enter password" required minLength="8"
                      className='w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-[#1F2A37] outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all'
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#94969C] hover:text-gray-600 dark:hover:text-gray-300'>
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div className='flex flex-col gap-1.5 md:col-span-2'>
                  <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Address <span className='text-red-500'>*</span></label>
                  <input
                    type="text" name="address" value={personnel.address} onChange={handleChange}
                    placeholder="123 Main Street, Manila" required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#1F2A37] outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all'
                  />
                </div>

                {/* Date of Birth */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Date of Birth <span className='text-red-500'>*</span></label>
                  <input
                    type="date" name="date_of_birth" value={personnel.date_of_birth} onChange={handleChange}
                    required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#1F2A37] outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all dark:[color-scheme:dark]'
                  />
                </div>

                {/* Role */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Role <span className='text-red-500'>*</span></label>
                  <select
                    name="role" value={personnel.role} onChange={handleChange} required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#1F2A37] outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all bg-white dark:bg-[#161B26]'
                  >
                    <option value="">Select Role</option>
                    <option value="NURSE">Nurse</option>
                    <option value="DOCTOR">Doctor</option>
                  </select>
                </div>

                {/* Sex */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Sex <span className='text-red-500'>*</span></label>
                  <select
                    name="sex" value={personnel.sex} onChange={handleChange} required
                    className='px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#1F2A37] outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all bg-white dark:bg-[#161B26]'
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-[#1F2A37]'>
                <button
                  type="button"
                  onClick={closeModal}
                  className='px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors'
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
