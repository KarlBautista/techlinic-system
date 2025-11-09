import React from 'react'
import Navigation from '../components/Navigation'
import {useState} from 'react'



const NewPatient = () => {
  return (

<div className='flex h-full w-full gap-2'>
        <div className='sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[20%]'>
          <Navigation />
        </div>


    {/* record */}
        <div className='w-[80%]  h-full flex justify-center p-1 '>
            <div className='w-[90%] overflow-y-scroll h-full flex flex-col items-center gap-3'>
                <div className='w-full'>
                    <p className='text-[1.5rem] font-bold'>Add Patient Record</p>
                    <p className='text-[.8rem]'>Patient Clinical Documentation</p>
                </div>

                <div className='w-[90%] flex flex-col items-center'>
                  {/* Student Info */}
                  <div className='w-full'>
                    <p className='text-[.9rem]'>Student Information</p>
                  </div>
                  <div className='border-1 border-gray-200 w-full'></div>

                  {/* Student input */}
                  <form action="" className=' w-full  flex flex-wrap gap-2 justify-evenly mt-2'>
                    

                    <div className='formInfo'>
                        <input
                          type="text"
                          name="firstName"
                          placeholder=" "
                          id='firstName'
                        />
                        <label htmlFor="firstName" className='text-[.8rem]'>First name</label>
                    </div>

                    <div className='formInfo'>
                        <input
                          type="text"
                          name="lastName"
                          placeholder=" "
                          id='lastName'
                        />
                        <label htmlFor="lastName" className='text-[.8rem]'>Last name</label>
                    </div>

                    <div className='formInfo'>
                        <input
                          type="text"
                          name="studentID"
                          placeholder=" "
                          id='studentID'
                        />
                        <label htmlFor="studentID" className='text-[.8rem]'>Student ID</label>
                    </div>
                    
                    <div className='formInfo'>
                         <input
                          type="tel"
                          inputMode="numeric"
                          name="contactNum"
                          placeholder=" "
                          id='contactNum'
                        />
                        <label htmlFor="contactNum" className='text-[.8rem]'>Contact Number</label>
                    </div>

                    <div className='formInfo'>
                      <select id="year" name="year" defaultValue="" className='w-full p-2 rounded-[10px] border outline-none'>
                        <option value="" disabled>Select Year</option>
                        <option value="1">1st year</option>
                        <option value="2">2nd year</option>
                        <option value="3">3rd year</option>
                        <option value="4">4th year</option>
                      </select>
                    </div>

                    <div className='formInfo'>
                      <select id="department" name="department" defaultValue="" className='w-full p-2 rounded-[10px] border outline-none'>
                        <option value="" disabled>Select Department</option>
                        <option value="1">College of Science</option>
                        <option value="2">College of Engineering</option>
                        <option value="3">College of Industrial Technology</option>
                        <option value="4">College of Architecture and Fine Arts</option>
                      </select>
                    </div>
                    
                    <div className='formInfo'>
                      <select id="sex" name="sex" defaultValue="" className='w-full p-2 rounded-[10px] border outline-none'>
                        <option value="" disabled>Sex</option>
                        <option value="1">Male</option>
                        <option value="2">Female</option>
                      </select>
                    </div>
                    
                    <div className='formInfo'>
                        <input
                          type="text"
                          name="email"
                          placeholder=" "
                          id='email'
                        />
                        <label htmlFor="email" className='text-[.8rem]'>Email</label>
                    </div>


                  <div className='w-full mt-10'>
                    <p className='text-[.9rem]'>Medical Information</p>
                  </div>
                  <div className='border-1 border-gray-200 w-full'></div>
                    
                  <div className='w-full bg-red-100 h-[500px] flex'>
                      <div className='w-[50%] h-full flex items-center flex-col'>
                          <div className='formDiagnosis'>
                            <select id="year" name="year" defaultValue="" className='w-full p-2 rounded-[10px] border outline-none'>
                              <option value="" disabled>Diagnosis</option>
                              <option value="1">HEENT</option>
                              <option value="2">Chest and Lungs / Pulmunary</option>
                              <option value="3">Heart</option>
                              <option value="4">Endocrine</option>
                              <option value="5">Gastrointestinal</option>
                              <option value="6">Genito-Urinary</option>
                              <option value="7">Muscoloskeletal</option>
                              <option value="8">Surgical</option>
                              <option value="9">Neurology / Psych</option>
                              <option value="10">Derma</option>
                              <option value="11">Infectious Disease</option>
                            </select>
                          </div>

                          <div className='formDiagnosis'>
                              <select id="medication" name="medication" defaultValue="" className='w-full p-2 rounded-[10px] border outline-none'>
                                <option value="" disabled>Medication</option>
                                <option value="1">BioFlu</option>
                                <option value="2">Alaxan</option>
                              </select>
                          </div>

                          <div className='formDiagnosis'>
                              <input
                                type="number"
                                name="quantity"
                                placeholder=" "
                                id='quantity'
                              />
                              <label htmlFor="quantity" className='text-[.8rem]'>Quantity</label>
                          </div>

                      </div>
                      
                      <div  className='w-[50%] h-full'>

                      </div>
                  </div>


                  </form>

                </div>
            </div>
        </div>
    </div>
  )
}

export default NewPatient
