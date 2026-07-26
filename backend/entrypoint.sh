#!/bin/sh
set -e

python fetch_weights.py

exec uvicorn main:app --host 0.0.0.0 --port 8000
