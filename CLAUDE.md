# CRM Pro Frontend Development Guide

## Commands
- `npm run dev` - Start development server with turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style
- TypeScript with strict type checking
- React Server Components with `'use client'` directives where needed
- Path aliases: `@/*` for src/* (components, lib, hooks, etc.)
- Shadcn/UI component library with "new-york" style
- TailwindCSS for styling with composition patterns
- Form validation with react-hook-form and zod schemas

## Naming Conventions
- PascalCase for components, interfaces, and types
- camelCase for variables, functions, and instances
- Files match exported component names
- Component props typed with explicit interfaces

## Architecture
- Next.js App Router with route groups (auth), (dashboard)
- Components organized by function (auth, forms, layout, ui)
- Authentication via context API pattern with AuthGuard for protection
- Error handling with try/catch blocks and toast notifications
- Data fetching with custom hooks

## Import Order
1. React/Next.js imports
2. Third-party libraries
3. Local components (@/components/...)
4. Local utilities (@/lib/..., @/hooks/...)
5. Types (@/types/...)