# Runceipt 🧾

Turn your Strava runs into beautiful, shareable receipts.

Built with [Next.js](https://nextjs.org), React 19, and the Strava API.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env.local` file:

```env
STRAVA_CLIENT_ID=<your_client_id>
STRAVA_CLIENT_SECRET=<your_client_secret>
AUTH_SECRET=<random_32_char_secret>
NEXTAUTH_URL=http://localhost:3000
```

## Project Structure

```
app/
  page.tsx                  # Landing page
  dashboard/page.tsx        # Activity list
  receipt/[id]/page.tsx     # Receipt customizer
  api/
    auth/                   # Login, callback, logout, session
    strava/                 # Activities & activity detail proxy
components/
  receipt/                  # Receipt, SplitsTable, HRZones, PaceChart, etc.
lib/
  auth.ts                   # Session helpers
  strava.ts                 # Strava API calls & data transformers
  receipt-config.ts         # Themes, modules, defaults
  session.ts                # Iron-session config
types/
  strava.ts                 # TypeScript types
e2e/                        # Playwright E2E & visual regression tests
```

## Testing

### Unit Tests (Jest)

```bash
npm test                    # Run all unit tests
npm run test:coverage       # Run with HTML coverage report
```

Coverage report is generated at `coverage/lcov-report/index.html`.

### E2E Tests (Playwright)

```bash
npm run test:e2e            # Run E2E tests headless
npm run test:e2e:ui         # Run with interactive UI
```

### Visual Regression Tests

```bash
npm run test:visual:update  # Generate/update baseline screenshots
npm run test:visual         # Compare against baselines
```

Baseline screenshots are stored in `e2e/visual.spec.ts-snapshots/` — commit these to git.

### All Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Unit tests (Jest) |
| `npm run test:coverage` | Unit tests with coverage |
| `npm run test:e2e` | E2E tests (Playwright) |
| `npm run test:e2e:ui` | E2E tests with UI |
| `npm run test:visual` | Visual regression tests |
| `npm run test:visual:update` | Update visual baselines |

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by [husky](https://typicode.github.io/husky/) + [commitlint](https://commitlint.js.org/).

```
type(scope): description

# Examples
feat: add PDF export
fix(receipt): correct pace calculation
test: add visual regression for neon theme
refactor(dashboard): extract activity card
docs: update README
chore: update dependencies
```

Pre-commit hooks run `lint` and `test` automatically.

## Deploy on Vercel

```bash
npm run build
```

Or deploy directly via the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
