# Repository Guidelines

## Project Structure & Module Organization

Repair Link is split into two independent pnpm projects. `frontend/` is a Vite, React, and TypeScript client: application entry points are in `frontend/src/`, reusable UI primitives are in `frontend/src/components/ui/`, utilities are in `frontend/src/lib/`, and static files live in `frontend/public/` or `frontend/src/assets/`. `backend/` contains the TypeScript/Express service foundation and Drizzle database layer. Keep schemas in `backend/src/db/schema.ts`, connection setup in `backend/src/db/index.ts`, and generated migrations in `backend/drizzle/`.

## Build, Test, and Development Commands

Run commands from the relevant project directory:

```bash
cd frontend && pnpm dev       # Start the Vite development server
cd frontend && pnpm build     # Type-check and produce a production bundle
cd frontend && pnpm lint      # Run ESLint over TypeScript and TSX
cd backend && pnpm typecheck  # Validate backend TypeScript without emitting files
cd backend && pnpm db:generate # Generate a migration after schema changes
cd backend && pnpm db:migrate # Apply migrations using DATABASE_URL
```

Use `pnpm db:push` only for rapid local schema synchronization; commit generated migration files for shared database changes. Copy `backend/.env.example` to `backend/.env` and never commit credentials.

## Coding Style & Naming Conventions

Write TypeScript with strict types and small, focused modules. Follow the style of nearby files: four-space indentation in the frontend and semicolons/single quotes in backend database code. Name React components in PascalCase (for example, `RepairRequestCard.tsx`), hooks as `useThing`, and general utilities in camelCase. Place shared UI primitives under `components/ui`; use the `@/` frontend alias for source imports. Use Tailwind utility classes and the `cn()` helper when composing conditional classes.

## Testing Guidelines

No automated test framework is configured yet. Before opening a change, run `pnpm lint` and `pnpm build` in `frontend`, plus `pnpm typecheck` in `backend` when backend code changes. Add tests alongside new behavior once a test runner is introduced; use descriptive names such as `repair-request-form.test.tsx`.

## Commit & Pull Request Guidelines

History currently uses short imperative subjects (`init`, `configure`). Continue with concise, scope-aware summaries such as `add technician profile schema`. Keep commits focused. Pull requests should explain the user-facing or data-model change, link the related issue when available, list validation commands run, and include screenshots for visual frontend changes. Call out migration and environment-variable changes explicitly.
