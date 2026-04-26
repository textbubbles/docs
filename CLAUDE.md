# CLAUDE.md — docs.textbubbles.com

This is the public developer docs site (Next.js 14 + Nextra), deployed to Cloudflare Pages at `docs.textbubbles.com`. Everything here is read by external API customers and indexed by search engines / LLMs (via `llms.txt` / `llms-full.txt`).

## Do not divulge internal infrastructure

Customer-facing docs must describe behavior in **generic, product-level language**. Do not reveal how the platform is implemented — customers don't run our infra, and leaking those details creates support confusion, a larger attack surface, and lock-in to details that may change.

**Never describe failure modes, latency, or behavior in terms of our physical, hosting, or vendor infrastructure.** Specifically, do not reference:

- **BlueBubbles** — this is the internal iMessage provider. Never name it in customer docs. Say "the iMessage provider", "the upstream iMessage service", or "provider" instead. This applies to prose, field descriptions (e.g. do NOT write "BlueBubbles GUID" — write "provider-assigned message GUID"), error-code docs, and health-check response examples. (See note below: some live API output still echoes `BLUEBUBBLES_*` strings — that's a larger cleanup, separate from docs.)
- **Mac mini / Mac minis** (or any specific host hardware) — say "delivery failure", "the message failed", "the provider was unreachable" instead.
- **The self-hosted runner, Cloudflare Tunnel, `host.docker.internal`, launchd, Docker, Postgres/Redis topology, or any specific container/service name** from `infra/docker-compose.prod.yml`.
- **LAN IPs, hostnames, internal DNS, SSH usernames, or the on-box filesystem layout** (`/Users/lamarbot/...`, `/volume1/...`).
- **Internal queue/worker naming** (e.g. BullMQ queue names) unless the queue is a customer-visible abstraction.

**What you CAN mention:**

- **iMessage / SMS / WhatsApp** as channels — these are the product.
- **Generic failure reasons** — "delivery failed", "provider unreachable", "upstream timeout", "transient failure".
- **Field names and identifier shapes that customers literally receive** (e.g. `externalMessageId`, the GUID format) — just describe them as "the provider's message ID" without naming the vendor.

### Rewriting internal details

When you catch an internal detail, swap it for the customer-visible concept:

| Don't write | Do write |
|---|---|
| "BlueBubbles GUID" | "provider-assigned message GUID" |
| "the receiving BlueBubbles instance" | "the receiving iMessage instance" |
| "BlueBubbles chat identifier" | "provider chat identifier" |
| "BlueBubbles has no native resend" | (omit — implementation reason, not customer-visible) |
| "the Mac mini was offline" | "the message failed" / "the provider was unreachable" |
| "the delivering Mac mini was unreachable" | "a transient delivery failure" |
| "the Docker container restarted" | "the service restarted" (or omit entirely) |
| "the BullMQ worker picked it up" | "the message entered the processing queue" |
| "the self-hosted runner deployed" | (omit — deploys are not a customer concern) |

As of 2026-04-25, the customer-facing surface is fully scrubbed. Do not let new PRs reintroduce BlueBubbles / Mac mini / internal-infra references.

## Docs-sync contract (from workspace `CLAUDE.md`)

When an API change lands in `api/`, this repo must be updated in the same session. The canonical machine-readable spec is `public/llms-full.txt`; keep it in sync with the MDX pages under `pages/`. `public/llms.txt` has the endpoint summary only.

Run `npm run build` before declaring docs changes done — it validates MDX.

## Deploy

Push to `main` → Cloudflare Pages auto-deploys. No manual step. PR previews are generated per PR.
