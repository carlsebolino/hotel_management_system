.PHONY: install-dev format format-check lint test build verify

install-dev:
	python -m pip install -r requirements-dev.txt
	cd frontend && npm install

format:
	python -m ruff check --fix app config.py main.py tests
	python -m black app config.py main.py tests
	cd frontend && npm run format

format-check:
	python -m ruff format --check app config.py main.py tests
	python -m black --check app config.py main.py tests
	cd frontend && npm run format:check

lint:
	python -m ruff check app config.py main.py tests
	cd frontend && npm run lint

test:
	python -m unittest discover -s tests

build:
	cd frontend && npm run build

verify: format-check lint test build
