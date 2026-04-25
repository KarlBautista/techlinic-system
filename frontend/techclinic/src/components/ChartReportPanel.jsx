import React from "react";

const ChartReportPanel = ({ insight, isLoading = false }) => {
  if (isLoading) {
    return (
      <section className="rounded-xl bg-gray-50 dark:bg-[#1F242F] ring-1 ring-gray-100 dark:ring-[#333741] p-4 h-full animate-pulse">
        <div className="h-4 w-20 bg-gray-200 dark:bg-[#2A3140] rounded" />
        <div className="h-3 w-40 bg-gray-100 dark:bg-[#2A3140] rounded mt-2" />
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-9 rounded-lg bg-white dark:bg-[#161B26] ring-1 ring-gray-100 dark:ring-[#333741]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-gray-50 dark:bg-[#1F242F] ring-1 ring-gray-100 dark:ring-[#333741] p-4 h-full">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Report</h3>
      {insight?.periodText ? (
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{insight.periodText}</p>
      ) : null}

      <div className="mt-3 space-y-2">
        {(insight?.report || []).length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">No report available.</p>
        ) : (
          <p className="text-xs leading-6 text-gray-700 dark:text-slate-200 rounded-lg bg-white dark:bg-[#161B26] ring-1 ring-gray-100 dark:ring-[#333741] px-3 py-2.5">
            {(insight.report || []).join(" ")}
          </p>
        )}
      </div>
    </section>
  );
};

export default React.memo(ChartReportPanel);
