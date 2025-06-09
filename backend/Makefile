# Backend Makefile

# Variables
PYTHON = python3
PIP = pip

# Commands
.PHONY: install
install:
	$(PIP) install fastapi uvicorn sqlalchemy psycopg pydantic pydantic-settings python-jose passlib python-multipart bcrypt alembic pytest httpx faker

.PHONY: freeze
freeze:
	$(PIP) freeze > requirements.txt

.PHONY: run
run:
	$(PYTHON) -m uvicorn app.main:app --reload

.PHONY: setup-venv
setup-venv:
	$(PYTHON) -m venv venv
	@echo "Virtual environment created. Activate it with: source venv/bin/activate"

.PHONY: test
test:
	pytest

.PHONY: clean
clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name .coverage -exec rm -rf {} +

.PHONY: migrations
migrations:
	alembic revision --autogenerate -m "$(message)"

.PHONY: migrate
migrate:
	alembic upgrade head

.PHONY: init-db
init-db:
	$(PYTHON) init_db.py

.PHONY: create-db
create-db:
	psql -U postgres -c "CREATE DATABASE testflow"

.PHONY: drop-db
drop-db:
	psql -U postgres -c "DROP DATABASE IF EXISTS testflow"

.PHONY: reset-db
reset-db: drop-db create-db migrate init-db

# Help command
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  install      - Install dependencies"
	@echo "  freeze       - Freeze dependencies to requirements.txt"
	@echo "  run          - Run development server"
	@echo "  setup-venv   - Create virtual environment"
	@echo "  test         - Run tests"
	@echo "  clean        - Clean up temporary files"
	@echo "  migrations   - Generate database migrations (use with message='Description')"
	@echo "  migrate      - Apply database migrations"
	@echo "  init-db      - Initialize database with default data"
	@echo "  create-db    - Create database"
	@echo "  drop-db      - Drop database"
	@echo "  reset-db     - Reset database (drop, create, migrate, init)"
	@echo "  help         - Show this help message"

# Default target
.DEFAULT_GOAL := help 