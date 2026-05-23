#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yaml"

log() { printf '==> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  die "Run as root: sudo ${SCRIPT_DIR}/$(basename "$0")"
fi

if ! command -v docker >/dev/null 2>&1; then
  die "docker is not installed or not in PATH"
fi

if ! docker compose version >/dev/null 2>&1; then
  die "docker compose plugin is not available"
fi

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  die "compose file not found: ${COMPOSE_FILE}"
fi

log "Loading NFS kernel modules on the host"
for module in nfs nfsd; do
  if lsmod | awk '{print $1}' | grep -qx "${module}"; then
    log "${module} already loaded"
  else
    modprobe "${module}" || die "failed to load kernel module: ${module}"
    log "loaded ${module}"
  fi
done

EXPORT_DIR="/STORAGE1/uet-nfs/storages/minio-01"
if [[ ! -d "${EXPORT_DIR}" ]]; then
  log "Creating export directory ${EXPORT_DIR}"
  mkdir -p "${EXPORT_DIR}"
fi

log "Starting NFS stack with docker compose"
docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans

sleep 3
docker compose -f "${COMPOSE_FILE}" ps -a

if docker compose -f "${COMPOSE_FILE}" ps --status running --format '{{.Name}}' | grep -qx nfs; then
  log "NFS server is running"
  docker compose -f "${COMPOSE_FILE}" logs nfs --tail=15
else
  die "NFS container did not stay up; check: docker compose -f ${COMPOSE_FILE} logs nfs"
fi
