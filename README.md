# happilab-admin

The admin website for the AC Falcon Crest referral app: React 19, Refine,
Ant Design, Recharts, Vite, TypeScript. It is where the programme is run —
members, products, orders, cash-outs, content, the support desk, staff,
the audit log, and the settings the app reads at launch. Every record,
figure and sign-in comes from the API in the sibling project `../backend`;
nothing is bundled.

The look follows one reference: a dark rounded frame on a lime page, a
white content panel, cards with an icon in a circle, big figures with lime
delta chips, lavender and lime accents on a dark chart. `src/styles/` holds
it as plain CSS on custom properties; `src/theme.ts` dresses Ant Design's
tables and forms in the same palette, so the two never look like two apps.

## Run

Start the API first (`cd ../backend && npm run dev`; its README covers the
`.env` and the seed that creates the owner account), then:

```bash
npm install
npm run dev        # http://localhost:5173, talking to http://localhost:8080
```

The API's address is a build-time setting, read once in `src/lib/config.ts`:

```bash
VITE_API_BASE_URL=https://api.example.com npm run build
```

Sign in with the owner's email and password; a six-digit code follows by
email — in development the API prints it in its own terminal. Set
`VITE_GOOGLE_CLIENT_ID` (and the same id on the API) to show "Continue
with Google". A support account added on the Staff page is pending until
the person enters the code emailed to them, with a password of their own,
at `/login/activate`; the owner can resend the code from the list.

Two levels of staff: the owner, one account that runs everything, and
support accounts, as many as the desk needs, which the Staff page adds.
Access is per account: the Staff page sets which pages each support
account may open, and the sidebar, the routes, the dashboard's cards and
the search follow; the API enforces the same list on every route, and
keeps money, the catalogue, the copy, the settings and the staff list to
the owner.

## How it talks to the API

- `src/lib/api.ts` is the one HTTP client: JSON in and out, the bearer
  token, one renewal and retry on a 401, and the API's own sentence on a
  refusal. `src/providers/tokens.ts` keeps the token pair and renews it
  before it runs out, one renewal at a time.
- `src/providers/dataProvider.ts` speaks Refine's contract over the API's
  one list dialect — `?page&per_page&sort&order&q` plus named filters,
  `{ items, total }` back — and converts once at the edge: records arrive
  camelCase and leave snake_case, so no page spells a wire name.
- `src/providers/authProvider.ts` is the two-step sign-in, the session
  check, the identity (read once per session), forgot and reset.
- What is not a record's CRUD goes through small hooks on the same client:
  `useStats` (the dashboard, polled every 15 s), `useSearch` (the top bar),
  `useSettings`, `useDesk` (the support queue and threads, polled every
  4 s until a push channel), `uploads.ts` (a signed upload straight into
  storage; the API's refusal is shown when storage is not configured).

## Layout

```
src/
  App.tsx              Refine root: resources, routes, providers, theme
  theme.ts             Ant Design tokens in the dashboard's palette
  styles/              frame, dashboard widgets, lists, login
  layout/              the dark frame, sidebar and top bar
  components/          Card, Stat, PageHead, ListCard, StatusTag
  pages/               one folder per sidebar entry
  providers/           auth, data, access control, tokens, session hook
  data/types.ts        the API's records as the pages read them
  lib/                 the HTTP client, case conversion, hooks, formatting
```

## Check

```bash
npm run typecheck
npm run build
```

`../backend/ADMIN.md` lists the staff routes, roles, settings keys and the
upload flow this UI is shaped around.
