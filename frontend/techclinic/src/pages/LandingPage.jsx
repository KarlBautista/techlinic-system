import Logo from '../assets/image/TUP.png'
import RegistrationInfo from '../components/registrationInfo';
import Dropdown from '../components/Dropdown'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useData from '../store/useDataStore'
import useAuth from '../store/useAuthStore'
import Swal from 'sweetalert2'
import Doctor from '../assets/componentImage/doctor.jpg'

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
           <div className='flex h-screen'>
                <div className='w-[25%] bg-fuchsia-200 h-full'>
                    <img src={Doctor} alt=""  className='h-full'/>
                </div>
                <div className='w-[75%] bg-fuchsia-300 h-full flex items-center justify-center'>
                    <div className='h-[80%] flex flex-col w-[80%] bg-white'>
                        <div className='flex flex-col'>
                            <p className='text-[1.2rem] font-medium'>Fill out your information</p>
                            <p className='text-[.9rem]'>Kindly provide the necessary details before continuing.</p>
                        </div>

                        <div>
                            
                        </div>
                    </div>
                </div>
           </div>
        </>
    )
}

export default LandingPage;