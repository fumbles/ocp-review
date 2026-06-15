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

if [ ! -f "index.html" ]; then
  red "index.html not found. Run this script from the ocp-education directory."
  exit 1
fi

green "✓ Docker is running"
green "✓ index.html found"

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

# Use buildx for multi-platform; falls back gracefully if buildx not available
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

# ─── Also tag as latest if a specific tag was given ───────────────────────────
if [ "$TAG" != "latest" ]; then
  step "Also tagging as latest"
  docker buildx build \
    --platform "$PLATFORM" \
    -t "${IMAGE}:latest" \
    --push \
    . 2>/dev/null || \
  docker tag "${IMAGE}:${TAG}" "${IMAGE}:latest" && \
  docker push "${IMAGE}:latest"
fi

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
green "✓ Done!"
echo ""
echo "  Pull with : docker pull ${IMAGE}:${TAG}"
echo "  Run with  : docker run -p 8080:80 ${IMAGE}:${TAG}"
echo "  Open      : http://localhost:8080"
echo ""
echo "  Docker Hub: https://hub.docker.com/r/fumbles/ocp-review"
