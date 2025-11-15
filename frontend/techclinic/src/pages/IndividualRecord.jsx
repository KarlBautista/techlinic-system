import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios';
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
    <div>
      
    </div>
  )
}

export default IndividualRecord