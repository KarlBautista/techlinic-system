import { create } from "zustand";
import api from "../lib/api";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const isCacheValid = (timestamp) => {
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_TTL;
};

const useChart = create((set, get) => ({
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

    // Cache timestamps
    _ts: {},

    getWeeklyPatientCount: async (force = false) => {
        if (!force && isCacheValid(get()._ts.weeklyPatientCount) && get().weeklyPatientCount !== null) return;
        try {
            const response = await api.get("/get-weekly-patients");
            if(response.status === 200) {
                set(s => ({ weeklyPatientCount: response.data, _ts: { ...s._ts, weeklyPatientCount: Date.now() } }));
            } else {
                console.error(`Error getting weekly patient count: ${response.data.error}`)
            }
        } catch (err) {
            console.error(`Something went wrong getting weekly patient count: ${err.message}`);
            return;
        }
    },
    getMonthlyPatientsCount: async (force = false) => {
        if (!force && isCacheValid(get()._ts.monthlyPatientCount) && get().monthlyPatientCount !== null) return;
        try {
            const response = await api.get("/get-monthly-patients");
            if(response.status === 200) {
                set(s => ({ monthlyPatientCount: response.data.data, _ts: { ...s._ts, monthlyPatientCount: Date.now() } }));
            } else {
                console.error(`Error getting monthly patients: ${response.data.erorr }`)
            }
        } catch (err) {
            console.error(`Something went wrong getting the monthly patients: ${err.message}`);
            return;
        }
    },
    getQuarterlyPatientsCount: async (force = false) => {
        if (!force && isCacheValid(get()._ts.quarterlyPatientCount) && get().quarterlyPatientCount !== null) return;
        try {
            const response = await api.get("/get-quarterly-patients");
            if(response.status === 200) {
                set(s => ({ quarterlyPatientCount: response.data, _ts: { ...s._ts, quarterlyPatientCount: Date.now() } }));
            } else {
                console.error(`Error getting quarterly patients: ${response.data.error }`);
                return;
            }
        } catch (err) {
                console.error(`Something went wrong getting quarterly patients: ${err.message}`);
                return;
        }
    },
    getYearlyPatientCount: async (force = false) => {
        if (!force && isCacheValid(get()._ts.yearlyPatientCount) && get().yearlyPatientCount !== null) return;
        try {
            const response = await api.get("/get-yearly-patients");
            if(response.status === 200) {
                set(s => ({ yearlyPatientCount: response.data, _ts: { ...s._ts, yearlyPatientCount: Date.now() } }));
            } else {
                console.error(`Error getting quarterly patients: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting yearly patients: ${err.message}`);
            return;
        }
    },

    getWeeklyPatientPerDepartmentCount: async (force = false) => {
        if (!force && isCacheValid(get()._ts.weeklyPatientPerDepartment) && get().weeklyPatientPerDepartment !== null) return;
        try {
            const response = await api.get("/get-weekly-patients-per-department");
            if(response.status === 200) {
                set(s => ({ weeklyPatientPerDepartment: response.data, _ts: { ...s._ts, weeklyPatientPerDepartment: Date.now() } }));
            } else {
                console.error(`Error getting quarterly patients: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting weekly patients per department: ${err.message}`);
            return;
        }
    },

     getMonthlyPatientPerDepartmentCount: async (force = false) => {
        if (!force && isCacheValid(get()._ts.monthlyPatientPerDepartment) && get().monthlyPatientPerDepartment !== null) return;
        try {
            const response = await api.get("/get-monthly-patients-per-department");
            if(response.status === 200) {
                set(s => ({ monthlyPatientPerDepartment: response.data, _ts: { ...s._ts, monthlyPatientPerDepartment: Date.now() } }));
            } else {
                console.error(`Error getting monthly patients per department: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting monthly patients per department: ${err.message}`);
            return;
        }
    },

     getQuarterlyPatientPerDepartmentCount: async (force = false) => {
        if (!force && isCacheValid(get()._ts.quarterlyPatientPerDepartment) && get().quarterlyPatientPerDepartment !== null) return;
        try {
            const response = await api.get("/get-quarterly-patients-per-department");
            if(response.status === 200) {
                set(s => ({ quarterlyPatientPerDepartment: response.data, _ts: { ...s._ts, quarterlyPatientPerDepartment: Date.now() } }));
            } else {
                console.error(`Error getting quarterly patients per department: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting quarterly patients per department: ${err.message}`);
            return;
        }
    },

     getYearlyPatientPerDepartmentCount: async (force = false) => {
        if (!force && isCacheValid(get()._ts.yearlyPatientPerDepartment) && get().yearlyPatientPerDepartment !== null) return;
        try {
            const response = await api.get("/get-yearly-patients-per-department");
            if(response.status === 200) {
                set(s => ({ yearlyPatientPerDepartment: response.data, _ts: { ...s._ts, yearlyPatientPerDepartment: Date.now() } }));
            } else {
                console.error(`Error getting yearly patients per department: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting yearly patients per department: ${err.message}`);
            return;
        }
    },

    getWeeklyTopDiagnoses: async (force = false) => {
        if (!force && isCacheValid(get()._ts.weeklyTopDiagnoses) && get().weeklyTopDiagnoses !== null) return;
        try {
            const response = await api.get("/get-weekly-top-diagnoses");
            if(response.status === 200) {
                set(s => ({ weeklyTopDiagnoses: response.data.data, _ts: { ...s._ts, weeklyTopDiagnoses: Date.now() } }));
            } else {
                console.error(`Error getting weekly top diagnoses: ${response.data.error}`);
            }
        } catch (err) {
            console.error(`Something went wrong getting weekly top diagnoses: ${err.message}`);
            return;
        }
    },

    getMonthlyTopDiagnoses: async (force = false) => {
        if (!force && isCacheValid(get()._ts.monthlyTopDiagnoses) && get().monthlyTopDiagnoses !== null) return;
        try {
            const response = await api.get("/get-monthly-top-diagnoses");
            if(response.status === 200) {
                set(s => ({ monthlyTopDiagnoses: response.data.data, _ts: { ...s._ts, monthlyTopDiagnoses: Date.now() } }));
            } else {
                console.error(`Error getting monthly top diagnoses: ${response.data.error}`);
            }
        } catch (err) {
            console.error(`Something went wrong getting monthly top diagnoses: ${err.message}`);
            return;
        }
    },

    getQuarterlyTopDiagnoses: async (force = false) => {
        if (!force && isCacheValid(get()._ts.quarterlyTopDiagnoses) && get().quarterlyTopDiagnoses !== null) return;
        try {
            const response = await api.get("/get-quarterly-top-diagnoses");
            if(response.status === 200) {
                set(s => ({ quarterlyTopDiagnoses: response.data.data, _ts: { ...s._ts, quarterlyTopDiagnoses: Date.now() } }));
            } else {
                console.error(`Error getting quarterly top diagnoses: ${response.data.error}`);
                return;
            }
        } catch (err) {
            console.error(`Something went wrong getting quarterly top diagnoses: ${err.message}`);
            return;
        }
    },

    getYearlyTopDiagnoses: async (force = false) => {
        if (!force && isCacheValid(get()._ts.yearlyTopDiagnoses) && get().yearlyTopDiagnoses !== null) return;
        try {
            const response = await api.get("/get-yearly-top-diagnoses");
            if(response.status === 200) {
                set(s => ({ yearlyTopDiagnoses: response.data.data, _ts: { ...s._ts, yearlyTopDiagnoses: Date.now() } }));
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