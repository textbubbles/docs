# CLAUDE.md — textbubbles/docs (PUBLIC)

This is the **developer documentation site** at https://docs.textbubbles.com. The repo is **public** and the built site is served to anyone with a browser, including competitors.

## Public-only rule

Treat every file under `pages/`, `public/`, `components/`, and the rendered site as something an anonymous reader will see. **Never document implementation details that aren't already part of the public API contract.**

This file itself is shipped publicly — it must not enumerate the internal names it's protecting against. Keep guidance abstract.

### What MUST NOT appear in this repo

Anything that reveals **how** the product is built, not **what** it does:

- The names of the libraries, frameworks, runtimes, queues, databases, caches, encryption schemes, or providers we depend on internally — including in code samples, prose, package.json snippets, or screenshots
- The names of internal services, containers, processes, sidecars, or hostnames
- Architectural choices (multi-tenancy model, sharding, sidecar topology, per-process resource limits, retry/backoff specifics, where state is stored)
- Versioning of internals — phrases like "v1 only does X", "deferred to v2", "currently doesn't support Y because Z" reveal roadmap and rationale. Either describe the *current* contract plainly or say "not currently supported" without internal prefixes
- Provider risk language — "unofficial", "may be flagged", "no SLA on this channel" reveals which provider underpins which feature
- Code paths, file names, table names, column names, env-var names from any other repo
- Internal admin endpoints (`/v1/admin/*`) — only document what an external customer can call
- Limit numbers tied to internal storage choices ("media ≤512 KB inline" describes a storage decision, not a contract — describe the customer-visible behavior without the internal reason)

### What IS fine to document

- The public **API surface**: endpoints customers call, with request/response shapes
- **Error codes** customers can encounter (with what they should do, not why we chose to raise them)
- **Channel capabilities** as user-visible behavior ("WhatsApp supports text, images, video, voice notes, reactions, replies, mentions in groups")
- **Hard limits enforced by upstream providers** when the upstream has published them itself (those aren't ours to leak)
- **Pairing / setup flows** described functionally ("scan a QR code with WhatsApp"), not architecturally
- **Webhook event shapes** and signing
- **SDK examples**, code snippets, curl commands

### When in doubt

Ask: "Could a competitor read this and learn something they couldn't infer from using the API as a black box?" If yes, it belongs in the **api repo**'s docs or the **infra repo**'s runbook, not here.

The internal-facing equivalents have their own CLAUDE.md guidance:
- The api repo: implementation details, doc-sync rules with this repo
- The infra repo: ops procedures with concrete service names, secrets, recovery steps
- The personal vault: design docs, status notes, deviations

## Auto-deploy

Pushes to `main` deploy to Cloudflare Pages automatically. There is no staging gate — what lands is live. Treat every commit accordingly.
