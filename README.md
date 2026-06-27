# OCP Mastery — OpenShift Learning Hub

Education site for support engineers, L3 staff, and anyone studying for Red Hat OpenShift Administration (DO180 / OCP 4.18).

Built with **React + IBM Carbon Design System**, served by `nginx-unprivileged` on OpenShift.

## Live site

**[ocp-review.yamlwrangler.com](https://ocp-review.yamlwrangler.com)**

## Features

- **Resource Library** — 13 topic areas: K8s architecture, workloads, networking, storage, RBAC, log collection & must-gather, advanced CLI, debug workflows, and pro tips
- **Flashcards** — 66 multiple-choice cards with explanations and doc links; filterable by category; Prev/Next navigation; keyboard shortcuts (← → Enter 1–4)
- **Walkthroughs** — 17 step-by-step guides from basic deployments to Operators, SCC, monitoring, and multi-stage builds
- **Glossary** — 200+ terms with category filters, live search, and A–Z jump sidebar
- **Troubleshooting** — 12 sections, basic + expert commands, one-click copy via Carbon `CodeSnippet`
- Light / dark mode toggle (defaults to light)

## Stack

| Layer | Technology |
|---|---|
| UI framework | React 18 + Vite |
| Design system | `@carbon/react` v11 (IBM Carbon) |
| Styles | SCSS with Carbon tokens + Red Hat red brand overrides |
| Server | `nginxinc/nginx-unprivileged:alpine` on port 8080 |
| Image | `fumbles/ocp-review:latest` |
| Platform | OpenShift (non-root SCC compatible) |

## Repository layout

```
├── app/                        # React + Carbon source (primary app)
│   ├── src/
│   │   ├── main.jsx            # Entry point
│   │   ├── App.jsx             # Carbon Theme wrapper, dark/light state
│   │   ├── components/
│   │   │   ├── Shell.jsx       # Header, SideNav, Content
│   │   │   └── pages/
│   │   │       ├── HomePage.jsx
│   │   │       ├── LearnPage.jsx
│   │   │       ├── FlashcardsPage.jsx
│   │   │       ├── WalkthroughsPage.jsx
│   │   │       ├── GlossaryPage.jsx
│   │   │       └── TroubleshootingPage.jsx
│   │   ├── data/               # ES module data (topics, flashcards, etc.)
│   │   └── styles/             # SCSS partials per page
│   ├── Dockerfile              # Two-stage: node build → nginx serve
│   ├── nginx.conf              # SPA fallback, hashed-asset caching
│   ├── build.sh                # buildx wrapper → fumbles/ocp-review:latest
│   └── deployment.yaml         # Deployment + Service + Route (test/staging)
├── deployment.yaml             # Production Deployment + Service + Route
├── external-route.yaml         # External Route → ocp-review.yamlwrangler.com
├── Dockerfile                  # Production image build (delegates to app/)
├── build.sh                    # Production build & push script
│
│   (legacy static site — kept for reference)
├── index.html
├── css/styles.css
├── js/app.js
└── js/data/                    # Source of truth for all content
    ├── topics.js               # 13 topic areas
    ├── flashcards.js           # 66 flashcards
    ├── walkthroughs.js         # 17 walkthroughs
    ├── glossary.js             # 200+ glossary terms
    └── troubleshooting.js      # 12 troubleshooting sections
```

> **Content source of truth:** All data lives in `js/data/`. The Carbon app imports
> from `app/src/data/` which is kept in sync from `js/data/` via a simple `sed` export.

## Build & deploy

```bash
# Build and push fumbles/ocp-review:latest (multi-platform amd64+arm64)
cd app
./build.sh

# Deploy to OpenShift
oc apply -f deployment.yaml        # from repo root (production manifest)
oc rollout restart deployment/ocp-review
oc rollout status deployment/ocp-review
```

## Update content

All content is in `js/data/*.js`. After editing, sync to the Carbon app:

```bash
# Sync a single file (example: topics)
sed 's/^const topics = /export const topics = /' \
  js/data/topics.js > app/src/data/topics.js

# Sync all five data files at once
for f in topics flashcards walkthroughs glossary troubleshooting; do
  var=$(head -10 js/data/${f}.js | grep "^const " | sed 's/const \(\w*\).*/\1/')
  sed "s/^const ${var} = /export const ${var} = /" \
    js/data/${f}.js > app/src/data/${f}.js
done
```

Then rebuild and redeploy.

## Log Collection & Must-Gather

The **Log Collection & Must-Gather** topic covers:

- `oc adm must-gather` — basic flags, `--volume-percentage`, `--image-stream`, `--dest-dir`
- Component-specific gatherers — ODF, OADP (Backup & Restore), OpenShift Virtualization (KubeVirt), ACM, Logging, RHACS
- Dynamic must-gather script — auto-discovers all must-gather images from installed CSVs using `jq`
- `oc adm inspect` — targeted single-resource collection
- `sosreport` — node-level OS diagnostics via `oc debug node/`
- **AI-powered support review** — `quay.io/pg.next/pg-must-gather` + upload to [access.redhat.com/support/cases/#/analyze](https://access.redhat.com/support/cases/#/analyze)
  - Docs: [Red Hat Technical Supportability Review with AI](https://access.redhat.com/solutions/7141255)
