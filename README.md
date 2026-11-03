# Windows CMD Playground — modular edition

Original `index.html` split into independent CSS, data, core and UI modules. No npm dependency or server-side code.

## Run locally

```bash
python -m http.server 8000
```

Open `http://localhost:8000/`. Do not open through `file://` because ES modules need an HTTP server.

## GitHub Pages

Publish the repository root (or `/docs` if you move the entire app there). The `./` relative URLs work for a Pages project URL.

## Architecture

- `js/data/commands.js`: command documentation and validators
- `js/data/origins.js`: name etymology
- `js/core/state.js`: virtual initial machine state
- `js/core/filesystem.js`: virtual paths and mutations
- `js/core/parser.js`: parsing and command suggestions
- `js/core/executor.js`: execution, pipe and redirect processing
- `js/ui/`: menu, documentation, explorer and terminal
- `js/main.js`: wires modules and boots application

Batch support is NOT implemented. The engine and UI have distinct modules, but the executor still calls UI through callbacks; a later enhancement can return `{stdout,stderr,exitCode}` as a pure result object.

This app simulates commands; it never executes actual Windows commands.

## Security notes

- A restrictive meta Content Security Policy is included. It blocks outgoing connections and untrusted scripts, but is not a substitute for server-level headers or application review.
- The virtual filesystem is in browser memory; it never touches local Windows paths.
- User-entered terminal output uses `textContent`; explorer names are HTML-escaped. Command documentation HTML originates from in-repository static strings.
- Security testing includes checks for `eval`, dynamic code execution, network APIs, safe rendering and CSP.
- The interpreter intentionally models a limited subset of CMD. Repeated/huge user input and crafted regular expressions can still cause browser performance problems; input limits and more complex sandbox isolation are future work.
- No external JS packages are loaded. Do not use `innerHTML` for untrusted strings in future contributions.

## Tests

`npm test` (requires Node.js; no `npm install` required). Browser-level end-to-end tests were not available in the generation environment; manually check the published GitHub Pages site on desktop and mobile before release.
