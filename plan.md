# Dashboard Analytics Carousel Plan

## Goal
Transform the current View All analytics modal into a slide-by-slide analytics experience.
Each slide will show:
- Left: one chart (focused and larger)
- Right top: Data panel (key numbers/tables)
- Right bottom: Report panel (auto-generated narrative insights)

This follows your sketch: chart-first layout, with data and report visible per graph.

## Current State (Already Implemented)
- Chart carousel exists on dashboard cards with prev/next and auto-rotate.
- View All currently opens a modal grid containing all charts at once.
- This exists in both:
  - frontend/techclinic/src/pages/newDashboard.jsx
  - frontend/techclinic/src/pages/AdminDashboard.jsx

## Target UX
- Clicking View All opens Analytics Carousel Modal (not grid).
- Modal contains a single active chart slide at a time.
- Slide layout:
  - 65% width: Chart container
  - 35% width: stacked panels
	 - Data panel (metrics, peaks, lows, period summary)
	 - Report panel (plain-language interpretation + recommendations)
- Global controls:
  - Previous/Next arrows
  - Dot indicator
  - Slide label and period badge
  - Optional autoplay pause/resume
- Mobile behavior:
  - Vertical stack (chart -> data -> report)
  - Swipe support or tap arrows

## Scope
- Frontend only for this task plan.
- No backend schema changes required for first version.
- Reuse existing chart/store data to avoid duplicate fetching.

## Implementation Plan

### Phase 1: Extract and Reuse Chart Metadata
1. Create a shared chart config module for both dashboards.
	- File: frontend/techclinic/src/config/chartSlides.js
	- Include: key, label, component, analyticsType, reportBuilder reference.
2. Replace duplicated CHART_SLIDES constants in:
	- newDashboard.jsx
	- AdminDashboard.jsx

### Phase 2: Build Analytics Modal Carousel Component
1. Create component:
	- frontend/techclinic/src/components/AnalyticsCarouselModal.jsx
2. Props:
	- open, onClose, slides, initialIndex
3. Internal state:
	- activeIndex
	- autoplay enabled/paused
4. Layout:
	- Desktop: 2-column (chart left, insights right)
	- Mobile: 1-column stacked sections
5. Controls:
	- prev/next arrows
	- dots
	- keyboard support (left/right, esc)

### Phase 3: Add Data and Report Panels Per Chart
1. Create data transformer utilities:
	- frontend/techclinic/src/utils/chartInsights.js
2. For each chart type, provide:
	- getSummaryMetrics(data)
	- getTopFindings(data)
	- getNarrativeReport(data)
3. Panel contents per slide:
	- Data panel:
	  - total count
	  - highest segment/time bucket
	  - lowest segment/time bucket
	  - optional top 3 rows table
	- Report panel:
	  - 3-5 bullet insights
	  - short clinical/operations recommendation

### Phase 4: Integrate with Existing Dashboards
1. In newDashboard.jsx:
	- remove current modal grid markup
	- mount AnalyticsCarouselModal
	- pass current active chart index from card carousel to modal initialIndex
2. In AdminDashboard.jsx:
	- same integration as above
3. Keep existing quick card carousel unchanged for now.

### Phase 5: Polish and Accessibility
1. Add transition consistency with framer-motion.
2. Add loading/empty states in Data and Report panels.
3. Ensure color contrast in light/dark themes.
4. Add aria labels for navigation controls.

## Suggested File Changes
- Add: frontend/techclinic/src/config/chartSlides.js
- Add: frontend/techclinic/src/components/AnalyticsCarouselModal.jsx
- Add: frontend/techclinic/src/components/ChartDataPanel.jsx
- Add: frontend/techclinic/src/components/ChartReportPanel.jsx
- Add: frontend/techclinic/src/utils/chartInsights.js
- Update: frontend/techclinic/src/pages/newDashboard.jsx
- Update: frontend/techclinic/src/pages/AdminDashboard.jsx

## Data/Report Rules (First Version)
- Patient Visits:
  - show total visits in selected period, busiest bucket, trend direction
- By College:
  - show top contributing college, share percentage, spread concentration
- Top Diagnoses:
  - show top diagnosis, cumulative share, concentration risk note
- Medicine Stock:
  - show low-stock count, out-of-stock count, reorder urgency

## Acceptance Criteria
- View All no longer shows all charts simultaneously in a grid.
- Modal shows one chart slide at a time with right-side Data + Report panels.
- User can navigate all charts in modal without closing.
- Both New Dashboard and Admin Dashboard use the same modal component.
- Layout remains usable on mobile and desktop.

## Risks
- Existing chart components encapsulate their own internal period state; extracting comparable summary data may require standardized interfaces.
- Potential duplicated API calls if modal mounts heavy chart components repeatedly.

## Mitigation
- Pass existing cached store data into insight builders.
- Memoize transformed insight output per chart + period.
- Mount-once strategy for charts if performance drops.

## Next Build Order
1. Shared slide config
2. Modal carousel shell
3. Data panel wiring
4. Report narrative wiring
5. Dashboard integration
6. UX polish and QA
