# Masajid — Prayer Preview

Standalone preview of the **`/v-2/prayer`** experience, extracted from the main
Masajid frontend. Runs entirely on **mock data** — no backend required.

## Pages

| Route             | Description                    |
| ----------------- | ------------------------------ |
| `/`               | Mosque info, needs & community |
| `/events`         | Events list                    |
| `/events/[id]`    | Event detail                   |
| `/donate`         | Donation campaigns             |
| `/issues`         | Maintenance issues list        |
| `/issues/[id]`    | Issue detail                   |
| `/issues/create`  | Create a new issue             |

The prayer experience lives at the root — no `/v-2/prayer` prefix. The shared
layout (header + bottom nav) is in the `app/(prayer)/` route group, which has no
effect on the URL.

## Run

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Mock data

All data is served by the service layer in `services/`. Mock responses are
returned whenever `NEXT_PUBLIC_APP_ENV=development` (set in `.env.local`):

- `services/v-2/prayer/donation.service.ts` — donation campaigns
- `services/v-2/prayer/event.service.ts` — events
- `services/v-2/prayer/issues.service.ts` — maintenance orders
- `services/asset.service.ts` — product/asset list for the create form
- `app/(prayer)/page.tsx` — mosque info & community (inline mock)

Edit those files to change the preview content. Placeholder images live in
`public/assets/examples/`.

## Notes

- No authentication, no API calls — purely a UI preview.
- Arabic (RTL) and English are both supported via the language switcher.
- This is a copy of the shared UI/lib/components from the main project; keep it
  in sync manually if the source changes.
