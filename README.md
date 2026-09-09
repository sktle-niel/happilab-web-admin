# happilab-admin

The admin website for the AC Falcon Crest referral app: React 19, Refine,
Ant Design, Recharts, Vite, TypeScript. It is where the programme is run —
members, products, orders, cash-outs, content, the support desk, staff,
the audit log, and the settings the app reads at launch.

The look follows one reference: a dark rounded frame on a lime page, a
white content panel, cards with an icon in a circle, big figures with lime
delta chips, lavender and lime accents on a dark chart. `src/styles/` holds
it as plain CSS on custom properties; `src/theme.ts` dresses Ant Design's
tables and forms in the same palette, so the two never look like two apps.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

Without defines the admin runs on bundled data (`src/data/fake/`) and lets
any email with a 12-character password in. Pointing it at the API is a
build-time switch, mirroring the app's `BACKEND` define:

```bash
VITE_BACKEND=api VITE_API_BASE_URL=https://api.example.com npm run build
```

To review pages without signing in, run with `VITE_SKIP_AUTH=1`. It is
honoured only on bundled data; the API build never skips sign-in.

Access is per account: the Staff page sets which pages each one may
open, and the sidebar, the routes and the dashboard follow. On bundled
data, sign in as `paolo@falconcrest.ph` (support) or `maria@falconcrest.ph`
(admin) with any 12-character password and code `123456` to see the
narrower views; any other address signs in as the owner.

## Layout

```
src/
  App.tsx              Refine root: resources, routes, providers, theme
  theme.ts             Ant Design tokens in the dashboard's palette
  styles/              frame, dashboard widgets, lists, login
  layout/              the dark frame, sidebar and top bar
  components/          Card, Stat, PageHead, ListCard, StatusTag
  pages/               one folder per sidebar entry
  providers/           auth and data providers (fake today, API next)
  data/fake/           the bundled tables and dashboard figures
  lib/                 formatting and a seeded generator
```

## Check

```bash
npm run typecheck
npm run build
```

The backend this admin will talk to is the sibling project `../backend`;
its `ADMIN.md` lists the staff routes, roles, settings keys and the upload
flow this UI is shaped around.
