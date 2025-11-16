import { create } from "zustand";
import  axios  from "axios";
const useData = create((set) => ({
    patientRecords: null,
    insertRecord: async (formData) => {
        try {
            const response = await axios.post("http://localhost:3000/api/insert-record", {
                formData
            });

            const payload = response.data;
            if (!payload) {
                return { success: false, error: 'No response data from server' };
            }

            if (payload.success === false) {
                return { success: false, error: payload.error || 'Insert failed' };
            }

            return { success: true, data: payload.data };

        } catch (err){
            const serverMessage = err?.response?.data?.error || err?.message || 'Unknown error';
            console.error(`Error Inserting Record: ${serverMessage}`)
            return { success: false, error: serverMessage }
        }
    },
    getRecords: async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/get-records");
            if(response.error){
                console.error(`Error getting records: ${response.error}`);
                return { success: false, error: response.error }
            }
            if(response.data){
                set({ patientRecords: response.data });
                return { success: true };
            }
        } catch (err) {
            console.error(`Error getting records: ${err.message}`);
            return { success: false, error: err.message };
        }
    }
    
}));

export default useData;