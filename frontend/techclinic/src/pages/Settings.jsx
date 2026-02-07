import React, { useState, useEffect } from 'react';
import Navigation from '../components/newNavigation';
import useAuth from '../store/useAuthStore';



const Settings = () => {
  const { authenticatedUser, userProfile, password } = useAuth();
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

    // UI-only: simulate save by updating local displayed profile only
    try {
      const newProfile = {
        ...displayedProfile,
        first_name: firstName || null,
        last_name: lastName || null,
        sex: sex || null,
        address: address || null,
        date_of_birth: dateOfBirth || null,
        role: role || null,
      };

      setDisplayedProfile(newProfile);
      setProfileMessage('Saved (UI-only)');
      setShowProfileModal(false);
    } catch (err) {
      console.error('Save profile (UI-only) failed:', err);
      setProfileMessage('Save failed: ' + (err?.message || err));
    } finally {
      setSaving(false);
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
      <div className='h-screen w-full flex flex-col sm:flex-row'>
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
        <Navigation />
      </div>

      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-6 flex flex-col gap-4'>
        {/* Page Header */}
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Settings</h1>
          <p className='text-sm text-gray-500 mt-1'>Manage your profile and account settings</p>
        </div>

        {/* Profile Banner */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
          {/* Banner top stripe */}
          <div className='h-28 bg-linear-to-r from-[#b01c34] to-[#d4375a] relative'>
            <div className='absolute -bottom-10 left-6 md:left-10'>
              <div className='w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center'>
                <div className='w-full h-full rounded-full bg-[#b01c34] flex items-center justify-center'>
                  <p className='text-white text-xl md:text-2xl font-bold'>{getInitials()}</p>
                </div>
              </div>
            </div>
          </div>
          <div className='pt-14 pb-6 px-6 md:px-10'>
            <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3'>
              <div>
                <h2 className='text-xl md:text-2xl font-bold text-gray-800'>{getDisplayName()}</h2>
                <p className='text-sm text-gray-500 mt-0.5'>
                  <span className='inline-flex items-center gap-1.5'>
                    <i className='fa-solid fa-id-badge text-gray-400'></i>
                    {authenticatedUser?.id ? `${authenticatedUser.id.slice(0, 8)}...` : 'N/A'}
                  </span>
                  <span className='mx-2 text-gray-300'>|</span>
                  <span className='inline-flex items-center gap-1.5'>
                    <i className='fa-solid fa-user-tag text-gray-400'></i>
                    {displayedProfile?.role || 'N/A'}
                  </span>
                </p>
              </div>
              <button onClick={handleToggleEdit} className='inline-flex items-center gap-2 px-4 py-2 bg-[#b01c34] hover:bg-[#8f1629] text-white text-sm font-medium rounded-lg transition-colors'>
                <i className='fa-solid fa-pen-to-square'></i>
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Personal Information Card */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='flex items-center gap-3 mb-5'>
              <div className='w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center'>
                <i className='fa-solid fa-user text-[#b01c34] text-sm'></i>
              </div>
              <h3 className='text-base font-semibold text-gray-800'>Personal Information</h3>
            </div>

            <div className='space-y-4'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-medium text-gray-400 uppercase tracking-wider'>First Name</p>
                  <p className='text-sm font-medium text-gray-800 mt-0.5'>{displayedProfile?.first_name || 'N/A'}</p>
                </div>
                <div className='text-right'>
                  <p className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Last Name</p>
                  <p className='text-sm font-medium text-gray-800 mt-0.5'>{displayedProfile?.last_name || 'N/A'}</p>
                </div>
              </div>

              <div className='border-t border-gray-50'></div>

              <div className='flex items-start justify-between'>
                <div>
                  <p className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Gender</p>
                  <p className='text-sm font-medium text-gray-800 mt-0.5'>{displayedProfile?.sex || 'N/A'}</p>
                </div>
                <div className='text-right'>
                  <p className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Date of Birth</p>
                  <p className='text-sm font-medium text-gray-800 mt-0.5'>{formatDateForInput(displayedProfile?.date_of_birth) || 'N/A'}</p>
                </div>
              </div>

              <div className='border-t border-gray-50'></div>

              <div>
                <p className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Address</p>
                <p className='text-sm font-medium text-gray-800 mt-0.5'>{displayedProfile?.address || 'N/A'}</p>
              </div>

              <div className='border-t border-gray-50'></div>

              <div>
                <p className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Role</p>
                <span className='inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#b01c34]'>
                  <i className='fa-solid fa-shield-halved text-[10px]'></i>
                  {displayedProfile?.role || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Login & Security Card */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='flex items-center gap-3 mb-5'>
              <div className='w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center'>
                <i className='fa-solid fa-lock text-[#b01c34] text-sm'></i>
              </div>
              <h3 className='text-base font-semibold text-gray-800'>Login & Security</h3>
            </div>

            <div className='space-y-4'>
              <div>
                <p className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Email Address</p>
                <div className='flex items-center gap-2 mt-1'>
                  <i className='fa-solid fa-envelope text-gray-400 text-xs'></i>
                  <p className='text-sm font-medium text-gray-800'>{authenticatedUser?.email || 'N/A'}</p>
                </div>
              </div>

              <div className='border-t border-gray-50'></div>

              <div>
                <p className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Password</p>
                <div className='flex items-center justify-between mt-1'>
                  <div className='flex items-center gap-2'>
                    <i className='fa-solid fa-key text-gray-400 text-xs'></i>
                    <p className='text-sm font-medium text-gray-800 tracking-widest'>••••••••</p>
                  </div>
                  <button 
                    onClick={handleEditPassword} 
                    className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#b01c34] bg-red-50 hover:bg-red-100 rounded-lg transition-colors'>
                    <i className='fa-solid fa-pen text-[10px]'></i>
                    Change
                  </button>
                </div>
              </div>

              <div className='border-t border-gray-50'></div>

              <div>
                <p className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Account Status</p>
                <span className='inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700'>
                  <span className='w-1.5 h-1.5 rounded-full bg-green-500'></span>
                  Active
                </span>
              </div>

              <div className='border-t border-gray-50'></div>

              <div>
                <p className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Last Sign In</p>
                <p className='text-sm font-medium text-gray-800 mt-0.5'>
                  {authenticatedUser?.last_sign_in_at 
                    ? new Date(authenticatedUser.last_sign_in_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Change Password Modal */}
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 modal-backdrop-enter" onClick={handleCloseModal}></div>
        <div className="relative bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 z-10 modal-content-enter">
          <div className='flex items-center gap-3 mb-5'>
            <div className='w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center'>
              <i className='fa-solid fa-lock text-[#b01c34] text-sm'></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
          </div>
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#b01c34]/20 focus:border-[#b01c34] outline-none transition-all"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#b01c34]/20 focus:border-[#b01c34] outline-none transition-all"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#b01c34]/20 focus:border-[#b01c34] outline-none transition-all"
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <div className='flex items-center gap-2 p-3 bg-red-50 rounded-lg'>
                <i className='fa-solid fa-circle-exclamation text-red-500 text-sm'></i>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-[#b01c34] text-white hover:bg-[#8f1629] transition-colors">Update Password</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Edit Profile Modal */}
    {showProfileModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 modal-backdrop-enter" onClick={() => setShowProfileModal(false)}></div>
        <div className="relative bg-white rounded-xl shadow-xl w-[90%] max-w-lg p-6 z-10 modal-content-enter max-h-[90vh] overflow-auto">
          <div className='flex items-center gap-3 mb-5'>
            <div className='w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center'>
              <i className='fa-solid fa-user-pen text-[#b01c34] text-sm'></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Edit Personal Information</h3>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role</label>
              <input value={role} disabled className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">First name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#b01c34]/20 focus:border-[#b01c34] outline-none transition-all" placeholder="First name" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#b01c34]/20 focus:border-[#b01c34] outline-none transition-all" placeholder="Last name" />
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Gender</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#b01c34]/20 focus:border-[#b01c34] outline-none transition-all">
                  <option value=''>Select</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date of birth</label>
                <input type='date' value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#b01c34]/20 focus:border-[#b01c34] outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#b01c34]/20 focus:border-[#b01c34] outline-none transition-all" placeholder="Full address" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#b01c34] text-white hover:bg-[#8f1629] transition-colors inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">{saving ? <><span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span> Saving...</> : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default Settings;