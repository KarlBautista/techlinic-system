import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios';
import Navigation from '../components/Navigation';
const IndividualRecord = () => {
  const { patientId } = useParams();
  const [ patientRecord, setPatientRecord ] = useState([]);
  {/*meaning lang nito mag fefetch ng data kapag may pumasok na patientId sa page na to*/}
  useEffect(() => {
    const fetchData = async () => {
      try {
         const response = await axios.get(`http://localhost:3000/api/get-record/${patientId}`);
        
         if (response.status !== 200) {
           console.error(`Error getting record: HTTP ${response.status}`);
           return;
         }
     
         setPatientRecord(response.data.data);
      } catch (err) {
        console.error(`Something went wrong getting record: ${err?.message}`);
        return;
      }
    }
    fetchData();
  }, [patientId]);
  console.log("ito data ng patient: ", patientRecord)
  {/*may data na tong naka abang, lagyan nalang ui tapos display*/}

  return (
    <div className='flex h-full w-full gap-2'>
      <div className='sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[17%]'>
          <Navigation />
      </div>
      
      <div className='w-[83%] h-full justify-center p-5'>
        
      </div>
    </div>
  )
}

export default IndividualRecord