# TIAA Dashboard

## Project Purpose

The TIAA Dashboard is a prototype advisor workspace built for the CMU Tepper MSBA capstone sponsored by TIAA. It consolidates a client's planning documents and market context into a single view: ingest client PDFs (Investment Policy Statement, Risk Tolerance Questionnaire, Estate plan), extract and validate the structured data through an AI agent pipeline, and surface portfolio comparisons, risk alerts, and a daily market summary so an advisor can prepare for client conversations without manually cross-referencing source documents.

All client personas in this repository (*Carina*, *John Smith*, *Maria*) are **fictional** — created by the student team for development and demo. TIAA did not share real client data. See [data-access.md](data-access.md) for the full data-handling policy.

## How to Run the Code

**Prerequisites**
- Node.js 18+ and [pnpm](https://pnpm.io/) (a `pnpm-lock.yaml` is committed). `npm` also works via `package-lock.json`.
- AWS credentials with access to S3, Lambda, and Bedrock (the agent pipeline calls Bedrock for extraction and Lambda/S3 for document storage).

**Setup**

```bash
pnpm install          # or: npm install
```

Create a `.env.local` file at the repo root with the AWS configuration consumed in [lib/aws/config.ts](lib/aws/config.ts) and [lib/aws/s3.ts](lib/aws/s3.ts) (region, bucket name, credentials, etc.).

**Run**

```bash
pnpm dev              # start dev server at http://localhost:3000
pnpm build            # production build
pnpm start            # run the production build
pnpm lint             # run eslint
```

## What's Included

- **[app/](app/)** — Next.js 15 App Router pages and API routes.
  - **[app/page.tsx](app/page.tsx)** — main advisor overview dashboard (allocation comparison, alerts, daily summary).
  - **[app/client/](app/client/)** — per-client document views: [estate](app/client/estate/page.tsx), [ips](app/client/ips/page.tsx), [rtq](app/client/rtq/page.tsx).
  - **[app/clients/](app/clients/)**, **[app/analytics/](app/analytics/)**, **[app/assistant/](app/assistant/)**, **[app/documents/](app/documents/)**, **[app/settings/](app/settings/)**, **[app/team/](app/team/)**, **[app/templates/](app/templates/)**, **[app/workflows/](app/workflows/)** — supporting sections of the advisor workspace.
  - **[app/api/](app/api/)** — server routes for [agent1](app/api/agent1/), [chat](app/api/chat/), [clients](app/api/clients/), [daily-summary](app/api/daily-summary/), and [documents](app/api/documents/) (list / upload / pdf).
- **[lib/agents/](lib/agents/)** — AI agent pipeline. `agent1` handles document extraction with a graph, prompts, sanitizers, validation, and reference data; `agent2` and `agent3` are downstream agents; `shared/` holds common utilities.
- **[lib/aws/](lib/aws/)** — AWS SDK wiring ([config.ts](lib/aws/config.ts), [s3.ts](lib/aws/s3.ts)) for Bedrock, Lambda, and S3.
- **[lib/domain/](lib/domain/)** — shared domain types (holdings, snapshots, IPS/RTQ shapes).
- **[lib/client-context.tsx](lib/client-context.tsx)** — React context providing the selected client and their IPS/RTQ/suggestion data across the UI.
- **[lib/non-pdf-client-data/](lib/non-pdf-client-data/)** — seed/reference data for clients that do not have PDFs.
- **[components/](components/)** — UI components, including the [advisor-layout](components/advisor-layout.tsx) shell and a full set of shadcn/ui primitives under [components/ui/](components/ui/).
- **[hooks/](hooks/)**, **[styles/](styles/)**, **[public/](public/)** — React hooks, Tailwind global styles, and static assets.
- **Tooling** — Next.js 15, React 19, TypeScript 5, Tailwind CSS 3, Radix UI, Recharts, React Hook Form + Zod.

## Entry Points

- **Dashboard UI** — [app/page.tsx](app/page.tsx)
- **Per-document views** — [app/client/ips/page.tsx](app/client/ips/page.tsx), [app/client/rtq/page.tsx](app/client/rtq/page.tsx), [app/client/estate/page.tsx](app/client/estate/page.tsx)
- **API routes** — [app/api/](app/api/) (see [docs/api.md](docs/api.md))
- **Agent 1 extraction pipeline** — [lib/agents/agent1/pipeline/index.ts](lib/agents/agent1/pipeline/index.ts)
- **Schemas** — [lib/agents/agent1/contracts.ts](lib/agents/agent1/contracts.ts) (field definitions in [docs/data-dictionary.md](docs/data-dictionary.md))

No Python component — this is a pure Node/TypeScript project, so `requirements.txt` / `environment.yml` are not applicable. Dependencies are pinned in [package.json](package.json) and [pnpm-lock.yaml](pnpm-lock.yaml).

## Data, Docs, Results

- **[data-access.md](data-access.md)** — NDA rules, what is / isn't shareable, how to request access to real sponsor data. Raw PDFs are **never** committed (enforced by [.gitignore](.gitignore)).
- **[docs/](docs/)** — [data-dictionary.md](docs/data-dictionary.md), [api.md](docs/api.md), [usage.md](docs/usage.md).
- **[results/](results/)** — redacted, placeholder-only sample outputs from the Agent 1 pipeline.

## License / IP

Proprietary — subject to the EPA/NDA between CMU Tepper and TIAA. See [NOTICE.md](NOTICE.md). No open-source license is granted.

## Contact

- **Repo owner:** heartexteen (GitHub)
- **Maintainer:** Kittimate Chulajata — kittimatechulajata@gmail.com / kchulaja@andrew.cmu.edu
