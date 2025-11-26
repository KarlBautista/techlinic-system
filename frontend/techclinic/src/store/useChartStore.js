import { create } from "zustand";
import axios from "axios";
const useChart = create((set) => ({
    weeklyPatientCount: null,
    monthlyPatientCount: null,
    quarterlyPatientCount: null,
    getWeeklyPatientCount: async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/get-weekly-patients");
            if(response.status === 200) {
                set({ weeklyPatientCount: response.data });
            } else {
                console.error(`Error getting weekly patient count: ${response.data.error}`)
            }
        } catch (err) {
            console.error(`Something went wrong getting weekly patient count: ${err.message}`);
            return;
        }
    },
    getMonthlyPatientsCount: async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/get-monthly-patients");
            if(response.status === 200) {
                set({ monthlyPatientCount: response.data.data });
            } else {
                console.error(`Error getting monthly patients: ${response.data.erorr }`)
            }
        } catch (err) {
            console.error(`Something went wrong getting the monthly patients: ${err.message}`);
            return;
        }
    },
    getQuarterlyPatientsCount: async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/get-quarterly-patients");
            if(response.status === 200) {
                set({ quarterlyPatientCount: response.data });
            } else {
                console.error(`Error getting quarterly patients: ${response.data.error }`);
                return;
            }
        } catch (err) {
                console.error(`Something went wrong getting quarterly patients: ${err.message}`);
                return;
        }
    }
}))

export default useChart;