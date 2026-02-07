# Code Review v2: Next.js 16 + Mantine v8 + React 19

**Project:** biuro-rachunkowe-tewu-2026  
**Review Date:** 2026-02-07  
**Stack:** Next.js 16.1.6 / React 19.2.4 / Mantine 8.3.14

---

## Previous Issues - Verification Status

| Issue ID | Status | Notes |
|----------|--------|-------|
| CR-001 | ✅ Fixed | `CURRENT_YEAR` extracted to module-level constant in `Footer.tsx` |
| CR-003 | ✅ Fixed | `CertificatesClient.tsx` now uses `useState(false)` for hover state. `ContactClient.tsx` uses `isMapHovered` state for iframe filter |
| A11Y-001 | ✅ Fixed | All `ActionIcon` components now have `aria-label` props (`CertificatesClient.tsx`, `PDFViewer.tsx`) |
| A11Y-002 | ✅ Fixed | iframe in `ContactClient.tsx` has `title="Mapa lokalizacji biura TEWU w Szczecinie"` |
| A11Y-003 | ✅ Fixed | `.reasonRow` no longer has `cursor: pointer` in CSS - removed confusing styling |
| A11Y-004 | ✅ Fixed | Modal close button has `aria-label="Zamknij podgląd PDF"` |
| A11Y-005 | ✅ Fixed | `.contactLink` class now includes `:focus` state styling in `Layout.module.css` |
| OPT-002 | ✅ Fixed | All imports properly ordered at top of `layout.tsx` |
| MANTINE-004 | ✅ N/A | CSSVariablesResolver usage was already correct |
| MANTINE-005 | ✅ N/A | Polymorphic components usage was already correct |
| MANTINE-006 | ✅ N/A | `defaultProps` usage was already correct |

---

## 1. Breaking / Critical Issues

**No critical or breaking issues found.** ✅

All hydration-risk patterns from v1 have been addressed.

---

## 2. Accessibility (A11y) Report

### 🟢 A11Y - All Clear

All previously reported accessibility issues have been resolved:

- ✅ All icon-only `ActionIcon` components have `aria-label` attributes
- ✅ iframe elements have descriptive `title` attributes
- ✅ Focus states are properly styled via CSS classes (`.contactLink`)
- ✅ Non-interactive elements no longer have misleading `cursor: pointer`

---

## 3. React 19 & Next.js 16 Optimization

### ✅ OPT-001: HomePage Components Architecture (Addressed)
**Status**: **Resolved**

**Implementation**: 
- `page.tsx` converted to **Server Component**.
- `HomeClient.tsx` wrapper removed.
- `WhyUs.tsx` refactored to use flat `GridCol` syntax and remains a **Server Component**.
- `Hero.tsx` and `Services.tsx` refactored to remove `component={Link}` usage. Instead, `Link` components wrap the Mantine elements (e.g., `<Link><Button component="span" .../></Link>`). **These files are now pure Server Components.**
- **Result**: Complete Server Component architecture for the homepage, minimizing client-side JavaScript.

---

### ✅ OPT-002: `any` Types in PDFViewer (Addressed)
**Status**: **Resolved**

**Fix**: Replaced `any` with `PDFDocumentProxy` and `typeof PDFJS` types from `pdfjs-dist`. Added non-null assertions where guard clauses guarantee existence.

---

## 4. Mantine v8 & Theme Integrity

### ✅ MANTINE-001: Inline Hover Handlers (Addressed)
**Status**: **Resolved**

**Fix**: 
- `ServicesClient.tsx`: Replaced inline styles with `.ctaButton` CSS class.
- `OutsourcingClient.tsx`: Created new CSS module and replaced inline styles with `.featureCard` class.
- Both now support proper `:focus` states and refrain from direct DOM manipulation.

---

### ✅ MANTINE-002: Hardcoded Colors (Addressed)
**Status**: **Resolved**

All identified hardcoded colors in `Hero.tsx`, `CertificatesClient.tsx`, and CSS modules have been replaced with Mantine CSS variables (e.g., `var(--mantine-color-brandBlue-6)`).

---

### ✅ MANTINE-003: Repeated Font Size Patterns (Addressed)
**Status**: **Resolved**

**Fix**: Updated `theme.ts` to use responsive `clamp()` values for `h1` and `h2` headings, centralizing the sizing logic and removing the need for manual `clamp()` in individual components.

---

## 5. Performance Observations

### ✅ PERF-001: PDFViewer Dynamic Import Implemented
The `PDFViewer` correctly uses dynamic import for `pdfjs-dist`:
```tsx
const pdfjs = await import('pdfjs-dist');
```

### 🔵 PERF-002: Consider Lazy Loading for Below-Fold Sections
**Files:** `WhyUs.tsx`, `Services.tsx`

These sections appear below the fold on the homepage. Consider using React's `lazy()` with `Suspense` for code splitting:
```tsx
const WhyUs = lazy(() => import('@/components/home/WhyUs'));
```

---

## 6. Code Quality Improvements

### 🔵 QUALITY-001: Export Consistency

Mixed export patterns across files:
- `Footer.tsx`: `export default Footer`
- `Hero.tsx`: `export function Hero()` (named export)
- `ServicesClient.tsx`: `export default function ServicesClient()`

**Recommendation:** Standardize on one pattern (default exports are preferred for page/route components in Next.js).

---

## Summary

| Category | v1 Issues | v2 Status |
|----------|-----------|-----------|
| **Critical** | 2 | 0 ✅ |
| **Accessibility** | 5 | 0 ✅ |
| **Optimization** | 2 | 0 ✅ |
| **Mantine/Theme** | 3 recommendations | 0 ✅ |
| **Performance** | 1 | 1 suggestion |

### Key Wins Since v1
1. ✅ Hydration risk eliminated (year calculation)
2. ✅ React state pattern for hover effects (CertificateCard, iframe map)
3. ✅ Full ARIA compliance for interactive elements
4. ✅ Keyboard focus states for links
5. ✅ Import organization fixed
6. ✅ HomePage architecture optimized (Pure Server Components)
7. ✅ Type safety improved (PDFViewer)
8. ✅ Styling standardized (CSS Modules + Theme)

### Remaining Items (Low Priority)
1. 🔵 Consider lazy loading for below-fold sections
2. 🔵 Standardize export patterns
