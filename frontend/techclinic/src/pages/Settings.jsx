import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Lock, Mail, KeyRound, Pencil, PenTool, PenLine, CheckCircle2, AlertCircle, UserPen, IdCard, Tag } from 'lucide-react';
import useAuth from '../store/useAuthStore';
import SignaturePad from '../components/SignaturePad';
import { validateName, validateAddress, validateDateOfBirth, validatePassword, LIMITS } from '../lib/validation';


import { showToast } from '../components/Toast';

const Settings = () => {
  const { authenticatedUser, userProfile, updateProfile, uploadSignature, changePassword } = useAuth();
  const _fullName = `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 'N/A';

  const formatDateForInput = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d)) return '';
      return d.toISOString().slice(0, 10);
    } catch (_e) {
      return '';
    }
  };

 const _maskPassword = (password) => {
    return password ? '*'.repeat(password.length) : '********';
  };

   const getDisplayName = () => {
    const prefix = userProfile?.role === 'DOCTOR' ? 'Dr. ' : '';
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${prefix}${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (authenticatedUser?.user_metadata?.full_name) {
      return `${prefix}${authenticatedUser.user_metadata.full_name}`;
    }
    if (authenticatedUser?.user_metadata?.name) {
      return `${prefix}${authenticatedUser.user_metadata.name}`;
    }
    if (authenticatedUser?.email) {
      return authenticatedUser.email.split('@')[0];
    }
    return 'User';
  };

const getInitials = () => {
    const name = getDisplayName().replace("Dr. ", "").trim();

    if (!name) return "U"; 

    const parts = name.split(" ").filter(Boolean);

   
    if (parts.length === 1) {
        return parts[0][0].toUpperCase();
    }

    
    const firstInitial = parts[0][0];
    const lastInitial = parts[parts.length - 1][0];

    return (firstInitial + lastInitial).toUpperCase();
};

  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [signatureMessage, setSignatureMessage] = useState('');

  // displayed profile for UI-only edits
  const [displayedProfile, setDisplayedProfile] = useState(userProfile || {});

  // editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [role, setRole] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [email, setEmail] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileErrors, setProfileErrors] = useState({});

  const handleEditPassword = () => {
    setError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowModal(true);
  };

  useEffect(() => {
    // populate editable fields when profile/auth load
    setDisplayedProfile(userProfile || {});
    setFirstName(userProfile?.first_name || '');
    setLastName(userProfile?.last_name || '');
    setSex(userProfile?.sex || '');
    setAddress(userProfile?.address || '');
    setDateOfBirth(userProfile?.date_of_birth ? formatDateForInput(userProfile.date_of_birth) : '');
    setRole(userProfile?.role || '');
    setEmail(authenticatedUser?.email || '');
  }, [userProfile, authenticatedUser]);

  const handleToggleEdit = () => {
    setProfileMessage('');
    setShowProfileModal(true);
  };

  const _handleCancelEdit = () => {
    // reset values to store values
    setFirstName(userProfile?.first_name || '');
    setLastName(userProfile?.last_name || '');
    setSex(userProfile?.sex || '');
    setAddress(userProfile?.address || '');
    setDateOfBirth(userProfile?.date_of_birth ? formatDateForInput(userProfile.date_of_birth) : '');
    setRole(userProfile?.role || '');
    setEmail(authenticatedUser?.email || '');
    setEditMode(false);
    setProfileMessage('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');

    // Validate profile fields
    const errs = {};
    if (firstName) { const err = validateName(firstName, 'First name'); if (err) errs.firstName = err; }
    if (lastName) { const err = validateName(lastName, 'Last name'); if (err) errs.lastName = err; }
    if (address) { const err = validateAddress(address); if (err) errs.address = err; }
    if (dateOfBirth) { const err = validateDateOfBirth(dateOfBirth); if (err) errs.dateOfBirth = err; }
    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);

    try {
      const updates = {
        first_name: firstName || null,
        last_name: lastName || null,
        sex: sex || null,
        address: address || null,
        date_of_birth: dateOfBirth || null,
      };

      const result = await updateProfile(updates);

      if (result.success) {
        setDisplayedProfile(result.data);
        setProfileMessage('Profile saved successfully!');
        setShowProfileModal(false);
      } else {
        setProfileMessage('Save failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Save profile failed:', err);
      setProfileMessage('Save failed: ' + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSignature = async (dataUrl) => {
    setSignatureSaving(true);
    setSignatureMessage('');

    try {
      const result = await uploadSignature(dataUrl);

      if (result.success) {
        setSignatureMessage('Signature saved successfully!');
        setShowSignatureModal(false);
      } else {
        setSignatureMessage('Failed to save signature: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Save signature failed:', err);
      setSignatureMessage('Failed: ' + (err?.message || err));
    } finally {
      setSignatureSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    const passwordErr = validatePassword(newPassword, { requireStrength: true });
    if (passwordErr) {
      setError(passwordErr);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    const result = await changePassword(newPassword);
    if (result.success) {
      showToast({ title: 'Success', message: 'Password changed successfully.', type: 'success' });
      setShowModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    } else {
      setError(result.error || 'Failed to change password.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  return (  
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='rounded-xl ring-1 ring-gray-200 dark:ring-[#1F2A37] bg-white dark:bg-[#161B26]'
      >
        {/* ─── Profile Section ─── */}
        <div className='p-5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-14 h-14 rounded-full bg-linear-to-br from-crimson-600 to-crimson-500 flex items-center justify-center shrink-0'>
                <p className='text-white text-lg font-bold'>{getInitials()}</p>
              </div>
              <div>
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>{getDisplayName()}</p>
                <p className='text-xs text-gray-500 dark:text-[#94969C] mt-0.5'>{displayedProfile?.role || 'N/A'}</p>
                <p className='text-xs text-gray-400 dark:text-[#85888E] mt-0.5'>{displayedProfile?.address || ''}</p>
              </div>
            </div>
            <button onClick={handleToggleEdit} className='inline-flex items-center gap-1.5 px-4 py-2 rounded-lg ring-1 ring-gray-200 dark:ring-[#333741] text-sm font-medium text-gray-700 dark:text-[#CECFD2] hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-colors cursor-pointer'>
              Edit <Pencil className='w-3.5 h-3.5' />
            </button>
          </div>
        </div>

        {/* ─── Personal Information Section ─── */}
        <div className='px-5 pb-5'>
          <div className='flex items-center justify-between border-t border-gray-200 dark:border-[#1F2A37] pt-5 mb-5'>
            <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Personal Information</h3>
          </div>

          <div className='grid grid-cols-2 gap-x-8 gap-y-5'>
            <div>
              <p className='text-xs text-gray-400 dark:text-[#85888E]'>First Name</p>
              <p className='text-sm font-medium text-gray-900 dark:text-white mt-1'>{displayedProfile?.first_name || 'N/A'}</p>
            </div>
            <div>
              <p className='text-xs text-gray-400 dark:text-[#85888E]'>Last Name</p>
              <p className='text-sm font-medium text-gray-900 dark:text-white mt-1'>{displayedProfile?.last_name || 'N/A'}</p>
            </div>
            <div>
              <p className='text-xs text-gray-400 dark:text-[#85888E]'>Email address</p>
              <p className='text-sm font-medium text-gray-900 dark:text-white mt-1'>{authenticatedUser?.email || 'N/A'}</p>
            </div>
            <div>
              <p className='text-xs text-gray-400 dark:text-[#85888E]'>Gender</p>
              <p className='text-sm font-medium text-gray-900 dark:text-white mt-1'>{displayedProfile?.sex || 'N/A'}</p>
            </div>
            <div>
              <p className='text-xs text-gray-400 dark:text-[#85888E]'>Date of Birth</p>
              <p className='text-sm font-medium text-gray-900 dark:text-white mt-1'>{formatDateForInput(displayedProfile?.date_of_birth) || 'N/A'}</p>
            </div>
            <div>
              <p className='text-xs text-gray-400 dark:text-[#85888E]'>Address</p>
              <p className='text-sm font-medium text-gray-900 dark:text-white mt-1'>{displayedProfile?.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* ─── Account Security Section ─── */}
        <div className='px-5 pb-5'>
          <h3 className='text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-[#1F2A37] pt-5 mb-5'>Account Security</h3>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-400 dark:text-[#85888E]'>Email</p>
                <p className='text-sm font-medium text-gray-900 dark:text-white mt-1'>{authenticatedUser?.email || 'N/A'}</p>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-400 dark:text-[#85888E]'>Password</p>
                <p className='text-sm font-medium text-gray-900 dark:text-white mt-1 tracking-widest'>••••••••</p>
              </div>
              <button onClick={handleEditPassword} className='inline-flex items-center gap-1.5 px-4 py-2 rounded-lg ring-1 ring-gray-200 dark:ring-[#333741] text-sm font-medium text-gray-700 dark:text-[#CECFD2] hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-colors cursor-pointer'>
                Change password
              </button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-400 dark:text-[#85888E]'>Account Status</p>
                <p className='text-sm font-medium text-gray-900 dark:text-white mt-1'>Active</p>
              </div>
              <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 ring-1 ring-green-100'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-500'></span>
                Active
              </span>
            </div>

            <div>
              <p className='text-xs text-gray-400 dark:text-[#85888E]'>Last Sign In</p>
              <p className='text-sm font-medium text-gray-900 dark:text-white mt-1'>
                {authenticatedUser?.last_sign_in_at 
                  ? new Date(authenticatedUser.last_sign_in_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>

        {/* ─── Digital Signature Section (not for ADMIN) ─── */}
        {userProfile?.role !== 'ADMIN' && (
        <div className='px-5 pb-5'>
          <h3 className='text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-[#1F2A37] pt-5 mb-3'>Digital Signature</h3>
          <p className='text-xs text-gray-400 dark:text-[#85888E] mt-1'>Used on prescriptions and medical certificates</p>

          <div className='mt-5'>
            {userProfile?.signature_url ? (
              <div className='flex items-center justify-between'>
                <div className='ring-1 ring-gray-200 dark:ring-[#1F2A37] rounded-lg p-4 bg-gray-50 dark:bg-[#1F242F]'>
                  <img
                    src={userProfile.signature_url}
                    alt="Your signature"
                    className='max-h-[80px] max-w-[200px] object-contain'
                  />
                </div>
                <button
                  onClick={() => { setSignatureMessage(''); setShowSignatureModal(true); }}
                  className='inline-flex items-center gap-1.5 px-4 py-2 rounded-lg ring-1 ring-gray-200 dark:ring-[#333741] text-sm font-medium text-gray-700 dark:text-[#CECFD2] hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-colors cursor-pointer'
                >
                  Update <Pencil className='w-3.5 h-3.5' />
                </button>
              </div>
            ) : (
              <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500 dark:text-[#94969C]'>No signature added yet</p>
                <button
                  onClick={() => { setSignatureMessage(''); setShowSignatureModal(true); }}
                  className='inline-flex items-center gap-1.5 px-4 py-2 rounded-lg ring-1 ring-gray-200 dark:ring-[#333741] text-sm font-medium text-gray-700 dark:text-[#CECFD2] hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-colors cursor-pointer'
                >
                  Add Signature
                </button>
              </div>
            )}

            {signatureMessage && (
              <div className={`mt-3 flex items-center gap-2 p-3 rounded-lg text-sm ${
                signatureMessage.includes('success') ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : 'bg-red-50 text-red-600 ring-1 ring-red-100'
              }`}>
                {signatureMessage.includes('success') ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {signatureMessage}
              </div>
            )}
          </div>
        </div>
        )}
      </motion.div>

    {/* Change Password Modal */}
    <AnimatePresence>
    {showModal && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={handleCloseModal}></div>
        <motion.div
          className="relative bg-white dark:bg-[#161B26] rounded-2xl shadow-2xl w-[90%] max-w-md p-6 z-10"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className='flex items-center gap-3 mb-5'>
            <div className='w-9 h-9 rounded-xl bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center ring-1 ring-crimson-100 dark:ring-[#333741]'>
              <Lock className="w-4 h-4 text-crimson-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Change Password</h3>
          </div>
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                maxLength={LIMITS.PASSWORD_MAX}
                className="w-full p-2.5 border border-gray-200 dark:border-[#1F2A37] rounded-xl text-sm focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400 outline-none transition-all"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                maxLength={LIMITS.PASSWORD_MAX}
                className="w-full p-2.5 border border-gray-200 dark:border-[#1F2A37] rounded-xl text-sm focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400 outline-none transition-all"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength={LIMITS.PASSWORD_MAX}
                className="w-full p-2.5 border border-gray-200 dark:border-[#1F2A37] rounded-xl text-sm focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400 outline-none transition-all"
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <div className='flex items-center gap-2 p-3 bg-red-50 rounded-xl ring-1 ring-red-100'>
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-[#1F242F] hover:bg-gray-200  transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-medium bg-crimson-600 text-white hover:bg-crimson-700 transition-colors shadow-sm">Update Password</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>

    {/* Edit Profile Modal */}
    <AnimatePresence>
    {showProfileModal && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setShowProfileModal(false)}></div>
        <motion.div
          className="relative bg-white dark:bg-[#161B26] rounded-2xl shadow-2xl w-[90%] max-w-lg p-6 z-10 max-h-[90vh] overflow-auto"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className='flex items-center gap-3 mb-5'>
            <div className='w-9 h-9 rounded-xl bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center ring-1 ring-crimson-100 dark:ring-[#333741]'>
              <UserPen className="w-4 h-4 text-crimson-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Edit Personal Information</h3>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">Role</label>
              <input value={role} disabled className="w-full p-2.5 border border-gray-200 dark:border-[#1F2A37] rounded-xl text-sm bg-gray-50 dark:bg-[#1F242F] text-gray-500 dark:text-[#94969C] cursor-not-allowed" />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">First name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={LIMITS.NAME_MAX} className={`w-full p-2.5 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${profileErrors.firstName ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-200 dark:border-[#1F2A37] focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400'}`} placeholder="First name" />
                {profileErrors.firstName && <p className="text-xs text-red-500 mt-1">{profileErrors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={LIMITS.NAME_MAX} className={`w-full p-2.5 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${profileErrors.lastName ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-200 dark:border-[#1F2A37] focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400'}`} placeholder="Last name" />
                {profileErrors.lastName && <p className="text-xs text-red-500 mt-1">{profileErrors.lastName}</p>}
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">Gender</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-[#1F2A37] rounded-xl text-sm dark:bg-[#161B26] dark:text-white focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400 outline-none transition-all dark:[color-scheme:dark]">
                  <option value=''>Select</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">Date of birth</label>
                <input type='date' value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={`w-full p-2.5 border rounded-xl text-sm focus:ring-2 outline-none transition-all dark:[color-scheme:dark] ${profileErrors.dateOfBirth ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-200 dark:border-[#1F2A37] focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400'}`} />
                {profileErrors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{profileErrors.dateOfBirth}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={LIMITS.ADDRESS_MAX} className={`w-full p-2.5 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${profileErrors.address ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-gray-200 dark:border-[#1F2A37] focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400'}`} placeholder="Full address" />
              {profileErrors.address && <p className="text-xs text-red-500 mt-1">{profileErrors.address}</p>}
            </div>

            {profileMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                profileMessage.includes('success') ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : 'bg-red-50 text-red-600 ring-1 ring-red-100'
              }`}>
                {profileMessage.includes('success') ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {profileMessage}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-[#1F242F] hover:bg-gray-200  transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-crimson-600 text-white hover:bg-crimson-700 transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">{saving ? <><span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span> Saving...</> : 'Save Changes'}</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>

    {/* Signature Modal */}
    <AnimatePresence>
    {showSignatureModal && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setShowSignatureModal(false)}></div>
        <motion.div
          className="relative bg-white dark:bg-[#161B26] rounded-2xl shadow-2xl w-[90%] max-w-lg p-6 z-10 max-h-[90vh] overflow-auto"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className='flex items-center gap-3 mb-5'>
            <div className='w-9 h-9 rounded-xl bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center ring-1 ring-crimson-100 dark:ring-[#333741]'>
              <PenLine className="w-4 h-4 text-crimson-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {userProfile?.signature_url ? 'Update Your Signature' : 'Add Your Signature'}
            </h3>
          </div>

          {signatureSaving ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <span className='w-8 h-8 border-3 border-crimson-600 border-t-transparent rounded-full animate-spin'></span>
              <p className="text-sm text-gray-500 dark:text-[#94969C]">Saving signature...</p>
            </div>
          ) : (
            <SignaturePad
              onSave={handleSaveSignature}
              existingSignature={userProfile?.signature_url}
              onClear={() => {}}
            />
          )}

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => setShowSignatureModal(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-[#1F242F] hover:bg-gray-200  transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
    </>
  );
};

export default Settings;
