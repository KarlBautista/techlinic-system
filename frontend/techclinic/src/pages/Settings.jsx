import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Lock, Mail, KeyRound, Pencil, PenTool, PenLine, CheckCircle2, AlertCircle, UserPen, IdCard, Tag } from 'lucide-react';
import useAuth from '../store/useAuthStore';
import SignaturePad from '../components/SignaturePad';


const Settings = () => {
  const { authenticatedUser, userProfile, password, updateProfile, uploadSignature } = useAuth();
  const fullName = `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || 'N/A';

  const formatDateForInput = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d)) return '';
      return d.toISOString().slice(0, 10);
    } catch (e) {
      return '';
    }
  };

 const maskPassword = (password) => {
    return password ? '*'.repeat(password.length) : '********';
  };

   const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `Dr. ${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (authenticatedUser?.user_metadata?.full_name) {
      return `Dr. ${authenticatedUser.user_metadata.full_name}`;
    }
    if (authenticatedUser?.user_metadata?.name) {
      return `Dr. ${authenticatedUser.user_metadata.name}`;
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
  const [email, setEmail] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

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

  const handleCancelEdit = () => {
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

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    // UI-only: no backend call here. You can wire this to your API later.
    console.log('Password change (UI-only)', { currentPassword, newPassword });
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  return (  
    <>
      <div className='flex flex-col gap-4'>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Settings</h1>
          <p className='text-sm text-gray-500 dark:text-[#94969C] mt-1'>Manage your profile and account settings</p>
        </motion.div>

        {/* Profile Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] overflow-hidden'
        >
          {/* Banner top stripe */}
          <div className='h-28 bg-linear-to-r from-crimson-600 to-crimson-400 relative'>
            <div className='absolute -bottom-10 left-6 md:left-10'>
              <div className='w-20 h-20 md:w-24 md:h-24 rounded-full bg-white dark:bg-[#161B26] border-4 border-white shadow-md flex items-center justify-center'>
                <div className='w-full h-full rounded-full bg-linear-to-br from-crimson-600 to-crimson-500 flex items-center justify-center'>
                  <p className='text-white text-xl md:text-2xl font-bold'>{getInitials()}</p>
                </div>
              </div>
            </div>
          </div>
          <div className='pt-14 pb-6 px-6 md:px-10'>
            <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3'>
              <div>
                <h2 className='text-xl md:text-2xl font-bold text-gray-800 dark:text-white'>{getDisplayName()}</h2>
                <p className='text-sm text-gray-500 dark:text-[#94969C] mt-0.5'>
                  <span className='inline-flex items-center gap-1.5'>
                    <IdCard className="w-3.5 h-3.5 text-gray-400 dark:text-[#94969C]" />
                    {authenticatedUser?.id ? `${authenticatedUser.id.slice(0, 8)}...` : 'N/A'}
                  </span>
                  <span className='mx-2 text-gray-300 dark:text-[#94969C]'>|</span>
                  <span className='inline-flex items-center gap-1.5'>
                    <Tag className="w-3.5 h-3.5 text-gray-400 dark:text-[#94969C]" />
                    {displayedProfile?.role || 'N/A'}
                  </span>
                </p>
              </div>
              <button onClick={handleToggleEdit} className='inline-flex items-center gap-2 px-4 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm'>
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
          </div>
        </motion.div>

        {/* Info Cards Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Personal Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-6'
          >
            <div className='flex items-center gap-3 mb-5'>
              <div className='w-9 h-9 rounded-xl bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center ring-1 ring-crimson-100 dark:ring-[#333741]'>
                <User className="w-4 h-4 text-crimson-600" />
              </div>
              <h3 className='text-base font-semibold text-gray-800 dark:text-white'>Personal Information</h3>
            </div>

            <div className='space-y-4'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>First Name</p>
                  <p className='text-sm font-medium text-gray-800 dark:text-white mt-0.5'>{displayedProfile?.first_name || 'N/A'}</p>
                </div>
                <div className='text-right'>
                  <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Last Name</p>
                  <p className='text-sm font-medium text-gray-800 dark:text-white mt-0.5'>{displayedProfile?.last_name || 'N/A'}</p>
                </div>
              </div>

              <div className='border-t border-gray-50 dark:border-[#1F2A37]'></div>

              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Gender</p>
                  <p className='text-sm font-medium text-gray-800 dark:text-white mt-0.5'>{displayedProfile?.sex || 'N/A'}</p>
                </div>
                <div className='text-right'>
                  <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Date of Birth</p>
                  <p className='text-sm font-medium text-gray-800 dark:text-white mt-0.5'>{formatDateForInput(displayedProfile?.date_of_birth) || 'N/A'}</p>
                </div>
              </div>

              <div className='border-t border-gray-50 dark:border-[#1F2A37]'></div>

              <div>
                <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Address</p>
                <p className='text-sm font-medium text-gray-800 dark:text-white mt-0.5'>{displayedProfile?.address || 'N/A'}</p>
              </div>

              <div className='border-t border-gray-50 dark:border-[#1F2A37]'></div>

              <div>
                <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Role</p>
                <span className='inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-crimson-50 dark:bg-[#1F242F] text-crimson-600 ring-1 ring-crimson-100 dark:ring-[#333741]'>
                  <Shield className="w-3 h-3" />
                  {displayedProfile?.role || 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Login & Security Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-6'
          >
            <div className='flex items-center gap-3 mb-5'>
              <div className='w-9 h-9 rounded-xl bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center ring-1 ring-crimson-100 dark:ring-[#333741]'>
                <Lock className="w-4 h-4 text-crimson-600" />
              </div>
              <h3 className='text-base font-semibold text-gray-800 dark:text-white'>Login & Security</h3>
            </div>

            <div className='space-y-4'>
              <div>
                <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Email Address</p>
                <div className='flex items-center gap-2 mt-1'>
                  <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-[#94969C]" />
                  <p className='text-sm font-medium text-gray-800 dark:text-white'>{authenticatedUser?.email || 'N/A'}</p>
                </div>
              </div>

              <div className='border-t border-gray-50 dark:border-[#1F2A37]'></div>

              <div>
                <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Password</p>
                <div className='flex items-center justify-between mt-1'>
                  <div className='flex items-center gap-2'>
                    <KeyRound className="w-3.5 h-3.5 text-gray-400 dark:text-[#94969C]" />
                    <p className='text-sm font-medium text-gray-800 dark:text-white tracking-widest'>••••••••</p>
                  </div>
                  <button 
                    onClick={handleEditPassword} 
                    className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-crimson-600 bg-crimson-50 dark:bg-[#1F242F] hover:bg-crimson-100 rounded-xl ring-1 ring-crimson-100 dark:ring-[#333741] transition-colors'>
                    <Pencil className="w-3 h-3" />
                    Change
                  </button>
                </div>
              </div>

              <div className='border-t border-gray-50 dark:border-[#1F2A37]'></div>

              <div>
                <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Account Status</p>
                <span className='inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 ring-1 ring-green-100'>
                  <span className='w-1.5 h-1.5 rounded-full bg-green-500'></span>
                  Active
                </span>
              </div>

              <div className='border-t border-gray-50 dark:border-[#1F2A37]'></div>

              <div>
                <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Last Sign In</p>
                <p className='text-sm font-medium text-gray-800 dark:text-white mt-0.5'>
                  {authenticatedUser?.last_sign_in_at 
                    ? new Date(authenticatedUser.last_sign_in_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Signature Card - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-6'
        >
          <div className='flex items-center justify-between mb-5'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center ring-1 ring-crimson-100 dark:ring-[#333741]'>
                <PenLine className="w-4 h-4 text-crimson-600" />
              </div>
              <div>
                <h3 className='text-base font-semibold text-gray-800 dark:text-white'>Digital Signature</h3>
                <p className='text-xs text-gray-400 dark:text-[#94969C] mt-0.5'>Used on prescriptions and medical certificates</p>
              </div>
            </div>
            <button
              onClick={() => { setSignatureMessage(''); setShowSignatureModal(true); }}
              className='inline-flex items-center gap-2 px-4 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm'
            >
              <PenTool className="w-3.5 h-3.5" />
              {userProfile?.signature_url ? 'Update Signature' : 'Add Signature'}
            </button>
          </div>

          {userProfile?.signature_url ? (
            <div className='ring-1 ring-gray-200 dark:ring-[#1F2A37] rounded-xl p-6 bg-gray-50 dark:bg-[#1F242F] flex flex-col items-center gap-3'>
              <img
                src={userProfile.signature_url}
                alt="Your signature"
                className='max-h-[120px] max-w-full object-contain'
              />
              <p className='text-xs text-gray-400 dark:text-[#94969C]'>Your current digital signature</p>
            </div>
          ) : (
            <div className='border-2 border-dashed border-gray-200 dark:border-[#1F2A37] rounded-xl p-8 flex flex-col items-center gap-3'>
              <div className='w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#1F242F] flex items-center justify-center'>
                <PenLine className="w-7 h-7 text-gray-300 dark:text-[#94969C]" />
              </div>
              <p className='text-sm font-medium text-gray-500 dark:text-[#94969C]'>No signature added yet</p>
              <p className='text-xs text-gray-400 dark:text-[#94969C]'>Add your signature to appear on prescriptions and certificates</p>
            </div>
          )}

          {signatureMessage && (
            <div className={`mt-3 flex items-center gap-2 p-3 rounded-xl text-sm ${
              signatureMessage.includes('success') ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : 'bg-red-50 text-red-600 ring-1 ring-red-100'
            }`}>
              {signatureMessage.includes('success') ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {signatureMessage}
            </div>
          )}
        </motion.div>
      </div>

    {/* Change Password Modal */}
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 modal-backdrop-enter" onClick={handleCloseModal}></div>
        <div className="relative bg-white dark:bg-[#161B26] rounded-xl shadow-xl w-[90%] max-w-md p-6 z-10 modal-content-enter">
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
        </div>
      </div>
    )}

    {/* Edit Profile Modal */}
    {showProfileModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 modal-backdrop-enter" onClick={() => setShowProfileModal(false)}></div>
        <div className="relative bg-white dark:bg-[#161B26] rounded-xl shadow-xl w-[90%] max-w-lg p-6 z-10 modal-content-enter max-h-[90vh] overflow-auto">
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
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-[#1F2A37] rounded-xl text-sm focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400 outline-none transition-all" placeholder="First name" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-[#1F2A37] rounded-xl text-sm focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400 outline-none transition-all" placeholder="Last name" />
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">Gender</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-[#1F2A37] rounded-xl text-sm focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400 outline-none transition-all">
                  <option value=''>Select</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">Date of birth</label>
                <input type='date' value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-[#1F2A37] rounded-xl text-sm focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2.5 border border-gray-200 dark:border-[#1F2A37] rounded-xl text-sm focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] focus:border-crimson-400 outline-none transition-all" placeholder="Full address" />
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
        </div>
      </div>
    )}

    {/* Signature Modal */}
    {showSignatureModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 modal-backdrop-enter" onClick={() => setShowSignatureModal(false)}></div>
        <div className="relative bg-white dark:bg-[#161B26] rounded-xl shadow-xl w-[90%] max-w-lg p-6 z-10 modal-content-enter max-h-[90vh] overflow-auto">
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
        </div>
      </div>
    )}
    </>
  );
};

export default Settings;