
help:
	@echo "Build Commands"
	@echo "--------------"
	@echo "make build-frontend   - Build Vue.js frontend"
	@echo "make build-backend    - Build Rust backend"
	@echo "make build-all        - Build both frontend and backend"

build-frontend:
	cd frontend && npm run build

build-backend:
	cargo build

build-all: build-frontend build-backend

.PHONY: help build-frontend build-backend build-all
