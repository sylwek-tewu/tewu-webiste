# Biuro Rachunkowe TEWU

A modern web application for "Biuro Rachunkowe TEWU Sp. z o.o.", an accounting office in Szczecin, offering comprehensive accounting, HR, and tax advisory services.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Component Library**: [Mantine UI v7](https://mantine.dev/)
- **Styling**: Mantine Theme & CSS Modules
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Viewer**: `react-pdf` / `pdfjs-dist`

## Features

- **Service Listings**: Detailed descriptions of accounting services (Full Accounting, KPiR, HR/Payroll, etc.).
- **Certificate Showcase**: Interactive gallery of professional certifications with a built-in PDF viewer.
- **Outsourcing**: Information on outsourcing services.
- **Contact**: Contact details, map integration (if applicable), and inquiry forms.
- **Responsive Design**: Fully responsive layout optimized for desktop, tablet, and mobile devices.
- **Dark/Light Mode**: Built-in theme switching support via Mantine, the mode switch is not implemented yet.

## Project Structure

The project follows a standard Next.js App Router structure:

- `src/app`: Application routes, pages, and global layouts.
- `src/components`: Reusable UI components (Navbar, Footer, specialized features).
- `src/constants.tsx`: Centralized configuration, navigation links, and static data.
- `src/theme.ts`: Mantine theme configuration, color palette, and component defaults.
- `*.module.css`: Component-specific CSS modules for custom styling overrides.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (v8 or higher recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd biuro-rachunkowe-tewu-2026
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running Locally

Start the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

To create an optimized production build:

```bash
pnpm run build
```

To start the production server:

```bash
pnpm run start
```

## Learn More

To learn more about the technologies used in this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Mantine Documentation](https://mantine.dev/) - learn about Mantine components and theming.

