import React from 'react';
import Navigation from '../components/newNavigation';
import useAuth from '../store/useAuthStore';


const Settings = () => {
  const { authenticatedUser, userProfile } = useAuth();
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
    const name = getDisplayName();
    const parts = name.replace('Dr. ', '').split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleEditPassword = () => {
    alert('Redirecting to change password page...');
   l
  };

  return (
    <div className='h-screen w-full flex flex-col sm:flex-row'>
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
        <Navigation />
      </div>

      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-5 flex flex-col items-center gap-4'>
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
                Password: {authenticatedUser?.password || 'N/A'}
                <button 
                  onClick={handleEditPassword} 
                  className='ml-4 text-blue-500 hover:underline text-sm flex items-center gap-1'>
                  <i class="fa-regular fa-pen-to-square"></i>
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
  );
};

export default Settings;
