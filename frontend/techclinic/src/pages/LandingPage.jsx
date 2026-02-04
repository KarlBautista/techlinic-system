import RegistrationInfo from '../components/registrationInfo';
import Dropdown from '../components/Dropdown'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useData from '../store/useDataStore'
import Swal from 'sweetalert2'
import Doctor from '../assets/componentImage/doctor.jpg'

// Constants
const INITIAL_FORM_DATA = {
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
};

const YEAR_OPTIONS = ['1st year', '2nd year', '3rd year', '4th year'];
const DEPARTMENT_OPTIONS = [
    "College of Science",
    "College of Engineering",
    "College of Industrial Technology",
    "College of Architecture and Fine Arts",
    "College of Industrial Education",
    "College of Liberal Arts"
];
const SEX_OPTIONS = ['Male', 'Female'];
const PRIMARY_COLOR = "#B22222";
const REQUIRED_FIELDS = ['studentId', 'firstName', 'lastName', 'contactNumber', 'yearLevel', 'department', 'sex', 'email', 'address', 'dateOfBirth'];

function LandingPage() {
    const navigate = useNavigate();
    const { insertRecord, getRecords, getRecordsFromExistingPatient } = useData();

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isStudentConfirmed, setIsStudentConfirmed] = useState(false);

    // Format date from various formats to MM/DD/YY
    const formatDateToMMDDYY = (dateString) => {
        if (!dateString) return '';

        let datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;

        // Handle YYYY-MM-DD format
        if (datePart.includes('-')) {
            const [year, month, day] = datePart.split('-');
            return `${month}/${day}/${year}`;
        }

        // Handle MM/DD/YYYY format - already in correct format
        return datePart;
    };

    // Convert date to HTML input format (YYYY-MM-DD)
    const convertToInputFormat = (dateString) => {
        if (!dateString) return '';

        // Already in correct format
        if (dateString.includes('-') && !dateString.includes('/')) {
            return dateString;
        }

        // Convert from MM/DD/YYYY to YYYY-MM-DD
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const [month, day, year] = parts;
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }

        return dateString;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'studentId') {
            const validatedValue = value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
            setFormData((prev) => ({ ...prev, [name]: validatedValue }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStudentIdBlur = async () => {
        if (!formData.studentId.trim()) {
            return;
        }

        try {
            const response = await getRecordsFromExistingPatient(formData.studentId);

            if (response.success && response.data && response.data.length > 0) {
                const studentData = response.data[0];

                Swal.fire({
                    title: "Confirm Identity",
                    text: `Are you ${studentData.first_name} ${studentData.last_name}?`,
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Yes, that's me",
                    cancelButtonText: "No, enter manually",
                    confirmButtonColor: "#CB2727"
                }).then((result) => {
                    if (result.isConfirmed) {
                        const formattedDate = formatDateToMMDDYY(studentData.date_of_birth);
                        const inputDate = convertToInputFormat(formattedDate);

                        setFormData((prev) => ({
                            ...prev,
                            firstName: studentData.first_name || prev.firstName,
                            lastName: studentData.last_name || prev.lastName,
                            contactNumber: studentData.contact_number || prev.contactNumber,
                            yearLevel: studentData.year_level || prev.yearLevel,
                            department: studentData.department || prev.department,
                            sex: studentData.sex || prev.sex,
                            email: studentData.email || prev.email,
                            address: studentData.address || prev.address,
                            dateOfBirth: inputDate || prev.dateOfBirth,
                        }));

                        setIsStudentConfirmed(true);

                        Swal.fire({
                            title: "Success",
                            text: `Information for ${studentData.first_name} ${studentData.last_name} loaded successfully`,
                            icon: "success",
                            timer: 2000,
                        });
                    }
                });
            }
        } catch (err) {
            console.error("Error searching for student:", err);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.studentId || !formData.firstName || !formData.lastName || !formData.contactNumber ||
            !formData.yearLevel || !formData.department || !formData.sex || !formData.email ||
            !formData.address || !formData.dateOfBirth) {
            Swal.fire({
                title: "Incomplete Form",
                text: "Please fill out all required fields before submitting.",
                icon: "warning"
            });
            return;
        }

        const displayDate = formatDateToMMDDYY(formData.dateOfBirth);
        const confirmationHTML = `
            <div style="text-align: left; font-size: 0.9rem; ">
                <p><strong>Student ID:</strong> ${formData.studentId}</p>
                <p><strong>First Name:</strong> ${formData.firstName}</p>
                <p><strong>Last Name:</strong> ${formData.lastName}</p>
                <p><strong>Contact Number:</strong> ${formData.contactNumber}</p>
                <p><strong>Year Level:</strong> ${formData.yearLevel}</p>
                <p><strong>Department:</strong> ${formData.department}</p>
                <p><strong>Sex:</strong> ${formData.sex}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>Address:</strong> ${formData.address}</p>
                <p><strong>Date of Birth:</strong> ${displayDate}</p>
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
                    const dataToSubmit = {
                        ...formData,
                        dateOfBirth: formatDateToMMDDYY(formData.dateOfBirth)
                    };
                    const response = await insertRecord(dataToSubmit);
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
                        setFormData(INITIAL_FORM_DATA);
                        setIsStudentConfirmed(false);

                        Swal.fire({
                            title: "Record Inserted Successfully",
                            icon: "success",
                            timer: 2000,
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
        Swal.fire({
            title: "Clinic Personnel Confirmation",
            text: "This page is for clinic personnel only. Are you a clinic personnel?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            confirmButtonColor: "#CB2727"
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/login')
            }
        });
    }

    const handleClear = () => {
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
        setIsStudentConfirmed(false);
    }

    return (
        <>
            <div className='h-screen flex justify-center items-center'>
                <div className='h-full w-full hidden lg:flex'>
                    <div className='w-[30%] bg-fuchsia-200 h-full'>
                        <img src={Doctor} alt="" className='h-full w-full' />
                    </div>
                    <div className='w-[70%]  h-full flex items-center justify-center'>
                        <div className=' flex flex-col w-[80%]  gap-3 '>
                            <div className='flex flex-col'>
                                <p className='text-[1.2rem] font-medium'>Fill out your information</p>
                                <p className='text-[.9rem]'>Kindly provide the necessary details before continuing.</p>
                            </div>

                            <div className='border border-[#b8b8b8] rounded-[10px]  '>
                                <div className='flex gap-5 p-5 items-center justify-center'>
                                    <div className='w-[50%] flex flex-col gap-2'>
                                        <RegistrationInfo message={'Student Id'} name='studentId' value={formData.studentId} onChange={handleInputChange} onBlur={handleStudentIdBlur} disabled={isStudentConfirmed} />
                                        <RegistrationInfo message={'Last name'} name='lastName' value={formData.lastName} onChange={handleInputChange} disabled={isStudentConfirmed} />
                                        <RegistrationInfo message={'First name'} name='firstName' value={formData.firstName} onChange={handleInputChange} disabled={isStudentConfirmed} />
                                        <RegistrationInfo message={'Contact number'} name='contactNumber' value={formData.contactNumber} onChange={handleInputChange} disabled={isStudentConfirmed} />
                                        <Dropdown name='yearLevel' options={['1st year', '2nd year', '3rd year', '4th year']} placeholder='Select year' value={formData.yearLevel} onChange={handleInputChange} disabled={isStudentConfirmed} />
                                    </div>
                                    <div className='w-[50%] flex flex-col gap-2'>
                                        <Dropdown name='department' options={["College of Science", "College of Engineering", "College of Industrial Technology", "College of Architecture and Fine Arts", "College of Industrial Education", "College of Liberal Arts"]} placeholder='Select department' value={formData.department} onChange={handleInputChange} disabled={isStudentConfirmed} />
                                        <Dropdown name='sex' options={['Male', 'Female']} placeholder='Sex' value={formData.sex} onChange={handleInputChange} disabled={isStudentConfirmed} />
                                        <RegistrationInfo message={'Email'} name='email' value={formData.email} onChange={handleInputChange} disabled={isStudentConfirmed} />
                                        <RegistrationInfo message={'Address'} name='address' value={formData.address} onChange={handleInputChange} disabled={isStudentConfirmed} />
                                        <RegistrationInfo type='date' message={'Date of Birth'} name='dateOfBirth' value={formData.dateOfBirth} onChange={handleInputChange} disabled={isStudentConfirmed} labelPosition='right' />
                                    </div>
                                </div>
                                <div className='flex gap-2 justify-end p-3'>
                                    <p className='text-[.9rem] tracking-[2px]'
                                        onClick={handleClear}
                                    >
                                        Clear all.
                                    </p>
                                </div>
                            </div>

                            <div className=' flex justify-between p-2 text-[.9rem]'>
                                <button className='py-2 px-15 tracking-[2px]  bg-[#B22222] text-white'
                                    onClick={handleFormSubmit}
                                >
                                    Submit
                                </button>
                                <button className='py-2 px-15 tracking-[2px] border border-[#B22222] text-[#B22222]'
                                    onClick={handleLog}
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='h-full w-full sm:w-[80%] lg:hidden flex flex-col items-center justify-center gap-3'>
                    <div className='h-[15%] w-[85%] flex flex-col items-center justify-center'>
                        <p className='text-[1rem] font-medium'>Fill out your information</p>
                        <p className='text-[.6rem]'>Kindly provide the necessary details before continuing.</p>
                    </div>
                    <div className='w-[90%] p-5 overflow-auto flex flex-col gap-2 border rounded-[10px]'>
                        <RegistrationInfo message={'Student Id'} name='studentId' value={formData.studentId} onChange={handleInputChange} onBlur={handleStudentIdBlur} disabled={isStudentConfirmed} />
                        <RegistrationInfo message={'Last name'} name='lastName' value={formData.lastName} onChange={handleInputChange} disabled={isStudentConfirmed} />
                        <RegistrationInfo message={'First name'} name='firstName' value={formData.firstName} onChange={handleInputChange} disabled={isStudentConfirmed} />
                        <RegistrationInfo message={'Contact number'} name='contactNumber' value={formData.contactNumber} onChange={handleInputChange} disabled={isStudentConfirmed} />
                        <Dropdown name='yearLevel' options={['1st year', '2nd year', '3rd year', '4th year']} placeholder='Select year' value={formData.yearLevel} onChange={handleInputChange} disabled={isStudentConfirmed} />
                        <Dropdown name='department' options={["College of Science", "College of Engineering", "College of Industrial Technology", "College of Architecture and Fine Arts", "College of Industrial Education", "College of Liberal Arts"]} placeholder='Select department' value={formData.department} onChange={handleInputChange} disabled={isStudentConfirmed} />
                        <Dropdown name='sex' options={['Male', 'Female']} placeholder='Sex' value={formData.sex} onChange={handleInputChange} disabled={isStudentConfirmed} />
                        <RegistrationInfo message={'Email'} name='email' value={formData.email} onChange={handleInputChange} disabled={isStudentConfirmed} />
                        <RegistrationInfo message={'Address'} name='address' value={formData.address} onChange={handleInputChange} disabled={isStudentConfirmed} />
                        <RegistrationInfo type='date' message={'Date of Birth'} name='dateOfBirth' value={formData.dateOfBirth} onChange={handleInputChange} disabled={isStudentConfirmed} labelPosition='right' />

                        <div className='flex gap-2 justify-end p-3'>
                            <p className='text-[.9rem] tracking-[2px]'
                                onClick={handleClear}
                            >
                                Clear all.
                            </p>
                        </div>
                    </div>

                    <div className='h-[15%] w-[85%] items-center  flex justify-between text-[.9rem]'>
                        <button className='py-1 px-7 tracking-[2px]  bg-[#B22222] text-white'
                            onClick={handleFormSubmit}
                        >
                            Submit
                        </button>
                        <button className='py-1 px-7 tracking-[2px] border border-[#B22222] text-[#B22222]'
                            onClick={handleLog}
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LandingPage;