import React from "react";

const ChartDataPanel = ({ insight, isLoading = false }) => {
  if (isLoading) {
    return (
      <section className="rounded-xl bg-gray-50 dark:bg-[#1F242F] ring-1 ring-gray-100 dark:ring-[#333741] p-4 h-full animate-pulse">
        <div className="h-4 w-16 bg-gray-200 dark:bg-[#2A3140] rounded" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="rounded-lg bg-white dark:bg-[#161B26] px-3 py-2 ring-1 ring-gray-100 dark:ring-[#333741]">
              <div className="h-2.5 w-12 bg-gray-100 dark:bg-[#2A3140] rounded" />
              <div className="h-3.5 w-20 bg-gray-200 dark:bg-[#2A3140] rounded mt-2" />
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-8 rounded-lg bg-white dark:bg-[#161B26] ring-1 ring-gray-100 dark:ring-[#333741]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-gray-50 dark:bg-[#1F242F] ring-1 ring-gray-100 dark:ring-[#333741] p-4 h-full">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Data</h3>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {(insight?.metrics || []).map((metric) => (
          <div key={metric.label} className="rounded-lg bg-white dark:bg-[#161B26] px-3 py-2 ring-1 ring-gray-100 dark:ring-[#333741]">
            <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{metric.label}</p>
            <p className="text-xs font-semibold text-gray-800 dark:text-slate-100 mt-0.5 break-words">{metric.value}</p>
          </div>
        ))}
      </div>

      {insight?.selectedDepartmentReport ? (
        <div className="mt-3 rounded-lg bg-white dark:bg-[#161B26] ring-1 ring-gray-100 dark:ring-[#333741] p-2.5 max-h-52 overflow-auto">
          <p className="text-[11px] text-gray-700 dark:text-slate-200 font-semibold">Department Disease Report</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            <span className="font-semibold">{insight.selectedDepartmentReport.department}</span>: {insight.selectedDepartmentReport.totalVisits} visits, {insight.selectedDepartmentReport.totalDiagnosedCases} diagnosed cases.
          </p>
          {insight.selectedDepartmentReport.topDiseases?.length > 0 ? (
            <div className="mt-1.5 space-y-1">
              {insight.selectedDepartmentReport.topDiseases.map((disease) => (
                <div key={disease.name} className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <span>{disease.name}</span>
                  <span className="font-semibold text-gray-700 dark:text-slate-200">{disease.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">No diagnosis entries found for this department in the selected period.</p>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-2 max-h-48 overflow-auto pr-1">
          {(insight?.rows || []).length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">No rows to display.</p>
          ) : (
            (insight.rows || []).map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs rounded-lg px-2.5 py-2 bg-white dark:bg-[#161B26] ring-1 ring-gray-100 dark:ring-[#333741]">
                <span className="text-gray-600 dark:text-gray-300 truncate pr-2">{row.label}</span>
                <span className="font-semibold text-gray-800 dark:text-slate-100">{row.value}</span>
              </div>
            ))
          )}
        </div>
      )}

      {Array.isArray(insight?.usageLocations) && insight.usageLocations.length > 0 ? (
        <div className="mt-3 rounded-lg bg-white dark:bg-[#161B26] ring-1 ring-gray-100 dark:ring-[#333741] p-2.5">
          <p className="text-[11px] text-gray-700 dark:text-slate-200 font-semibold">Where It Is Used (Top Medicine)</p>
          {Object.entries(insight.usageLocations[0]?.departments || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([department, qty]) => (
              <div key={department} className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                <span>{department}</span>
                <span className="font-semibold text-gray-700 dark:text-slate-200">{qty}</span>
              </div>
            ))}
        </div>
      ) : null}
    </section>
  );
};

export default React.memo(ChartDataPanel);
