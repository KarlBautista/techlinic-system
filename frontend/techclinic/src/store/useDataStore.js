import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const useData = create(
    persist(
        (set, get) => ({
            patientRecords: null,
            patientsData: null,
            isLoadingRecords: false,
            isLoadingPatients: false,
            
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

                    console.log('✅ Record inserted successfully');
                    await get().getRecords();

                    return { success: true, data: payload.data };

                } catch (err) {
                    const serverMessage = err?.response?.data?.error || err?.message || 'Unknown error';
                    console.error(`Error Inserting Record: ${serverMessage}`);
                    return { success: false, error: serverMessage };
                }
            },
            
            getRecords: async () => {
                if (get().isLoadingRecords) {
                    console.log("⏳ Already loading records, skipping...");
                    return { success: false, error: "Already loading" };
                }

                try {
                    set({ isLoadingRecords: true });
                    console.log("📊 Fetching patient records...");
                    
                    const response = await axios.get("http://localhost:3000/api/get-records");
                    
                    if (response.error) {
                        console.error(`Error getting records: ${response.error}`);
                        set({ isLoadingRecords: false });
                        return { success: false, error: response.error };
                    }
                    
                    if (response.data) {
                        console.log(`✅ Loaded ${response.data.data?.length || 0} records`);
                        set({ 
                            patientRecords: response.data,
                            isLoadingRecords: false 
                        });
                        return { success: true };
                    }
                    
                    set({ isLoadingRecords: false });
                    return { success: false, error: "No data received" };
                    
                } catch (err) {
                    console.error(`Error getting records: ${err.message}`);
                    set({ isLoadingRecords: false });
                    return { success: false, error: err.message };
                }
            },

            getPatients: async () => {
                if (get().isLoadingPatients) {
                    console.log("⏳ Already loading patients, skipping...");
                    return { success: false, error: "Already loading" };
                }

                try {
                    set({ isLoadingPatients: true });
                    console.log("👥 Fetching patients...");
                    
                    const response = await axios.get("http://localhost:3000/api/get-patients");
                    
                    if (!response.data.success) {
                        console.error(`Error getting patients: ${response.error}`);
                        set({ isLoadingPatients: false });
                        return { success: false, error: response.error };
                    }
                    
                    console.log(`✅ Loaded ${response.data.data?.length || 0} patients`);
                    set({ 
                        patientsData: response.data.data,
                        isLoadingPatients: false 
                    });
                    return { success: true };
                    
                } catch (err) {
                    console.error(`Error getting patients: ${err.message}`);
                    set({ isLoadingPatients: false });
                    return { success: false, error: err.message };
                }
            },
            
            getRecordsFromExistingPatient: async (studentId) => {
                try {
                    console.log(`📋 Fetching records for student: ${studentId}`);
                    const response = await axios.get(`http://localhost:3000/api/get-records-from-existing-patients/${studentId}`);
                    
                    if (response.error) {
                        console.error(`Error getting records: ${response.error}`);
                        return { success: false, error: response.error };
                    }
                    
                    return response.data;

                } catch (err) {
                    console.error(`Error getting records: ${err.message}`);
                    return { success: false, error: err.message };
                }
            },
            
            clearData: () => {
                console.log("🗑️ Clearing all data...");
                set({ 
                    patientRecords: null, 
                    patientsData: null,
                    isLoadingRecords: false,
                    isLoadingPatients: false
                });
            }
        }),
        {
            name: 'data-storage',
            partialize: (state) => ({
                patientRecords: state.patientRecords,
                patientsData: state.patientsData
            }),
        }
    )
);

export default useData;