# Registration Flow Client Implementation Instructions

These client instructions extend the current `origin/home` baseline. Use `design.md` as the visual and RTL source of truth, and apply the rules below for registration-flow client work.

- Do not run the client build command while implementing registration-flow changes.
- Do not add or update tests unless explicitly requested.
- Keep stateful registration logic in Signal Store stores created with `signalStore`.
- Use Angular signal forms or signal-driven bindings for form state.
- Keep component classes thin; components should delegate add, remove, update, and validation logic to the registration store.
- Do not add new global-store state without approval. Prefer registration-scoped providers for in-progress registration state.
- If a referenced component does not exist or cannot be found, notify the user and do not implement a substitute unless the user approves it.
- Keep the app Hebrew-first and RTL-friendly.
