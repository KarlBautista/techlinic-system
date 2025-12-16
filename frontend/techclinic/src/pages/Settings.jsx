import React, { useState } from 'react';
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

  const handleEditPassword = () => {
    setError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowModal(true);
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

      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-5 flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold text-gray-800'>Settings</h1>
         <p className='text-[1rem] text-gray-500 mb-7'>Manage Information</p>
      <div className='flex flex-row items-center gap-6 mb-20'>
         
          <div className='w-[70px] h-[70px] 2xl:w-24 2xl:h-24 rounded-full bg-red-500 flex items-center justify-center overflow-hidden'>
            <p className='text-black sm:text-[1.5rem] md:text-[1.5rem] lg:text-[1.5rem] xl:text-[1.9rem]  font-bold'>{getInitials()}</p>
          </div>
         <div className='flex flex-col'>
            <h1 className='text-3xl font-semibold text-gray-800'>{fullName}</h1>
            <h5 className='text-lg font-medium text-gray-600'>ID: {authenticatedUser?.id || 'N/A'}</h5>
          </div>
        </div>

        <div className='w-full flex flex-col sm:flex-row gap-8 items-start justify-around'>
          <div className='w-full max-w-md bg-white shadow-md rounded-lg p-4'>
            <h2 className='text-xl font-semibold mb-4 '>Login Information</h2>
            <ul className='space-y-2'>
              <li>Email: {authenticatedUser?.email || 'N/A'}</li>
              <li className='flex items-center'>
                 Password: ********
                <button 
                  onClick={handleEditPassword} 
                  className='ml-4 text-blue-500 hover:opacity-50 text-sm flex items-center gap-1'>
                  <i className="fa-regular fa-pen-to-square text-black hover"></i>
                </button>
              </li>
                
            </ul>   
          </div>

          <div className='Settings red-[500] w-full max-w-md bg-white shadow-md rounded-lg p-4'>
            <h2 className='text-xl font-semibold mb-4 '>Personal Information</h2>

            <ul className='space-y-2'>
                
              <li>First Name: {userProfile?.first_name || 'N/A'}</li>
              <li>Last Name: {userProfile?.last_name || 'N/A'}</li>
              <li>Gender: {userProfile?.sex || 'N/A'}</li>
              <li>Address: {userProfile?.address || 'N/A'}</li>
              <li>Date of Birth: {formatDateForInput(userProfile?.date_of_birth) || 'N/A'}</li>
              <li>Role: {userProfile?.role || 'N/A'}</li>
              
            </ul>
          </div>
        </div>
      </div>
    </div>
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-40" onClick={handleCloseModal}></div>
        <div className="relative bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 z-10">
          <h3 className="text-lg font-semibold mb-3">Change Password</h3>
          <form onSubmit={handleSavePassword} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
                
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-[#b01c34] text-white">Save</button>
            </div>
          </form>
        </div>
      </div>

    )}
    </>
  );
};

export default Settings;
