#!/bin/sh
set -eu

: "${DEEPFAKE_MODE:=local-gpu}"
: "${INFERENCE_BACKEND_MODAL:=false}"
: "${FALLBACK_TO_LOCAL:=false}"

is_truthy() {
  case "$1" in
    1|true|TRUE|True|yes|YES|Yes|on|ON|On) return 0 ;;
    *) return 1 ;;
  esac
}

if is_truthy "$INFERENCE_BACKEND_MODAL" && ! is_truthy "$FALLBACK_TO_LOCAL"; then
  echo "Modal mode: fetching model metadata only (weights served by Modal)."
  python fetch_weights.py --metadata-only
else
  python fetch_weights.py
fi

exec uvicorn main:app --host 0.0.0.0 --port 8000
