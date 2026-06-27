# Carbon App — `app/`

Vite + React + `@carbon/react` version of OCP Mastery. Developed and deployed
independently of the static site at the repo root.

## Local dev

```bash
cd app
npm install          # first time only
npm run dev          # http://localhost:5173
```

## Build image & push

```bash
cd app
chmod +x build.sh
./build.sh           # defaults: fumbles/ocp-review:carbon, linux/amd64+arm64
./build.sh v0.1.0    # specific tag (also re-tags as latest)
```

The `Dockerfile` inside `app/` is a two-stage build:

1. **Stage 1 (builder)** — `node:22-alpine` runs `npm ci && npm run build` → produces `dist/`
2. **Stage 2 (serve)** — `nginxinc/nginx-unprivileged:alpine` serves `dist/` on port **8080**
   (non-root, compatible with OpenShift restricted SCC)

## Deploy to OpenShift (test environment)

All manifests live under `app/`. They use separate names from the production
static site (`ocp-review`) so both can coexist in the same namespace.

| Resource | Name | Notes |
|---|---|---|
| Deployment | `ocp-mastery-carbon` | 1 replica, `fumbles/ocp-review:carbon` |
| Service | `ocp-mastery-carbon` | port 80 → 8080 |
| Route (internal) | `ocp-mastery-carbon` | auto-assigned cluster hostname, TLS edge |
| Route (external) | `ocp-review-carbon-public` | `carbon.yamlwrangler.com`, TLS edge |

```bash
# Apply everything (Deployment + Service + internal Route)
oc apply -f app/deployment.yaml

# Add the external public route (requires DNS CNAME → cluster router)
oc apply -f app/external-route.yaml

# Verify
oc get route ocp-mastery-carbon
oc get route ocp-mastery-carbon-public

# Rollout a new image tag
oc set image deployment/ocp-mastery-carbon \
  ocp-mastery-carbon=fumbles/ocp-review:<new-tag>
oc rollout status deployment/ocp-mastery-carbon
```

## File layout

```
app/
├── Dockerfile            # two-stage: node build → nginx serve
├── nginx.conf            # port 8080, SPA fallback, Vite hashed-asset cache
├── deployment.yaml       # Deployment + Service + internal Route
├── external-route.yaml   # External Route → carbon.yamlwrangler.com
├── build.sh              # docker buildx wrapper
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx           # React entry point
    ├── App.jsx            # Theme wrapper
    ├── styles/
    │   ├── index.scss     # @use '@carbon/react' + brand overrides
    │   └── _pages.scss    # page-specific styles
    ├── components/
    │   ├── Shell.jsx      # Carbon Header + SideNav + Content
    │   └── pages/
    │       ├── HomePage.jsx
    │       ├── LearnPage.jsx
    │       ├── FlashcardsPage.jsx
    │       ├── WalkthroughsPage.jsx
    │       ├── GlossaryPage.jsx
    │       └── TroubleshootingPage.jsx
    └── data/              # (future) ES module data imports
```

## Image tags on Docker Hub (`fumbles/ocp-review`)

| Tag | Source | Description |
|---|---|---|
| `latest` | root `build.sh` | Current production static site |
| `carbon` | `app/build.sh` | Carbon/React test build |

## DNS setup for `carbon.yamlwrangler.com`

Add a CNAME in your DNS provider pointing `carbon.yamlwrangler.com` to the
OpenShift router's wildcard hostname (same target as `ocp-review.yamlwrangler.com`).
