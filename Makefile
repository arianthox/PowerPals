SHELL := /bin/bash
.DEFAULT_GOAL := help

DB_URL ?= file:./packages/db/dev.sqlite

.PHONY: help setup deps prisma db-migrate dev lint typecheck test build check clean

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

clean: ## Remove node_modules and build artifacts
	rm -rf node_modules
	find . -type d -name dist -prune -exec rm -rf {} +
	find . -type d -name coverage -prune -exec rm -rf {} +
