import { create } from "zustand";
import axios from "axios";
const useMedicine = create((set) => ({
    medicines: null,
    insertMedicine: async (medicine) => {
        try {
            const response = await axios.post("http://localhost:3000/api/insert-medicine", {
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
            const response = await axios.get("http://localhost:3000/api/get-medicines");
            if(response.status === 200) {
                set({ medicines: response.data.data });
                return;
            } else {
                console.error(`Error getting medicines: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting medicines: ${err.message}`);
            return;
        }
    }
}))


export default useMedicine;