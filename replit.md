# Wasl Tech Store

Responsive Kuwaiti tech-accessories storefront with accounts, private pending orders, and personal gift cards.

## Run & Operate

- Managed workflows run the API and storefront with their configured `PORT` and `BASE_PATH`.
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `npm run seed` — insert the eight samples only when the development MongoDB product collection is empty; reruns preserve existing products.
- `pnpm --filter @workspace/api-server run test:store` — development API integration checks; creates two synthetic accounts/orders, cleans its own data, and restores reserved stock.
- Required protected Secrets: `MONGODB_URI` (development Atlas database) and `JWT_SECRET`. Never place credentials in ordinary configuration/environment entries, files, or logs.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Store catalog/accounts/orders: MongoDB Atlas + Mongoose. The existing PostgreSQL workspace library is retained but not used by these store features.
- Validation: Zod and Mongoose
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild API module, Vite static HTML/CSS/JS storefront

## Where things live

- Actual store: `artifacts/wasl-storefront/index.html`, `styles.css`, `script.js`; React `src/App.tsx` is not the storefront.
- Backend: `artifacts/api-server/src/routes/`, `models/`, cached connection `lib/db.ts`.
- API contract: `lib/api-spec/openapi.yaml`; regenerate helpers when it changes.
- Sample catalog: backend `src/seed-data.ts` and `src/seed.ts`.

## Architecture decisions

- User explicitly requires JWT in localStorage and `Authorization: Bearer`, not cookie authentication.
- Retain plain HTML/CSS/JS and Express; no Next.js migration, Replit Auth, or substitute database.
- Gift URLs are bearer-access links. Their pages must not load analytics, third-party fonts/assets, or URL-reporting tools. Public gift responses allow only sender name, message, wrap style, and item names.
- Order creation reserves stock and persists the order atomically on Atlas; no payments are taken.

## Product

Database catalog; composable search/category/mood/favorites; cart and quick view; WASL10 discount; delivery validation; signup/login/logout; private My Orders; gift wrapping, copied links, and public keyboard-accessible unwrap.

## User preferences

Preserve the existing design, commercial, mobile accessibility, reduced motion, and three-decimal KWD formatting. No payments or deployment changes were requested.

## Gotchas

- Store prices and totals are integer fils (1/1000 KWD); obtain prices, stock and identity from the server, never client totals/user IDs.
- Seed/tests must target development MongoDB only. The integration test removes only its synthetic accounts/orders.
- Storefront builds require workflow environment; ad hoc example: `PORT=18956 BASE_PATH=/ pnpm --filter @workspace/wasl-storefront run build`.
- Secrets must be read only from `process.env`; check existence without printing values.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
