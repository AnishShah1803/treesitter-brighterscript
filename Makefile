.PHONY: all generate test clean verify verify-bsc verify-parse

# Default target
all: generate test

# Generate the parser from grammar.js
generate:
	npx tree-sitter generate

# Run the test suite
test:
	npx tree-sitter test

# Parse a specific file (usage: make parse FILE=path/to/file.brs)
parse:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make parse FILE=path/to/file.brs"; \
		exit 1; \
	fi
	npx tree-sitter parse $(FILE)

# Clean generated files (keeps grammar.js)
clean:
	rm -f src/grammar.json src/node-types.json src/parser.c
	rm -rf src/tree_sitter

# Initialize tree-sitter project (if needed)
init:
	npx tree-sitter init

# Highlight a file (usage: make highlight FILE=path/to/file.brs)
highlight:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make highlight FILE=path/to/file.brs"; \
		exit 1; \
	fi
	npx tree-sitter highlight $(FILE)

# Cross-validate fixtures against BrighterScript compiler (brighterscript@1.0.0-alpha.50)
verify: verify-bsc verify-parse
	@echo "All verification checks passed."

# Verify fixtures parse without errors in the reference BrighterScript compiler
verify-bsc:
	@echo "==> Verifying fixtures with bsc (brighterscript@1.0.0-alpha.50)..."
	npx bsc --project test/fixtures/bsconfig.json --diagnosticLevel warn
	@echo "    bsc: OK"

# Verify fixtures parse without errors in tree-sitter
verify-parse: generate
	@echo "==> Verifying fixtures with tree-sitter parser..."
	@fail=0; \
	for f in test/fixtures/*.bs; do \
		output=$$(npx tree-sitter parse "$$f" 2>&1); \
		if echo "$$output" | grep -q "ERROR\|MISSING"; then \
			echo "    FAIL: $$f"; \
			echo "$$output" | grep "ERROR\|MISSING"; \
			fail=1; \
		else \
			echo "    OK: $$f"; \
		fi; \
	done; \
	if [ $$fail -eq 1 ]; then \
		echo "    tree-sitter: SOME FILES FAILED"; \
		exit 1; \
	fi; \
	echo "    tree-sitter: OK"
