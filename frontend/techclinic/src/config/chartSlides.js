import PatientCountsChart from "../charts/PatientCountsChart";
import PatientsPerDepartmentChart from "../charts/PatientsPerDepartmentChart";
import TopDiagnosisChart from "../charts/TopDiagnosisChart";
import MedicinesChart from "../charts/MedicinesChart";

export const CHART_SLIDES = [
  { key: "patient-counts", label: "Patient Visits", component: PatientCountsChart },
  { key: "per-department", label: "By College", component: PatientsPerDepartmentChart },
  { key: "top-diagnosis", label: "Top Diagnoses", component: TopDiagnosisChart },
  { key: "medicine-stock", label: "Most Used Medicines", component: MedicinesChart },
];
