import NewNavigation from '../components/newNavigation.jsx'
import React, { useEffect, useRef } from 'react'
import useAuth from '../store/useAuthStore';
import useData from '../store/useDataStore';
import Notification from '../assets/componentImage/notification.svg'
import useMedicine from '../store/useMedicineStore';

import Swal from "sweetalert2";
import { useLocation, Link, useNavigate } from 'react-router-dom'

import AnimateNumber from "../components/AnimateNumber"

const NewDashboard = () => {
    const { authenticatedUser, userProfile } = useAuth();
    const { patientRecords, patientsData } = useData();
    const records = patientRecords?.data ?? [];
    const { medicines } = useMedicine();
    const navigate = useNavigate();

    function formatDate(dateString) {
        if (!dateString) return "";

        const date = new Date(dateString);

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }



    const getDisplayName = () => {
        if (userProfile?.first_name && userProfile?.last_name) {
            return `${userProfile.first_name} ${userProfile.last_name}`;
        } else if (userProfile?.first_name) {
            return userProfile.first_name;
        } else if (authenticatedUser?.user_metadata?.name) {
            return authenticatedUser.user_metadata.name;
        } else if (authenticatedUser?.email) {
            return authenticatedUser.email.split('@')[0];
        }
        return "User";
    };


    const getUserRole = () => {
        return userProfile?.role || "Staff";
    };



    const handleDiagnose = (recordId) => {
        try {
            navigate(`/add-diagnosis/${recordId}`);
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleIndividualRecord = (studentId) => {
        try {
            navigate(`/individual-record/${studentId}`);
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleWaitingForDiagnosis = () => {
        Swal.fire({
            title: "Awaiting Physician Assessment",
            text: "This patient is awaiting physician assessment; a formal diagnosis has not yet been provided.",
            icon: "info"
        })
    }

    const isToday = (dateString) => {
        if (!dateString) return false;
        const recordDate = new Date(dateString).toDateString();
        const today = new Date().toDateString();
        return recordDate === today;
    }

    return (
        <div className='h-screen w-full flex flex-col sm:flex-row'>
            <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
                <NewNavigation />
            </div>
            <div className='h-[92%] min-w-[360px] sm:min-w-0  w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-5 flex flex-col gap-2'>
                <div className='h-[10%] p-2 w-full flex gap-1'>
                    <div className='w-[90%] h-full flex flex-col'>
                        <h2 className='text-[1.2rem] font-semibold text-gray-900'>
                            Good Day, Dr. {getDisplayName()}
                        </h2>
                        <div className='flex items-center gap-2'>
                            <h3 className='text-gray-500 text-[.7rem]'>{formatDate(new Date())}</h3>
                            {userProfile?.role && (
                                <span className='px-2 py-0.5 bg-red-100 text-red-800 text-[.6rem] rounded-full font-medium'>
                                    {getUserRole()}
                                </span>
                            )}
                        </div>
                    </div>
                    <Link to={'/notifications'} className='w-[10%] h-full  flex items-center justify-center'>
                        <img src={Notification} className='sm:hidden h-5  cursor-pointer' alt="" />
                    </Link>
                </div>

                <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='p-4 bg-white rounded-lg shadow-md'>
                        <p className='text-sm text-gray-500'>Total Patients</p>
                        <p className='text-3xl font-bold text-[#b01c34] mt-2'>{<AnimateNumber value={patientsData?.length || 0} />}</p>
                        <p className='text-xs text-gray-400 mt-1'>Number of registered patients</p>
                    </div>

                    <div className=' p-4 bg-white rounded-lg shadow-md '>
                        <p className='text-sm text-gray-500'>Total Visits</p>
                        <p className='text-3xl font-bold text-[#b01c34] mt-2'>{<AnimateNumber value={records?.length || 0} />}</p>
                        <p className='text-xs text-gray-400 mt-1'>Total clinic visits recorded</p>
                    </div>

                    <div className='p-4 bg-white rounded-lg shadow-md '>
                        <p className='text-sm text-gray-500'>Total Diagnoses</p>
                        <p className='text-3xl font-bold text-[#b01c34] mt-2'>{<AnimateNumber value={records?.length || 0} />}</p>
                        <p className='text-xs text-gray-400 mt-1'>Total diagnoses entries</p>
                    </div>

                    <div className='p-4 bg-white rounded-lg shadow-md '>
                        <p className='text-sm text-gray-500'>Medicine Inventory</p>
                        <p className='text-3xl font-bold text-[#b01c34] mt-2'><AnimateNumber value={medicines?.length || 0} /></p>
                        <p className='text-xs text-gray-400 mt-1'>Total medicines in stock</p>
                    </div>
                </div>

                <div className='w-full flex items-center flex-col mt-10 p-2'>
                    <h1 className='text-1xl w-full font-semibold mb-2'>Recent records</h1>

                    <div className=' h-10 w-[90%] flex gap-2 mt-5'>
                        <div className='h-full w-full flex items-center font-medium'>
                            <p className='text-[.9remrem] tracking-[2px]'>Student ID</p>
                        </div>
                        <div className='h-full w-full flex items-center font-medium'>
                            <p className='text-[.9remrem] tracking-[2px]'>Name</p>
                        </div>
                        <div className='h-full w-full flex items-center font-medium'>
                            <p className='text-[.9remrem] tracking-[2px]'>Department</p>
                        </div>
                        <div className='h-full w-full flex items-center font-medium'>
                            <p className='text-[.9remrem] tracking-[2px]'>Diagnosis</p>
                        </div>
                        <div className='h-full w-full flex items-center font-medium'>
                            <p className='text-[.9remrem] tracking-[2px]'>Status</p>
                        </div>
                    </div>

                    <div className='w-[90%] h-full overflow-y-auto '>
                        {records?.length > 0 ? (
                            [...records].reverse().filter(patient => isToday(patient.created_at)).map((patient) => (
                                <div key={patient.id} className='studentCss cursor-default hover:underline hover:decoration-[#A12217] hover:decoration-2'
                                    //dito mapipindot lang table kapag doctor yung user
                                    onClick={patient.status === "INCOMPLETE" && userProfile?.role === "DOCTOR" ? () => handleDiagnose(patient.id) :
                                        patient.status === "INCOMPLETE" && userProfile?.role === "NURSE" ? () => handleWaitingForDiagnosis() :
                                            () => handleIndividualRecord(patient.student_id)}>


                                    <div className='studentInfoContainer'>
                                        <p className='studentInfoData'>{patient.student_id}</p>
                                    </div>
                                    <div className='studentInfoContainer'>
                                        <p className='studentInfoData'>{`${patient.first_name} ${patient.last_name}`}</p>
                                    </div>
                                    <div className='studentInfoContainer'>
                                        <p className='studentInfoData'>{patient.department}</p>
                                    </div>
                                    <div className='studentInfoContainer'>
                                        <p className='studentInfoData'>{patient.diagnoses[0]?.diagnosis || "N/A"}</p>
                                    </div>
                                    <div className='studentInfoContainer'>
                                        <p className='studentInfoData'>
                                            {patient.status === "COMPLETE" ? (
                                                <span
                                                    className="inline-block w-3 h-3 rounded-full bg-green-500"
                                                    role="img"
                                                    aria-label="Complete"
                                                    title="Complete"
                                                />
                                            ) : (
                                                <span
                                                    className="inline-block w-3 h-3 rounded-full bg-red-500"
                                                    role="img"
                                                    aria-label="Incomplete"
                                                    title="Incomplete"
                                                />
                                            )}
                                        </p>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm mt-3">No results found.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default NewDashboard