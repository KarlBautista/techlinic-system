import Logo from '../assets/image/TUP.png'
import RegistrationInfo from '../components/registrationInfo';
import Dropdown from '../components/Dropdown'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useData from '../store/useDataStore'
import useAuth from '../store/useAuthStore'
import Swal from 'sweetalert2'

function LandingPage() {
    const navigate = useNavigate();
    const { insertRecord, getRecords } = useData();
    const { authenticatedUser } = useAuth();

    const [formData, setFormData] = useState({
        studentId: '',
        firstName: '',
        lastName: '',
        contactNumber: '',
        yearLevel: '',
        department: '',
        sex: '',
        email: '',
        address: '',
        dateOfBirth: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Show confirmation dialog with data
        const confirmationHTML = `
            <div style="text-align: left; font-size: gap-2: 0.9rem; ">
                <p><strong>Student ID:</strong> ${formData.studentId}</p>
                <p><strong>First Name:</strong> ${formData.firstName}</p>
                <p><strong>Last Name:</strong> ${formData.lastName}</p>
                <p><strong>Contact Number:</strong> ${formData.contactNumber}</p>
                <p><strong>Year Level:</strong> ${formData.yearLevel}</p>
                <p><strong>Department:</strong> ${formData.department}</p>
                <p><strong>Sex:</strong> ${formData.sex}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>Address:</strong> ${formData.address}</p>
                <p><strong>Date of Birth:</strong> ${formData.dateOfBirth}</p>
            </div>
        `;

        Swal.fire({
            title: "Confirm Patient Information",
            html: confirmationHTML,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Submit",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#CB2727"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await insertRecord(formData);
                    if (!response.success) {
                        const msg = response.error || 'Failed inserting record';
                        const lower = String(msg).toLowerCase();
                        if (lower.includes('unique') || lower.includes('duplicate') || lower.includes('already exists') || lower.includes('student_id') || lower.includes('student id')) {
                            Swal.fire({
                                title: "Student Already Exist",
                                text: "A patient with this Student ID already exists. Please check the Student ID.",
                                showConfirmButton: true,
                                icon: "warning"
                            })
                        } else {
                            Swal.fire({
                                title: "Something went wrong",
                                text: msg,
                                icon: "error"
                            })
                        }
                        return;
                    } else {
                        Swal.fire({
                            title: "Record Inserted Successfully",
                            icon: "success",
                            timer: 2000,
                        })
                        setFormData({
                            studentId: '',
                            firstName: '',
                            lastName: '',
                            contactNumber: '',
                            yearLevel: '',
                            department: '',
                            sex: '',
                            email: '',
                            address: '',
                            dateOfBirth: ''
                        });
                        getRecords();
                    }
                } catch (err) {
                    console.error(err);
                    Swal.fire({
                        title: "Error",
                        text: "An error occurred while submitting the form",
                        icon: "error"
                    })
                }
            }
        });
    };

    const handleLog = () => {
        navigate('/login')
    }

    return (
        <>
            <div className="h-screen w-screen min-w-[360px] flex flex-col justify-evenly md:items-center lg:justify-between">
                <div className="w-full h-[10%] flex  p-2">
                    <div className="w-[50%] h-full">
                        <div className='h-full flex items-center gap-1'>
                            <img src={Logo} alt="" className='h-full' />
                            <div className='flex flex-col'>
                                <p className='text-[1.1rem] font-bold tracking-[2px]'>TechClinic</p>
                                <p className='text-[.6rem]'>Electronic Medical System</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-[50%] h-full flex items-center justify-end">
                        <button className="py-2 px-6 bg-[#626262] text-white text-[.8rem] rounded-[10px]"
                            onClick={handleLog}
                        >Login</button>
                    </div>
                </div>
                <div className="w-full h-[85%] px-10 py-1 flex flex-col gap-2 text-center md:w-[85%] lg:hidden">
                    <p className='text-[1.2rem] font-bold tracking-[2px]'>Personal Information</p>
                    <form onSubmit={handleFormSubmit} className='h-full w-full flex flex-col gap-2 p-2 overflow-auto'>
                        <RegistrationInfo message={'Student Id'} name='studentId' value={formData.studentId} onChange={handleInputChange} />
                        <RegistrationInfo message={'Last name'} name='lastName' value={formData.lastName} onChange={handleInputChange} />
                        <RegistrationInfo message={'First name'} name='firstName' value={formData.firstName} onChange={handleInputChange} />
                        <RegistrationInfo message={'Contact number'} name='contactNumber' value={formData.contactNumber} onChange={handleInputChange} />
                        <Dropdown name='yearLevel' options={['1st year', '2nd year', '3rd year', '4th year']} placeholder='Select year' value={formData.yearLevel} onChange={handleInputChange} />
                        <Dropdown name='department' options={["College of Science", "College of Engineering", "College of Industrial Technology", "College of Architecture and Fine Arts", "College of Industrial Education", "College of Liberal Arts"]} placeholder='Select department' value={formData.department} onChange={handleInputChange} />
                        <Dropdown name='sex' options={['Male', 'Female']} placeholder='Sex' value={formData.sex} onChange={handleInputChange} />
                        <RegistrationInfo message={'Email'} name='email' value={formData.email} onChange={handleInputChange} />
                        <RegistrationInfo message={'Address'} name='address' value={formData.address} onChange={handleInputChange} />
                        <RegistrationInfo message={'Date of Birth'} type='date' name='dateOfBirth' value={formData.dateOfBirth} onChange={handleInputChange} />

                        <button type='submit' className='w-full py-3 bg-[#CB2727] text-white tracking-[2px]  text-[.9rem] rounded-[10px]'>Confirm</button>
                    </form>
                </div>

                <div className='hidden lg:flex flex-col h-[85%] w-full items-center'>
                    <div className='w-full  text-center'>
                        <p className='text-[1.2rem] font-bold tracking-[2px]'>
                            Personal Information
                        </p>
                    </div>

                    <form onSubmit={handleFormSubmit} className=' flex justify-center w-full gap-3 '>
                        <div className='w-[40%] h-[95%] flex flex-col gap-2 p-2'>
                            <RegistrationInfo message={'Student Id'} name='studentId' value={formData.studentId} onChange={handleInputChange} />
                            <RegistrationInfo message={'Last name'} name='lastName' value={formData.lastName} onChange={handleInputChange} />
                            <RegistrationInfo message={'First name'} name='firstName' value={formData.firstName} onChange={handleInputChange} />
                            <RegistrationInfo message={'Contact number'} name='contactNumber' value={formData.contactNumber} onChange={handleInputChange} />
                            <Dropdown name='yearLevel' options={['1st year', '2nd year', '3rd year', '4th year']} placeholder='Select year' value={formData.yearLevel} onChange={handleInputChange} />
                        </div>
                        <div className='w-[40%]  flex flex-col gap-2 p-2'>
                            <Dropdown name='department' options={["College of Science", "College of Engineering", "College of Industrial Technology", "College of Architecture and Fine Arts", "College of Industrial Education", "College of Liberal Arts"]} placeholder='Select department' value={formData.department} onChange={handleInputChange} />
                            <Dropdown name='sex' options={['Male', 'Female']} placeholder='Sex' value={formData.sex} onChange={handleInputChange} />
                            <RegistrationInfo message={'Email'} name='email' value={formData.email} onChange={handleInputChange} />
                            <RegistrationInfo message={'Address'} name='address' value={formData.address} onChange={handleInputChange} />
                            <RegistrationInfo message={'Date of Birth'} type='date' name='dateOfBirth' value={formData.dateOfBirth} onChange={handleInputChange} />
                        </div>
                    </form>

                    <div>
                        <button onClick={handleFormSubmit} className='px-20 py-3 bg-[#CB2727] text-white tracking-[2px]  text-[.9rem] rounded-[10px]'>Confirm</button>
                    </div>
                </div>



            </div>
        </>
    )
}

export default LandingPage;