PYTHON ?= python3
PYTEST ?= $(PYTHON) -m pytest

.PHONY: all pipeline test-pipeline web-build test-web test build clean preview

all: pipeline web-build test

pipeline:
	@echo "===> Running NISAR ChangeLens Scientific Pipeline (Dry-Run & Integrity Verification)..."
	@PYTHONPATH=. $(PYTHON) pipeline/extract_mask_pair.py
	@PYTHONPATH=. $(PYTHON) pipeline/extract_verified_pair.py

test-pipeline:
	@echo "===> Running Pipeline Tests..."
	@PYTHONPATH=. $(PYTEST) -q tests/pipeline

web-build:
	@echo "===> Building Frontend Static Application..."
	@cd frontend && npm run build

test-web:
	@echo "===> Running Frontend Unit Tests..."
	@cd frontend && npm run test

test: test-pipeline test-web

build: pipeline web-build

preview:
	@echo "===> Starting local preview server on http://127.0.0.1:4173..."
	@cd frontend && npm run preview -- --port 4173 --host 127.0.0.1

clean:
	rm -rf frontend/dist .pytest_cache frontend/node_modules/.vite
