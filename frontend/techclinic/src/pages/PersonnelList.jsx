import React, { useEffect, useState } from 'react'
import Navigation from '../components/newNavigation'
import Search from '../assets/image/searcg.svg'
import useAuth from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '../components/PageLoader'
const PersonnelList = () => {
  const [search, setSearch] = useState("");
  const { allUsers, getAllUsers, isLoadingUsers } = useAuth();
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
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
  }, [])

  function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const handleAddPersonnel = () => {
    navigate("/add-personnel");
  }

  return (
    <div className='h-screen w-full flex flex-col sm:flex-row'>
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%] '>
        <Navigation />
      </div>
      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-6 flex flex-col gap-4'>
        {initialLoading || isLoadingUsers ? (
          <PageLoader message="Loading personnel list..." />
        ) : (
        <>
        <h1 className='text-2xl font-bold text-gray-800'>Personnel List</h1>
        <p className='text-sm text-gray-500 mt-1'>Manage clinic staff and personnel</p>
        <div className='w-full flex flex-col gap-2'>
        </div>
        <div className='w-[90%] flex justify-between '>
          <div className='flex h-[50px]  p-2 rounded-[10px] border border-[#EACBCB] gap-2 w-[50%]' >
            <img src={Search} alt="" className='h-full' />
            <input type="text" className='outline-none w-full' placeholder='Search'
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div onClick={() => handleAddPersonnel()}>
            <button>Add Personnel</button>
          </div>
        </div>

        <div className=' h-10 w-[90%] flex gap-2 mt-5'>
          <div className='h-full w-full flex items-center font-medium'>
            <p className='text-[.9rem] tracking-[2px]'>Fullname</p>
          </div>
          <div className='h-full w-full flex items-center font-medium'>
            <p className='text-[.9rem] tracking-[2px]'>Role</p>
          </div>
          <div className='h-full w-full flex items-center font-medium'>
            <p className='text-[.9rem] tracking-[2px]'>Email</p>
          </div>
          <div className='h-full w-full flex items-center font-medium'>
            <p className='text-[.9rem] tracking-[2px]'>Sex</p>
          </div>
          <div className='h-full w-full flex items-center font-medium'>
            <p className='text-[.9rem] tracking-[2px]'>Date of birth</p>
          </div>
        </div>

        <div className='w-[90%] h-full overflow-y-auto '>
          {allUsers?.length > 0 ? (
            allUsers.map((user) => (
              <div key={user.id} className='studentCss cursor-default hover:underline hover:decoration-[#A12217] hover:decoration-2'>
                <div className='studentInfoContainer'>
                  <p className='studentInfoData'>{`${user.first_name} ${user.last_name}`}</p>
                </div>
                <div className='studentInfoContainer'>
                  <p className='studentInfoData'>{user.role}</p>
                </div>
                <div className='studentInfoContainer'>
                  <p className='studentInfoData'>{user.email}</p>
                </div>
                <div className='studentInfoContainer'>
                  <p className='studentInfoData'>{user.sex}</p>
                </div>
                <div className='studentInfoContainer'>
                  <p className='studentInfoData'>{formatDate(user.date_of_birth)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm mt-3">No results found.</p>
          )}
        </div>

        </>
        )}
      </div>

    </div>



  )
}

export default PersonnelList
