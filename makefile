.PHONY: check preview

# Run every gate in tests/. Always run this before committing.
check:
	node tests/run.mjs

# Serve the site at http://localhost:5500 (clean URLs are rewritten by local-routing.js).
preview:
	python3 -m http.server 5500
