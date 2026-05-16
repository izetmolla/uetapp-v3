#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export DOCKER_BUILDKIT=1
# Host resolv.conf often lists cluster DNS (e.g. 10.96.0.10); from the docker bridge
# network that path can be slow or fail for external hosts. Host networking matches
# the shell and avoids stuck `apk`/`go mod download` steps.
docker build --network=host -f app/Dockerfile -t registry-01.flowtrove.com/uetedu/app:latest .
docker push registry-01.flowtrove.com/uetedu/app:latest
kubectl rollout restart deployment app -n flowtrove
watch kubectl get pods -o wide -n flowtrove
