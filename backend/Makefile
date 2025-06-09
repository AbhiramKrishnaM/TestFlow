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
	@echo "  help         - Show this help message"

# Default target
.DEFAULT_GOAL := help 