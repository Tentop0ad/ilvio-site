# ILVIO static site (`ilvio.eu`)

Replacement for the retired Shopify store. **Deadline: DNS must be switched before
22 July 2026**, when the Shopify subscription lapses and ilvio.eu goes dark.

Pure static HTML — no build step at serve time. The legal pages are generated
from the canonical markdown in `appdev/legal/` (see "Regenerating" below).

## Page map

| Path | Purpose | Referenced by |
|---|---|---|
| `/` | Landing page | — |
| `/plans/` | Pricing + Stripe **cancel** return | `create-checkout-session` CANCEL_URL (via `/pages/plans` redirect) |
| `/welcome/` | Stripe **success** / portal return | `create-checkout-session` SUCCESS_URL, `create-portal-session` PORTAL_RETURN_URL (via `/pages/welcome` redirect) |
| `/privacy/` | Privacy Policy | App login + settings links, App Store listing (required) |
| `/terms/` | Terms of Service | App links, store listing |
| `/eula/` | EULA | App Store listing |
| `/delete-account/` | Account deletion instructions | **Required** by App Store Connect ("Account Deletion URL") and Play Console ("Data deletion") |
| `/pages/<slug>/` | Redirect stubs to the paths above | Old Shopify-era URLs, incl. the currently deployed edge-function constants |
| `404.html` | Not-found page | GitHub Pages serves this automatically |

## Deploying (GitHub Pages, free)

1. Create a **public** repo (e.g. `Tentop0ad/ilvio-site`) — Pages is free only on
   public repos for free-plan accounts. This folder's contents are all public
   information anyway.
2. Copy the contents of `site/` to the repo root and push.
3. Repo → Settings → Pages → Source: `main` branch, `/ (root)`.
4. Settings → Pages → Custom domain: `ilvio.eu` (the `CNAME` file here already
   matches). Tick **Enforce HTTPS** once the certificate is issued (can take up
   to ~1 h after DNS propagates).

### DNS at zone.ee

In the zone.ee DNS panel for `ilvio.eu`, **remove the Shopify records**
(A record pointing at Shopify's IP, `www` CNAME to `shops.myshopify.com`) and add:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `<github-username>.github.io.` |

Leave any **MX / mail records untouched** — otherwise info@ilvio.eu breaks.
If Resend DKIM/SPF records have been added for auth emails, leave those too.

## After the switch — verification checklist

- [ ] `https://ilvio.eu/` loads with HTTPS (padlock, no cert warning)
- [ ] `https://ilvio.eu/privacy/`, `/terms/`, `/eula/`, `/delete-account/` render the full documents
- [ ] `https://ilvio.eu/pages/welcome` redirects to `/welcome/`
- [ ] Run a test Stripe checkout from the app → lands on the welcome page
- [ ] Supabase auth `site_url` still `https://ilvio.eu` (no change needed)

## Regenerating the legal pages

When a doc in `appdev/legal/*.md` changes:

```bash
# from the scratchpad dir that has marked installed, or any dir after `npm i marked`
node build-legal.mjs   # script source: see appdev/legal/README.md or session scratchpad
```

The script converts each markdown file, strips anything below
`## Implementation reference` (internal-only), and rewraps it in the shared
page shell. Alternatively, hand-edit the HTML — the wrapper is trivial.

Keep following the workflow in `.claude/CLAUDE.md`: edit the markdown first,
bump the "Last updated" date for material changes, then regenerate + redeploy.
