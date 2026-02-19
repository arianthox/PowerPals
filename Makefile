SHELL := /bin/bash
.DEFAULT_GOAL := help

DB_URL ?= file:./packages/db/dev.sqlite

.PHONY: help setup deps prisma db-migrate dev lint typecheck test build check clean doctor reinstall-native

help: ## Show available targets
	@grep -E '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

deps: ## Install npm dependencies
	npm install

prisma: ## Generate Prisma client
	npm run prisma:generate -w @agent-battery/db

db-migrate: ## Run Prisma migrations (uses DB_URL)
	DATABASE_URL="$(DB_URL)" npm run prisma:migrate -w @agent-battery/db

setup: deps prisma ## Install deps + generate Prisma client

dev: ## Run desktop app in dev mode
	npm run dev -w @agent-battery/desktop

lint: ## Run eslint across workspaces
	npm run lint

typecheck: ## Run TypeScript checks across workspaces
	npm run typecheck

test: ## Run tests (uses DB_URL)
	DATABASE_URL="$(DB_URL)" npm test

build: ## Build all workspaces
	npm run build

check: lint typecheck test ## Run lint + typecheck + test

doctor: ## Diagnose macOS Node/Rosetta/esbuild architecture issues
	@echo "System arch:      $$(uname -m)"
	@echo "Shell arch:       $$(arch)"
	@echo "Node arch:        $$(node -p 'process.arch')"
	@echo "npm arch:         $$(npm config get arch 2>/dev/null || echo unknown)"
	@echo "Node version:     $$(node -v)"
	@echo "npm version:      $$(npm -v)"
	@echo "esbuild bins:"
	@ls -1 node_modules/tsx/node_modules/@esbuild 2>/dev/null || echo "  (tsx/esbuild not installed yet)"
	@NODE_ARCH=$$(node -p 'process.arch'); \
	if [ "$$NODE_ARCH" = "arm64" ] && [ -d node_modules/tsx/node_modules/@esbuild/darwin-x64 ]; then \
		echo "⚠️  Detected x64 esbuild with arm64 Node (Rosetta mismatch). Run: make reinstall-native"; \
	elif [ "$$NODE_ARCH" = "x64" ] && [ -d node_modules/tsx/node_modules/@esbuild/darwin-arm64 ]; then \
		echo "⚠️  Detected arm64 esbuild with x64 Node (Rosetta mismatch). Run: make reinstall-native"; \
	else \
		echo "✅ No obvious esbuild architecture mismatch detected."; \
	fi

reinstall-native: ## Clean install for current Node architecture (fixes esbuild mismatch)
	rm -rf node_modules apps/*/node_modules packages/*/node_modules package-lock.json
	npm install

clean: ## Remove node_modules and build artifacts
	rm -rf node_modules
	find . -type d -name dist -prune -exec rm -rf {} +
	find . -type d -name coverage -prune -exec rm -rf {} +
