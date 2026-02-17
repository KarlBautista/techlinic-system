import { create } from "zustand";
import api from "../lib/api";
const useChart = create((set) => ({
    weeklyPatientCount: null,
    monthlyPatientCount: null,
    quarterlyPatientCount: null,
    yearlyPatientCount: null,
    weeklyPatientPerDepartment: null,
    monthlyPatientPerDepartment: null,
    quarterlyPatientPerDepartment:null,
    yearlyPatientPerDepartment: null,
    weeklyTopDiagnoses: null,
    monthlyTopDiagnoses: null,
    quarterlyTopDiagnoses: null,
    yearlyTopDiagnoses: null,

    getWeeklyPatientCount: async () => {
        try {
            const response = await api.get("/get-weekly-patients");
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
            const response = await api.get("/get-monthly-patients");
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
            const response = await api.get("/get-quarterly-patients");
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
    },
    getYearlyPatientCount: async () => {
        try {
            const response = await api.get("/get-yearly-patients");
            if(response.status === 200) {
                set({ yearlyPatientCount: response.data });
            } else {
                console.error(`Error getting quarterly patients: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting yearly patients: ${err.message}`);
            return;
        }
    },

    getWeeklyPatientPerDepartmentCount: async () => {
        try {
            const response = await api.get("/get-weekly-patients-per-department");
            if(response.status === 200) {
                set({ weeklyPatientPerDepartment: response.data });
            } else {
                console.error(`Error getting quarterly patients: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting weekly patients per department: ${err.message}`);
            return;
        }
    },

     getMonthlyPatientPerDepartmentCount: async () => {
        try {
            const response = await api.get("/get-monthly-patients-per-department");
            if(response.status === 200) {
                set({ monthlyPatientPerDepartment: response.data });
            } else {
                console.error(`Error getting monthly patients per department: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting monthly patients per department: ${err.message}`);
            return;
        }
    },

     getQuarterlyPatientPerDepartmentCount: async () => {
        try {
            const response = await api.get("/get-quarterly-patients-per-department");
            if(response.status === 200) {
                set({ quarterlyPatientPerDepartment: response.data });
            } else {
                console.error(`Error getting quarterly patients per department: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting quarterly patients per department: ${err.message}`);
            return;
        }
    },

     getYearlyPatientPerDepartmentCount: async () => {
        try {
            const response = await api.get("/get-yearly-patients-per-department");
            if(response.status === 200) {
                set({ yearlyPatientPerDepartment: response.data });
            } else {
                console.error(`Error getting yearly patients per department: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting yearly patients per department: ${err.message}`);
            return;
        }
    },

    getWeeklyTopDiagnoses: async () => {
        try {
            const response = await api.get("/get-weekly-top-diagnoses");
            if(response.status === 200) {
                set({ weeklyTopDiagnoses: response.data.data });
            } else {
                console.error(`Error getting weekly top diagnoses: ${response.data.error}`);
            }
        } catch (err) {
            console.error(`Something went wrong getting weekly top diagnoses: ${err.message}`);
            return;
        }
    },

    getMonthlyTopDiagnoses: async () => {
        try {
            const response = await api.get("/get-monthly-top-diagnoses");
            if(response.status === 200) {
                set({ monthlyTopDiagnoses: response.data.data });
            } else {
                console.error(`Error getting monthly top diagnoses: ${response.data.error}`);
            }
        } catch (err) {
            console.error(`Something went wrong getting monthly top diagnoses: ${err.message}`);
            return;
        }
    },

    getQuarterlyTopDiagnoses: async () => {
        try {
            const response = await api.get("/get-quarterly-top-diagnoses");
            if(response.status === 200) {
                set({ quarterlyTopDiagnoses: response.data.data });
            } else {
                console.error(`Error getting quarterly top diagnoses: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting quarterly top diagnoses: ${err.message}`);
            return;
        }
    },

    getYearlyTopDiagnoses: async () => {
        try {
            const response = await api.get("/get-yearly-top-diagnoses");
            if(response.status === 200) {
                set({ yearlyTopDiagnoses: response.data.data });
            } else {
                console.error(`Error getting yearly top diagnoses: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting yearly top diagnoses: ${err.message}`);
            return;
        }
    },

}))

export default useChart;