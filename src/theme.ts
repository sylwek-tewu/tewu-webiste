import { createTheme, MantineColorsTuple, CSSVariablesResolver } from "@mantine/core";

// Tailwind blue-600 #2563eb
const brandBlue: MantineColorsTuple = [
    "#eff6ff", // blue-50
    "#dbeafe", // blue-100
    "#bfdbfe", // blue-200
    "#93c5fd", // blue-300
    "#60a5fa", // blue-400
    "#3b82f6", // blue-500
    "#2563eb", // blue-600 - PRIMARY
    "#1d4ed8", // blue-700
    "#1e40af", // blue-800
    "#1e3a8a", // blue-900
];

// Tailwind slate palette
const slate: MantineColorsTuple = [
    "#f8fafc", // slate-50
    "#f1f5f9", // slate-100
    "#e2e8f0", // slate-200
    "#cbd5e1", // slate-300
    "#94a3b8", // slate-400
    "#64748b", // slate-500
    "#475569", // slate-600
    "#334155", // slate-700
    "#1e293b", // slate-800
    "#0a0f1c", // slate-900 - Dark backgrounds (Updated to match prototype)
];

export const theme = createTheme({
    primaryColor: "brandBlue",
    colors: {
        brandBlue,
        slate,
    },
    fontFamily: "Inter, sans-serif",
    headings: {
        fontFamily: "Inter, sans-serif",
        fontWeight: "900",
        sizes: {
            h1: { fontSize: "72px", lineHeight: "1" },
            h2: { fontSize: "36px", lineHeight: "1.2" },
            h3: { fontSize: "30px", lineHeight: "1.25" },
            h4: { fontSize: "24px", lineHeight: "1.3" },
            h5: { fontSize: "20px", lineHeight: "1.4" },
            h6: { fontSize: "16px", lineHeight: "1.5" },
        },
    },
    components: {
        Badge: {
            defaultProps: {
                variant: "light",
                color: "brandBlue",
                radius: "xl",
                size: "lg",
                tt: "uppercase",
                fw: 700,
            },
        },
        Button: {
            defaultProps: {
                radius: "md",
                fw: 500,
            },
            styles: {
                root: {
                    '--button-bg': 'var(--mantine-color-slate-9)',
                    '--button-hover': 'var(--mantine-color-slate-8)',
                    '--button-color': 'white',
                },
            },
        },
        Anchor: {
            defaultProps: {
                underline: 'never',
            },
            styles: {
                root: {
                    // Use CSS variable that can be overridden by CSS modules
                    color: 'var(--anchor-text-color, inherit)',
                },
            },
        },
        Container: {
            defaultProps: {
                size: 1280, // 80rem = max-w-7xl
            },
        },
    },
});

export const resolver: CSSVariablesResolver = (theme) => ({
    variables: {
        "--mantine-hero-padding-top": "96px",
        "--mantine-hero-padding-bottom": "128px",
        "--mantine-section-py": "96px",
        "--mantine-color-slate-900": theme.colors.slate[9],
        "--mantine-color-brand-blue": theme.colors.brandBlue[6],
    },
    light: {},
    dark: {},
});

