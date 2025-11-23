import { create } from "zustand";
import axios from "axios";
const useChart = create((set) => ({
    weeklyPatientCount: null,
    getWeeklyPatientCount: async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/get-weekly-patients");
            if(response.status === 200) {
                set({ weeklyPatientCount: response.data.data });
            } else {
                console.error(`Error getting weekly patient count: ${response.data.error}`)
            }
        } catch (err) {
            console.error(`Something went wrong getting weekly patient count: ${err.message}`);
        }
    } 
}))

export default useChart;