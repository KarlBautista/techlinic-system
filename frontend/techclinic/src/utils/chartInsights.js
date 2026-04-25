const toRows = (payload) => {
  const labels = payload?.labels || [];
  const values = payload?.values || [];
  return labels
    .map((label, index) => ({ label, value: Number(values[index] || 0) }))
    .filter((row) => Number.isFinite(row.value));
};

const summarizeRows = (rows) => {
  if (!rows.length) {
    return {
      total: 0,
      peak: null,
      lowest: null,
      nonZeroCount: 0,
      sortedDesc: [],
    };
  }

  const sortedDesc = [...rows].sort((a, b) => b.value - a.value);
  const sortedAsc = [...rows].sort((a, b) => a.value - b.value);

  return {
    total: rows.reduce((sum, row) => sum + row.value, 0),
    peak: sortedDesc[0],
    lowest: sortedAsc[0],
    nonZeroCount: rows.filter((row) => row.value > 0).length,
    sortedDesc,
  };
};

const buildPatientCountReport = (summary, periodText) => {
  if (!summary.sortedDesc.length) {
    return ["No patient visits were recorded for this period."];
  }

  return [
    `${summary.total} total visits were recorded${periodText ? ` for ${periodText}` : ""}.`,
    `${summary.peak.label} is the busiest bucket with ${summary.peak.value} visits.`,
    `${summary.nonZeroCount} of ${summary.sortedDesc.length} buckets have activity.`,
  ];
};

const buildDepartmentReport = (summary, periodText, selectedDepartmentReport) => {
  if (!summary.sortedDesc.length) {
    return ["No department-level patient data is available for this period."];
  }

  if (selectedDepartmentReport?.department) {
    const topDiseases = selectedDepartmentReport.topDiseases || [];
    const diseaseNarrative = topDiseases.length > 0
      ? `Disease profile for ${selectedDepartmentReport.department}: ${topDiseases
          .map((item) => `${item.name} (${item.count})`)
          .join(", ")}.`
      : `No diagnosis entries were recorded for ${selectedDepartmentReport.department} in this period.`;

    return [
      `${selectedDepartmentReport.department} logged ${selectedDepartmentReport.totalVisits} visits and ${selectedDepartmentReport.totalDiagnosedCases} diagnosed cases${periodText ? ` during ${periodText}` : ""}.`,
      diseaseNarrative,
      topDiseases.length > 0
        ? `Most observed disease is ${topDiseases[0].name} with ${topDiseases[0].count} case(s), indicating the dominant condition trend in this department.`
        : `Disease trend cannot be ranked yet because no diagnosis records are available for this department.`,
    ];
  }

  const leadShare = summary.total > 0
    ? Math.round((summary.peak.value / summary.total) * 100)
    : 0;

  return [
    `${summary.total} total patient records are distributed across colleges${periodText ? ` for ${periodText}` : ""}.`,
    `${summary.peak.label} leads with ${summary.peak.value} records (${leadShare}%).`,
    `Lowest represented bucket is ${summary.lowest.label} with ${summary.lowest.value} records.`,
  ];
};

const buildDiagnosisReport = (summary, periodText) => {
  if (!summary.sortedDesc.length) {
    return ["No diagnosis records were captured for this period."];
  }

  const topThree = summary.sortedDesc.slice(0, 3);
  const topThreeText = topThree.map((item) => `${item.label} (${item.value})`).join(", ");

  return [
    `${summary.total} diagnosis counts were registered${periodText ? ` for ${periodText}` : ""}.`,
    `${summary.peak.label} is the most common diagnosis at ${summary.peak.value} cases.`,
    `Top 3 diagnoses are ${topThreeText}.`,
  ];
};

const buildMedicineReport = (summary, periodText, usageLocations = []) => {
  if (!summary.sortedDesc.length) {
    return ["No medicine usage rows are available."];
  }

  const topMedicine = usageLocations?.[0];
  const topDepartments = topMedicine?.departments
    ? Object.entries(topMedicine.departments)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : [];

  const locationSentence = topDepartments.length > 0
    ? `${topMedicine.name} is mostly used in ${topDepartments.map(([department, qty]) => `${department} (${qty})`).join(", ")}.`
    : "Department usage location data is not available for the top medicine yet.";

  const topThreeLocationSentence = usageLocations.slice(0, 3).map((medicine) => {
    const topDepartment = Object.entries(medicine?.departments || {}).sort((a, b) => b[1] - a[1])[0];
    if (!topDepartment) return `${medicine.name}: no department data`;
    return `${medicine.name}: ${topDepartment[0]} (${topDepartment[1]})`;
  }).join("; ");

  return [
    `${summary.sortedDesc.length} medicines are ranked by total dispensed quantity${periodText ? ` (${periodText})` : ""}.`,
    `${summary.peak.label} is the most used medicine with ${summary.peak.value} total dispensed units.`,
    `${locationSentence} Top medicine locations: ${topThreeLocationSentence}.`,
  ];
};

export const buildInsights = (slideKey, payload) => {
  const rows = toRows(payload);
  const summary = summarizeRows(rows);
  const periodText = payload?.periodText || "";

  const reportByType = {
    "patient-counts": buildPatientCountReport,
    "per-department": buildDepartmentReport,
    "top-diagnosis": buildDiagnosisReport,
    "medicine-stock": buildMedicineReport,
  };

  const reportBuilder = reportByType[slideKey] || buildPatientCountReport;

  return {
    title: payload?.title || "Analytics",
    periodText,
    selectedDepartmentReport: payload?.selectedDepartmentReport || null,
    usageLocations: payload?.usageLocations || [],
    metrics: [
      { label: "Total", value: summary.total },
      { label: "Highest", value: summary.peak ? `${summary.peak.label} (${summary.peak.value})` : "-" },
    ],
    rows: summary.sortedDesc.slice(0, 6),
    report: slideKey === "per-department"
      ? reportBuilder(summary, periodText, payload?.selectedDepartmentReport)
      : slideKey === "medicine-stock"
        ? reportBuilder(summary, periodText, payload?.usageLocations)
        : reportBuilder(summary, periodText),
  };
};
