#!/usr/bin/env bash
set -euo pipefail

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required. Install it with corepack or npm." >&2
  exit 1
fi

cp -n .env.example .env || true
cp -n config/agents-telegram-gateway.example.yaml config/agents-telegram-gateway.local.yaml || true

pnpm install

echo "Bootstrap complete."
echo "Edit .env and config/agents-telegram-gateway.local.yaml, then run:"
echo "pnpm dev -- --config config/agents-telegram-gateway.local.yaml"
