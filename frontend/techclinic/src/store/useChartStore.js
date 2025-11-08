import { create } from "zustand";
//Basta dito muna dadaan lahat ng data bago gumawa ng chart para real-time pagbago.
//papasa ng zustand file na to yung data sa mga component na mangangailangan ng data.
const useChart = create((set) => ({
    patientStats: [],
    medicineStats: [],
    setPatientsStats: (data) => set({ patientStats: data }),
    medicineStats: (data) => set({ medicineStats: data }),
}))

export default useChart;