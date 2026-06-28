#!/usr/bin/env bash
set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────
IMAGE="fumbles/ocp-review"
DEFAULT_TAG="latest"

# ─── Args ────────────────────────────────────────────────────────────────────
TAG="${1:-$DEFAULT_TAG}"
PLATFORM="${2:-linux/amd64,linux/arm64}"

# ─── Helpers ─────────────────────────────────────────────────────────────────
red()   { echo -e "\033[0;31m$*\033[0m"; }
green() { echo -e "\033[0;32m$*\033[0m"; }
bold()  { echo -e "\033[1m$*\033[0m"; }
step()  { echo -e "\n\033[1;34m▶ $*\033[0m"; }

# ─── Pre-flight ───────────────────────────────────────────────────────────────
step "Pre-flight checks"

if ! command -v docker &>/dev/null; then
  red "Docker is not installed or not in PATH."
  exit 1
fi

if ! docker info &>/dev/null; then
  red "Docker daemon is not running. Start Docker Desktop and try again."
  exit 1
fi

if [ ! -f "app/package.json" ]; then
  red "app/package.json not found. Run this script from the repo root."
  exit 1
fi

green "✓ Docker is running"
green "✓ app/package.json found"

# ─── Local Vite build ────────────────────────────────────────────────────────
# Build dist/ on the host so the Dockerfile never needs to run Node under QEMU.
# (QEMU + node:alpine segfaults on amd64 cross-builds from ARM hosts.)
step "Building Vite app locally (avoids QEMU segfault on cross-platform builds)"
(cd app && npm ci --prefer-offline && npm run build)
green "✓ app/dist is ready"

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
bold "Build summary"
echo "  Image    : ${IMAGE}:${TAG}"
echo "  Platform : ${PLATFORM}"
echo "  Context  : $(pwd)"
echo ""
read -r -p "Proceed? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

# ─── Build & Push ─────────────────────────────────────────────────────────────
step "Building and pushing ${IMAGE}:${TAG}"

if docker buildx version &>/dev/null; then
  docker buildx build \
    --platform "$PLATFORM" \
    -t "${IMAGE}:${TAG}" \
    --push \
    .
else
  echo "buildx not available — falling back to single-platform build"
  docker build -t "${IMAGE}:${TAG}" .
  step "Pushing ${IMAGE}:${TAG}"
  docker push "${IMAGE}:${TAG}"
fi

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
green "✓ Done!"
echo ""
echo "  Pull with : docker pull ${IMAGE}:${TAG}"
echo "  Run with  : docker run -p 8080:8080 ${IMAGE}:${TAG}"
echo "  Open      : http://localhost:8080"
echo ""
echo "  Deploy    : oc apply -f deployment.yaml"
echo "  Rollout   : oc rollout restart deployment/ocp-review"
echo ""
echo "  Docker Hub: https://hub.docker.com/r/fumbles/ocp-review"
