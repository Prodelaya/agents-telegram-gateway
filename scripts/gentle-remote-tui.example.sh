#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${1:-}"
BASE_DIR="${AGTG_BASE_DIR:-/home/prodelaya/proyectos}"
PORT="${AGTG_TUI_PORT:-4201}"

if [[ -z "$PROJECT_NAME" ]]; then
  echo "Usage: gentle-remote-tui.example.sh <project-relative-path>" >&2
  exit 1
fi

PROJECT_PATH="$(realpath "$BASE_DIR/$PROJECT_NAME")"
BASE_REAL="$(realpath "$BASE_DIR")"

case "$PROJECT_PATH" in
  "$BASE_REAL"/*) ;;
  *) echo "Project escapes base dir: $PROJECT_NAME" >&2; exit 1 ;;
esac

cd "$PROJECT_PATH"

export OPENCODE_CONFIG_CONTENT='{"default_agent":"gentle-orchestrator"}'

exec opencode . \
  --agent gentle-orchestrator \
  --hostname 127.0.0.1 \
  --port "$PORT"
