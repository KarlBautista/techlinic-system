import { create } from "zustand";
import api from "../lib/api";
const useMedicine = create((set) => ({
    medicines: null,
    isLoading: false,
    insertMedicine: async (medicine) => {
        try {
            const response = await api.post("/insert-medicine", {
                medicine
            });
           if(response.status === 200) {
            console.log('Success getting medicines');
            set({ medicines: response.data.data });
            return { success: true };
           } else {
            console.error(`error getting medicine: ${response.data.error}`);
            return { success: false };
           }
        } catch (err) {
            console.error(`Something went wrong inserting medicine: ${err.message}`);
            return { success: false };
        }
    },
    getMedicines: async () => {
        try {
            set({ isLoading: true });
            const response = await api.get("/get-medicines");
            if(response.status === 200) {
                set({ medicines: response.data.data, isLoading: false });
                return;
            } else {
                console.error(`Error getting medicines: ${response.data.error}`);
                set({ isLoading: false });
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting medicines: ${err.message}`);
            set({ isLoading: false });
            return;
        }
    },
    updateMedicine: async (medicine) => {
        try {
            const response = await api.put("/update-medicine", {
                medicine
            });
            if(response.status === 200) {
                return { success: true };
            } else {
                return { success: false, error: response.data.error }
            }
        } catch (err) {
            console.error(`Something went wrong updating medicine: ${err.message}`);
            return { success: false, error: err.message };
        }
    },
    deleteMedicine: async (medicineId) => {
        try {
            const response = await api.delete(`/delete-medicine/${medicineId}`);
            if(response.status === 200) {
                return { success: true };
            } else {
                console.error(`Error Deleting Medicine: ${response.data.error}`);
                return { success: false, error: response.data.error };
            }
        } catch (err) {
            console.error(`Something went wrong deleting medicine: ${err.message}`);
            return { success: false, error: response.data.error };
        }
    }
}))


export default useMedicine;