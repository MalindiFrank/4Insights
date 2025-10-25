# 4Insights

4Insights helps website owners understand how people use their sites — which pages are popular, how visitors move between pages, and what content works best — without spying on anyone. It’s designed so a person can get started quickly: you add a tiny snippet of code to your site, and the system collects anonymous, summary information that helps you improve your site.

A lightweight, privacy-first web analytics platform designed to be simple to operate, easy to extend, and production-ready when the team is ready to scale and monetize. 4Insights is built with the goals of clarity, maintainability, and minimal runtime dependencies — a showcase of system integration best-practices.

---

## Vision

Deliver a small, robust analytics stack that provides useful, privacy-respecting insights to website owners while remaining easy to operate and extend. The implementation emphasizes:

* **Simplicity and clarity** — short, readable code and straightforward developer workflows.
* **Dependency freedom** — prefer built-in language features and small, auditable dependencies.
* **Separation of concerns** — modular components (Tracker, Collector, Auth, Dashboard/BFF).
* **Event-driven design** — reliable event ingestion and pluggable persistence.
* **Production readiness** — designed to be hardened for scale (storage adapters, auth adapters, rate-limiting, observability).

---

## What 4Insights provides today

* A small **tracker snippet** (JS) to embed on client sites; captures pageviews and basic metadata (SPA-aware).
* A **Collector** service (Deno) that ingests, validates, and persists tracking events. The default development storage is NDJSON files.
* A **Dashboard** (SvelteKit) with a Backend-For-Frontend (BFF) to present filtered analytics to users.
* A **Demo authentication** service that issues temporary API credentials for quick trials and demonstrations.

> Note: Demo auth and NDJSON storage are MVP conveniences and will be replaced by persistent DB-backed services for production.

---

## Architecture (concise)

* **Tracker → Collector**: the tracker sends events directly to the Collector for performance and scalability. Collector enforces payload validation and site-level credential checks.
* **Dashboard Client → BFF → Services**: the BFF is responsible for user session validation (members-auth introspection), aggregation, and returning pre-filtered results to the dashboard UI.
* **Auth**: two independent paths:

  * **Demo Auth**: temporary credentials for quick onboarding (kept lightweight and in-memory for demo use).
  * **Members Auth**: planned production auth with persistent storage, token introspection, user and team management.

The system favors a pluggable approach: storage and auth are implemented behind adapter interfaces so production services (Postgres, Redis, etc.) can be swapped in without large rewrites.

---

## Security & privacy principles (high level)

4Insights is privacy-first by design:

* **No personal identifiers by default** — the tracker collects aggregated, non-identifying metadata.
* **Transport security** — HTTPS everywhere is required for production.
* **Scoped API keys** — site-level keys limit access to a single site’s events.
* **Key rotation & secrets management** — rotation procedures and vault-backed secrets are recommended before production usage.
* **Rate limiting & abuse protection** — Collector enforces quotas per API key and per client IP to protect resources.

---

## Development & team workflow (where to start)

This project is intentionally modular so three people can work independently and integrate clearly:

* **DB owner**: implements persistent storage adapters and migration scripts (Collector and MembersAuth should accept a pluggable storage adapter).
* **MembersAuth owner**: builds the production authentication service (token issuance, introspection, user/team management).
* **Integrator (project lead)**: maintains Demo Auth, Collector glue, BFF integration, and overall system design.

Recommended first steps for contributors (high level):

1. Read component READMEs in `/collector`, `/auth`, and `/dashboard`.
2. Run the demo locally and generate a temporary API key via Demo Auth.
3. Use the tracker snippet on a local site/page to verify events are delivered to Collector.

---

## Roadmap (prioritized)

**P0 (short-term, production safety)**

* NDJSON atomic write + rotation + retention or pluggable DB adapter.
* Rate limiting (per API key & per IP).
* Auth adapters: refactor demo auth into a pluggable interface.
* CI and test coverage for core services.

**P1 (important UX & operations)**

* Schema-based payload validation and clearer tracker contract docs.
* Export capabilities (CSV / NDJSON) in dashboard.
* Prometheus-style metrics and example Grafana dashboards.

**P2 (monetization & teams)**

* Members Auth (full production implementation), RBAC and team seats.
* Billing and plan enforcement (retention/ingestion limits per tier).
* Webhooks, integrations, and scaling improvements (queueing, workers).

---

## Monetization strategy (brief)

Start with a freemium model that leverages the demo fast-onboarding flow:

* **Free tier**: demo keys, short retention, limited ingestion rate.
* **Paid tiers**: longer retention, higher ingestion, team seats, exports, webhooks, and dedicated SLAs.

Build payment and plan-enforcement into the BFF layer so storage and ingestion remain pluggable beneath billing rules.

---

## Contribution guidelines (short)

* Follow the code style and keep changes small and well-tested.
* Open PRs for each logical change and include tests for new behavior. CI runs basic Deno and frontend checks.
* For changes touching storage or auth, prefer an adapter/interface-first approach to preserve modularity.

---

## Where to get help

Open an issue in this repository for design questions or to propose changes to architecture. The repository contains component-specific READMEs with development notes and configuration details.

---

## License

This project uses the MIT license. See the `LICENSE` file for details.

---

*Last updated: see repository history for the exact commit.*

