#!/bin/sh
# Dockerfile entrypoint script
set -e

# Read meteor settings
if [ -z "$METEOR_SETTINGS" ]; then
  if [ -n "$METEOR_SETTINGS_FILE" ] && [ -f "$METEOR_SETTINGS_FILE" ]; then
    export METEOR_SETTINGS="$(cat "$METEOR_SETTINGS_FILE")"
  elif [ -f "/build/settings.json" ]; then
    export METEOR_SETTINGS="$(cat /build/settings.json)"
  fi
fi

exec node main.js
