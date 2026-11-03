# Security review (modularization)

## Scope

Compared the uploaded standalone `index.html` structure with the extracted project. This is a **static/source review plus Node.js behavior tests**, not a penetration test or a complete browser compatibility audit.

## Verified

1. No dynamic JS evaluation (`eval`, `Function`) or OS command execution was introduced.
2. No network APIs or external dependencies were introduced. The application still manipulates a browser-only in-memory virtual filesystem.
3. Terminal output continues to be rendered with `textContent`, not interpreted as HTML.
4. Virtual explorer file names are passed through `escapeHtml` before `innerHTML` insertion.
5. Rich HTML documentation rendered via `innerHTML` comes from fixed repository source strings. Do not pass user-originated text into these templates without escaping or switching to safe DOM APIs.
6. Added a restrictive meta CSP: only same-origin scripts/styles, no outgoing `connect-src`, no forms or plugins.
7. Unit/integration/security tests: **9 passed** using Node.js. JavaScript syntax checks also passed.

## Residual limitations / risks

- **No browser E2E verified:** Chromium navigation was blocked by the execution environment. Test in Chrome and Edge via local HTTP server and GitHub Pages before release.
- The existing simulator intentionally implements only a subset of CMD syntax; behavior is not necessarily identical to Windows CMD.
- Existing unbounded user inputs, virtual storage, and regex search functionality can cause client-side performance degradation. Consider resource ceilings and time budgets before opening to untrusted bulk input.
- CSP in a `<meta>` element cannot implement all HTTP-header-only directives (for example `frame-ancestors`). GitHub Pages does not let this project set arbitrary response headers directly; hosting/header controls are a separate question.
- Client-side code is publicly viewable on GitHub Pages. Never add tokens, private keys or credentials.
- No third-party dependency audit is necessary for runtime packages because the project includes none; this does not guarantee all browser/platform issues are absent.

## Regression tests

Run `npm test` (Node.js required). Check manually: sidebar menu, introduction page, command detail and copy button, `mkdir/dir/cd`, files and directory operations, redirects, piping, reset, autocomplete, mobile view.
