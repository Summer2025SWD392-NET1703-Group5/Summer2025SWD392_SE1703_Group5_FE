# Online Ticket Sales for Galaxy - Frontend

A modern React application built with TypeScript and Vite for online ticket sales for galaxy.

## 🚀 Tech Stack

- **React** - UI Library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and formatting

## 📁 Project Structure

```
.
├── public/                     # Static assets
│   └── vite.svg               # Vite logo
├── src/                       # Source code
│   ├── assets/                # Static assets (images, icons)
│   │   └── react.svg
│   ├── components/            # Reusable React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── layout/            # Layout components
│   │   ├── ui/                # UI components
│   │   └── utils/             # Component utilities
│   ├── config/                # Configuration files
│   │   └── axios.ts           # API client configuration
│   ├── pages/                 # Page components
│   │   ├── About/             # About page
│   │   ├── Dashboard/         # Dashboard page
│   │   └── Home/              # Home page
│   │       ├── Home.css
│   │       └── Home.tsx
│   ├── routes/                # Routing configuration
│   │   ├── privateRoutes.ts   # Protected routes
│   │   └── publicRoutes.ts    # Public routes
│   ├── services/              # API services and business logic
│   ├── App.css               # Main app styles
│   ├── App.tsx               # Main app component
│   ├── index.css             # Global styles
│   ├── main.tsx              # App entry point
│   └── vite-env.d.ts         # Vite type definitions
├── .gitignore                # Git ignore rules
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App-specific TypeScript config
├── tsconfig.node.json        # Node-specific TypeScript config
└── vite.config.ts            # Vite configuration
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Summer2025SWD392_NET1703_Group5_FE
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## 🏗️ Development Guidelines

### Code Structure

- **Components**: Place reusable components in `src/components/`
- **Pages**: Page-level components go in `src/pages/`
- **Services**: API calls and business logic in `src/services/`
- **Routes**: Route definitions in `src/routes/`
- **Config**: Configuration files in `src/config/`

### TypeScript Configuration

The project uses a composite TypeScript setup:

- `tsconfig.json` - Root configuration
- `tsconfig.app.json` - Application code configuration
- `tsconfig.node.json` - Node.js/build tools configuration

### Linting

ESLint is configured with:

- TypeScript support
- React hooks rules
- React refresh plugin
- Strict type checking

Run `npm run lint` to check for code issues.

## 🚀 Building for Production

```bash
npm run build
```

This will:

1. Run TypeScript compiler to check types
2. Build the application using Vite
3. Output optimized files to the `dist/` directory

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new code
3. Run linting before committing: `npm run lint`
4. Ensure all builds pass: `npm run build`

## 📦 Dependencies

### Runtime Dependencies

- `react` - React library
- `react-dom` - React DOM rendering

### Development Dependencies

- `@vitejs/plugin-react` - Vite React plugin
- `typescript` - TypeScript compiler
- `eslint` - Code linting
- Various ESLint plugins for React and TypeScript

## 🔧 Configuration Files

- [`vite.config.ts`](vite.config.ts) - Vite bundler configuration
- [`eslint.config.js`](eslint.config.js) - ESLint rules and plugins
- [`tsconfig.*.json`](tsconfig.json) - TypeScript compiler options
