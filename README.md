# OCP Mastery — OpenShift DO180 Learning Hub

A self-contained education site for support agents and Level 3 engineers preparing for Red Hat OpenShift Administration (DO180 / OCP 4.18).

## Features

- **Resource Library** — 12 topic areas covering K8s architecture, workloads, networking, storage, RBAC, troubleshooting, advanced CLI, debug workflows, and pro tips
- **Flashcards** — 66 multiple-choice cards with explanations and doc links; filterable by K8s Core, OpenShift, Networking, Storage, HA, CLI, and Advanced
- **Walkthroughs** — 17 step-by-step guides from basic deployments to Operators, SCC, monitoring, and multi-stage builds
- **Glossary** — 140+ terms with category filters, live search, and an A–Z jump sidebar
- Dark / light mode toggle

## Stack

- Vanilla HTML/CSS/JS — no build step, no framework
- Served by `nginxinc/nginx-unprivileged:alpine` on port 8080 (OpenShift non-root SCC compatible)
- Image: `fumbles/ocp-review`

## File Structure

```
├── index.html              # App shell + nav
├── css/
│   └── styles.css          # All styles + dark/light theme variables
├── js/
│   ├── app.js              # All page logic
│   └── data/
│       ├── topics.js       # Learn page content
│       ├── flashcards.js   # Flashcard definitions
│       ├── walkthroughs.js # Walkthrough steps
│       └── glossary.js     # Glossary terms
├── nginx.conf              # SPA routing + gzip + security headers
├── Dockerfile
├── build.sh                # Multi-platform buildx build + push
└── deployment.yaml         # Deployment, Service, Route (TLS edge)
```

## Build & Deploy

```bash
# Build and push multi-platform image
./build.sh

# Deploy to OpenShift
oc apply -f deployment.yaml

# After updating the image
oc rollout restart deployment/ocp-review
```

The deployment runs 2 replicas with rolling updates, readiness/liveness probes, and a TLS edge Route.
