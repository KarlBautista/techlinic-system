# 11. Charts & Analytics

The Analytics page (`/analytics`) displays 4 chart components, all built with **ApexCharts** (via `react-apexcharts`).

---

## Chart Components Overview

| Chart | Type | File | Data Source |
|-------|------|------|-------------|
| Patient Counts | Area Chart | `PatientCountsChart.jsx` | `useChartStore` |
| Patients Per Department | Donut Chart | `PatientsPerDepartmentChart.jsx` | `useChartStore` |
| Top Diagnoses | Pareto (Bar + Line) | `TopDiagnosisChart.jsx` | `useChartStore` |
| Medicine Stock | Horizontal Bar | `MedicinesChart.jsx` | `useMedicineStore` |

All chart components are **memoized** with `React.memo` for performance.

---

## Timeframe Selection

Three of the four charts support 4 timeframes, selected via toggle buttons:

| Timeframe | Backend Time Range | Frontend Labels |
|-----------|-------------------|-----------------|
| **Weekly** | Monday → Sunday (current ISO week) | Mon, Tue, Wed, Thu, Fri, Sat, Sun |
| **Monthly** | 1st → last day of current month | Week 1, Week 2, Week 3, Week 4 |
| **Quarterly** | Start → end of current quarter | 3 month names (e.g., Jan, Feb, Mar) |
| **Yearly** | Jan 1 → Dec 31 of current year | Jan, Feb, Mar, ..., Dec |

---

## Chart 1: Patient Counts (Area Chart)

**Purpose:** Track patient visit volume over time

### Data Flow:
```
Frontend                           Backend                        Supabase
────────                           ───────                        ────────
useChartStore                      analyticsController.js         records table
.getWeeklyPatientCount() ────────► getWeeklyPatients() ─────────► SELECT * FROM records
                                   - Groups by day of week         WHERE created_at >= startOfWeek
                                   - Returns { Mon:5, Tue:3,... }  AND created_at <= endOfWeek
```

### Visualization:
- Single area series (gradient fill)
- Y-axis: patient count
- X-axis: time labels based on timeframe
- Smooth curve with data point markers

---

## Chart 2: Patients Per Department (Donut Chart)

**Purpose:** Show which colleges have the most clinic visits

### Data Flow:
```
Frontend                                    Backend                         Supabase
────────                                    ───────                         ────────
useChartStore                               analyticsController.js          records table
.getWeeklyPatientsPerDepartment() ────────► getWeeklyPatientsPerDepartment()
                                            - Counts records per department
                                            - Returns { "College of Engineering": 20, ... }
```

### Departments tracked:
1. College of Architecture and Fine Arts
2. College of Science
3. College of Liberal Arts
4. College of Industrial Education
5. College of Engineering
6. College of Industrial Technology

### Visualization:
- Donut with 6 segments (one per department)
- Center: total patient count
- Color-coded segments
- Legend below chart

---

## Chart 3: Top Diagnoses (Pareto + Trend)

**Purpose:** Identify most common diagnoses for resource planning

### Data Flow:
```
Frontend                                Backend                          Supabase
────────                                ───────                          ────────
useChartStore                           analyticsController.js           diagnoses table
.getWeeklyTopDiagnoses() ─────────────► getWeeklyTopDiagnoses()
                                        - Counts all diagnoses
                                        - Gets top 5 by frequency
                                        - Groups by time period
                                        - Calculates cumulative %
                                        - Returns:
                                          labels, series, counts,
                                          names, cumulativePercent
```

### Visualization (2 charts):

**Pareto Chart:**
- Bars: top 5 diagnosis counts (descending)
- Line: cumulative percentage (0–100%)
- Dual Y-axes: count (left), percentage (right)

**Trend Chart:**
- Line chart showing how each top diagnosis trends over the time period
- Multiple series (one per diagnosis)
- Helps spot outbreaks or seasonal patterns

---

## Chart 4: Medicine Stock Levels (Horizontal Bar)

**Purpose:** Identify medicines running low on stock

### Data Flow:
```
Frontend                           Backend              Supabase
────────                           ───────              ────────
useMedicineStore.medicines ─────── (already loaded) ──── medicines table
  - Sort by stock_level ASC
  - Take first 5 (lowest stock)
  - Display as horizontal bars
```

### Visualization:
- Horizontal bar chart
- Shows 5 medicines with lowest stock
- Each bar labeled with medicine name
- Bar length = stock level
- No timeframe filter (current snapshot)

---

## How Charts Load

All charts are lazy-loaded in the Analytics page:

```jsx
// Analytics.jsx
const PatientCountsChart = lazy(() => import("../charts/PatientCountsChart"));
const PatientsPerDepartmentChart = lazy(() => import("../charts/PatientsPerDepartmentChart"));
const MedicinesChart = lazy(() => import("../charts/MedicinesChart"));
const TopDiagnosisChart = lazy(() => import("../charts/TopDiagnosisChart"));
```

Each chart wrapped in `<Suspense fallback={<Loader />}>` with a loading spinner.

---

## Backend Time Calculations

All time calculations use **Moment.js** with Philippine timezone (UTC+8):

```js
const timezoneOffset = 8;
const startOfWeek = moment().utcOffset(timezoneOffset).startOf("isoWeek").utc().format("YYYY-MM-DD 00:00:00");
```

- ISO Week: Monday = start, Sunday = end
- Dates are converted to UTC for Supabase queries
- Results are re-localized (UTC+8) for grouping
