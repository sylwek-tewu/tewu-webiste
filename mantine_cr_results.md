# Code Review: Next.js 16 + Mantine v8 + React 19

**Project:** biuro-rachunkowe-tewu-2026  
**Review Date:** 2026-02-07  
**Stack:** Next.js 16.1.6 / React 19.2.4 / Mantine 8.3.14

---

## 1. Breaking / Critical Issues

### 🔴 CR-001: `new Date()` Call in Server Component (Hydration Risk)
**File:** `src/components/Footer.tsx`  
**Line:** 120

```tsx
© {new Date().getFullYear()} {COMPANY_FULL_NAME}
```

**Issue:** While `Footer.tsx` is marked `"use client"`, calling `new Date()` during render can cause hydration mismatches if the server and client are in different timezones or if there's a time delta between SSR and hydration.

**Fix:** Remove `"use client"` & move the year calculation to a pre-computed value from the server:
```tsx
const CURRENT_YEAR = new Date().getFullYear();
// Use CURRENT_YEAR in render
```

---


### 🔴 CR-003: `CertificatesClient` - Uncontrolled `useRef` with DOM Manipulation
**File:** `src/app/certyfikaty/CertificatesClient.tsx`  
**Lines:** 20, 163-179

**Issue:** Direct DOM manipulation via `containerRef.current.querySelector('iframe')` in `onMouseEnter`/`onMouseLeave` events bypasses React's reconciliation:

```tsx
const iframe = e.currentTarget.querySelector('iframe');
if (iframe) iframe.style.filter = 'grayscale(0)';
```

**Fix:** Use React state to track hover:
```tsx
const [isMapHovered, setIsMapHovered] = useState(false);
// ...
<iframe style={{ filter: isMapHovered ? 'grayscale(0)' : 'grayscale(1)' }} />
```

Same issue exists in `ContactClient.tsx` (lines 163-170).

---

## 2. Accessibility (A11y) Report

### 🟠 A11Y-001: Missing `aria-label` on Icon-Only ActionIcons
**Files:** `CertificatesClient.tsx`, `Footer.tsx`

**Issue:** `ActionIcon` components with only icons lack accessible labels:

```tsx
<ActionIcon onClick={handleZoomIn} variant="subtle" color="slate.6">
    <ZoomIn size={18} />
</ActionIcon>
```

**Fix:**
```tsx
<ActionIcon onClick={handleZoomIn} aria-label="Powiększ" variant="subtle">
```

**Affected lines:**
- `CertificatesClient.tsx`: 161, 172, 184, 190, 194, 201, 211
- `Footer.tsx`: 24-29 (social links)

---

### 🟠 A11Y-002: Missing `title` Attribute on `<iframe>` Element
**File:** `src/app/kontakt/ContactClient.tsx`  
**Line:** 172-180

```tsx
<iframe
    src="https://www.google.com/maps/embed?..."
    // Missing title for screen readers
>
```

**Fix:**
```tsx
<iframe title="Mapa lokalizacji biura TEWU" src="...">
```

---

### 🟠 A11Y-003: Non-Semantic Clickable Elements (`.reasonRow`)
**File:** `src/components/home/WhyUs.tsx`, `Layout.module.css`

**Issue:** The `reasonRow` class adds `cursor: pointer` but the `<Group>` elements are not focusable or actionable:

```css
.reasonRow { cursor: pointer; }
```

**Recommendation:** Either:
1. Remove `cursor: pointer` if these are not interactive
2. Make them `<a>` or `<button>` elements if they should be clickable
3. Add `role="button"` and `tabIndex={0}` with keyboard handlers

---

### 🟠 A11Y-004: Modal Close Button Lacks Screen Reader Context
**File:** `src/app/certyfikaty/CertificatesClient.tsx`  
**Lines:** 211-219

**Fix:**
```tsx
<ActionIcon onClick={closeModal} aria-label="Zamknij podgląd PDF">
```

---

### 🟠 A11Y-005: Inline Style Color Hover Handlers Bypass Focus States
**File:** `src/app/kontakt/ContactClient.tsx`

Multiple `Anchor` elements use `onMouseEnter`/`onMouseLeave` for hover effects:

```tsx
onMouseEnter={(e) => e.currentTarget.style.color = 'var(--mantine-color-blue-6)'}
onMouseLeave={(e) => e.currentTarget.style.color = 'var(--mantine-color-slate-9)'}
```

**Issue:** No `:focus` state styling—keyboard users miss the visual feedback.

**Fix:** Use CSS classes.

---

## 3. React 19 & Next.js 16 Optimization

### 🟡 OPT-001: Client Components That Could Be Server Components
**Files:**
- `src/components/home/Hero.tsx` - No client-side hooks or interactivity
- `src/components/home/Services.tsx` - No client-side hooks or interactivity  
- `src/components/home/WhyUs.tsx` - No client-side hooks or interactivity

**Issue:** These components are imported into `HomeClient.tsx` (a Client Component), but they don't use any client-side features themselves. The parent `HomeClient.tsx` wrapper forces them all to be client components.

**Recommendation:** Consider restructuring:
```tsx
// page.tsx (Server Component)
export default function Home() {
    return (
        <Stack gap={0} bg="white">
            <Hero />
            <Services />
            <WhyUs />
        </Stack>
    );
}
```

This would reduce JS bundle size significantly.

---

### 🟡 OPT-002: Import Statement Placement
**File:** `src/app/layout.tsx`  
**Line:** 16

```tsx
// ... other imports
export const metadata: Metadata = {...};

import { ThemeProvider } from "@/components/ThemeProvider";  // Import after export

export default function RootLayout...
```

**Issue:** Non-standard import placement. While it works, it's unconventional.

**Fix:** Move all imports to the top of the file.

---

## 4. Mantine v8 & Theme Integrity

### 🟡 MANTINE-001: Hardcoded Color Values Instead of Theme Variables
**Multiple Files**

Examples:
```tsx
// CertificatesClient.tsx line 329
bg="rgba(15, 23, 42, 0.4)"

// Hero.tsx line 70
bg="rgba(37, 99, 235, 0.1)"

// Hero.tsx line 79
bg="rgba(99, 102, 241, 0.1)"
```

**Recommendation:** Use CSS variables or Mantine's color system:
```tsx
bg="var(--mantine-color-slate-9)" // with opacity via CSS
// or create theme colors with alpha
```

---

### 🟡 MANTINE-002: Mixing Inline Styles with Mantine Props
**Multiple Files**

```tsx
// Hero.tsx
<Title style={{ letterSpacing: '-0.025em', lineHeight: 1.1 }}>
```

**Recommendation:** Define these in theme.ts for consistency:
```tsx
// theme.ts
headings: {
    styles: {
        root: { letterSpacing: '-0.025em' }
    }
}
```

---

### 🟡 MANTINE-003: `fontSize` Hardcoded in Multiple Places
**Multiple Files**

```tsx
// ServicesClient.tsx
style={{ fontSize: '2rem' }}

// OutsourcingClient.tsx  
style={{ fontSize: '3.75rem' }}

// o-nas/page.tsx
style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)' }}
```

**Recommendation:** Extend theme heading sizes or create CSS variables:
```tsx
// theme.ts
headings: {
    sizes: {
        h2: { fontSize: 'clamp(1.875rem, 4vw, 2.25rem)' },
    }
}
```

---

### ✅ MANTINE-004: CSSVariablesResolver Usage (Correct)
**File:** `src/theme.ts`

The `resolver` export correctly uses `CSSVariablesResolver`:
```tsx
export const resolver: CSSVariablesResolver = (theme) => ({
    variables: {
        "--mantine-hero-padding-top": "96px",
        // ...
    },
});
```

✅ **Good practice.**

---

### ✅ MANTINE-005: Polymorphic Components Usage (Correct)
**Multiple Files**

Correct usage of `component` prop:
```tsx
<Box component="section" />
<Button component={Link} href="/kontakt" />
<Anchor component={Link} href="/uslugi" />
<Paper component="nav" />
```

✅ **Semantic HTML correctly implemented.**

---

### ✅ MANTINE-006: `defaultProps` Usage (Correct)
**File:** `src/theme.ts`

```tsx
components: {
    Badge: { defaultProps: { variant: "light", color: "brandBlue", ... } },
    Button: { defaultProps: { radius: "md", fw: 500 } },
    // ...
}
```

✅ **Properly leverages Mantine v8 component defaults.**

---

## 5. Additional Optimizations


### 🔵 PERF-002: Large Bundle from react-pdf
**File:** `src/app/certyfikaty/CertificatesClient.tsx`

**Issue:** `react-pdf` adds ~500KB to the client bundle. Consider:
1. Dynamic import with `next/dynamic`
2. Loading the PDF viewer only when modal opens

```tsx
const PDFViewer = dynamic(() => import('./PDFViewer'), { 
    ssr: false,
    loading: () => <Loader />
});
```

---

### 🔵 STYLE-001: CSS Variable Consistency
**File:** `src/components/layout/Layout.module.css`

The CSS uses `--mantine-color-*` variables consistently, which is excellent. However, consider:

```css
/* Using theme variable */
box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.1);
```

Could use Mantine shadow variables for consistency.


