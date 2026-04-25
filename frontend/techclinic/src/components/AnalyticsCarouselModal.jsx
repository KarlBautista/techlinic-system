import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, ChevronLeft, ChevronRight, X } from "lucide-react";
import ChartDataPanel from "./ChartDataPanel";
import ChartReportPanel from "./ChartReportPanel";
import { buildInsights } from "../utils/chartInsights";

const AnalyticsCarouselModal = ({ open, onClose, slides, initialIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [insightsMap, setInsightsMap] = useState({});
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setActiveIndex(initialIndex);
    }
    wasOpenRef.current = open;
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
      if (event.key === "ArrowRight") setActiveIndex((prev) => (prev + 1) % slides.length);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, slides.length]);

  const activeSlide = slides[activeIndex];

  const activeInsight = useMemo(() => {
    return insightsMap[activeSlide?.key] || {
      title: activeSlide?.label || "Analytics",
      periodText: "",
      metrics: [],
      rows: [],
      report: [],
    };
  }, [activeSlide, insightsMap]);

  const hasInsight = Boolean(activeSlide?.key && insightsMap[activeSlide.key]);

  const handleInsightChange = (payload) => {
    if (!activeSlide?.key) return;
    setInsightsMap((prev) => ({
      ...prev,
      [activeSlide.key]: buildInsights(activeSlide.key, payload),
    }));
  };

  if (!slides?.length) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100 flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative bg-white dark:bg-[#161B26] rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] max-h-[760px] overflow-hidden mx-4 flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#1F2A37] bg-white dark:bg-[#161B26]">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-crimson-500" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Analytics</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activeSlide?.label}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close analytics modal"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F242F] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 border-b border-gray-100 dark:border-[#1F2A37] flex items-center justify-center">
              <div className="flex items-center gap-1">
                {slides.map((slide, index) => (
                  <button
                    key={slide.key}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to ${slide.label}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeIndex === index ? "bg-crimson-500 w-5" : "bg-gray-300 dark:bg-gray-600 w-2"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-[#1F242F]/90 ring-1 ring-gray-200 dark:ring-[#333741] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
              aria-label="Previous chart"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-[#1F242F]/90 ring-1 ring-gray-200 dark:ring-[#333741] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
              aria-label="Next chart"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="p-6 flex-1 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4 h-full min-h-0">
                <div className="rounded-xl bg-gray-50 dark:bg-[#1F242F] ring-1 ring-gray-100 dark:ring-[#333741] p-4 h-full min-h-0 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSlide.key}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.22 }}
                      className="h-full"
                    >
                      {React.createElement(activeSlide.component, { onInsightChange: handleInsightChange })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex flex-col gap-4 h-full min-h-0 overflow-hidden">
                  <div className="flex-1 min-h-0">
                    <ChartDataPanel insight={activeInsight} isLoading={!hasInsight} />
                  </div>
                  <div className="flex-1 min-h-0">
                    <ChartReportPanel insight={activeInsight} isLoading={!hasInsight} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(AnalyticsCarouselModal);
