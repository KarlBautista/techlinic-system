import React from 'react'
import Navigation from '../components/newNavigation'
const Settings = () => {
  return (
    <div className='flex flex-col sm:flex-row h-full w-full gap-2'>
      <div className='sm:w-[17%]  h-full'>
           <Navigation />
      </div>
      <h1>Settings</h1>
      <div className='p-5 sm:w-[83%] w-full sm:h-full flex flex-col gap-5'></div>
        </div>
  )
}

export default Settings
