# Usage Guide

End-to-end walkthrough for an advisor using the dashboard and for a developer running the pipeline locally.

## Advisor workflow

1. **Pick a client.** Open `/` — the `ClientProvider` in [lib/client-context.tsx](../lib/client-context.tsx) exposes the selected client plus IPS, RTQ, and AI suggestion data to every page.
2. **Review the overview.** The home page ([app/page.tsx](../app/page.tsx)) shows:
   - Target vs. suggested asset allocation (IPS vs. RTQ) as a bar chart.
   - Current holdings breakdown as a pie chart.
   - Alerts, AI suggestions, and meeting topics from the Agent 1 pipeline.
   - Daily market summary from `/api/daily-summary`.
3. **Drill into a document.** Navigate to `/client/ips`, `/client/rtq`, or `/client/estate` to view the extracted structured data per PDF type. Pages live in [app/client/](../app/client/).
4. **Upload a new document.** Use the *Upload Document* button — it posts to `/api/documents/upload`, which stores the file in the S3 input prefix.
5. **Re-extract.** Trigger a pipeline run (via the UI "re-extract" affordance or by calling `/api/agent1/seed`) to refresh the extracted JSON in S3 and refresh the dashboard.
6. **Schedule a meeting.** The *Schedule Meeting* button captures the current meeting topics for follow-up.

## Developer workflow

### 1. Install & run

See the top-level [README.md](../README.md) for `pnpm install` / `pnpm dev`.

### 2. Seed PDFs

Place test PDFs in `s3://<bucket>/agent1(extractor)-input(PDF)/<clientKey>/`. Accepted filename hints (case-insensitive):
- `*ips*` or `*investment-policy*` → treated as IPS.
- `*rtq*` or `*risk-tolerance*` → treated as RTQ.
- `*estate*` → treated as Estate.

For local-only testing without S3, drop PDFs into `pdfData/` at the repo root. This folder is `.gitignore`d — see [data-access.md](../data-access.md).

### 3. Run the pipeline

```bash
# Seed all registered clients
curl -X POST http://localhost:3000/api/agent1/seed
```

Each client runs through the five-node pipeline defined in [lib/agents/agent1/pipeline/index.ts](../lib/agents/agent1/pipeline/index.ts):

```
loadPdfs → extractDocuments → validate → deriveInsights → writeToS3
```

### 4. Inspect output

Extracted JSON is written to `s3://<bucket>/agent1(extractor)-output/<clientKey>/`. A redacted example of the shape is in [results/](../results/).

### 5. Add a new client

1. Create a new file under [lib/agents/agent1/reference-data/](../lib/agents/agent1/reference-data/) (e.g., `alex.ts`) following the `ClientReferenceData` shape.
2. Register the client in [lib/non-pdf-client-data/non-pdf/](../lib/non-pdf-client-data/non-pdf/) so the pipeline sees it.
3. Drop IPS / RTQ / Estate PDFs into the S3 input prefix under the new key.
4. Call `/api/agent1/seed` (or the per-client entry point).

## Troubleshooting

- **Empty dashboard:** ensure the client has either PDFs in S3 *or* a `non-pdf-client-data` entry — `clientHasPdfs()` checks both.
- **Bedrock extraction fails:** verify your AWS credentials have `bedrock:InvokeModel` for the configured model ID in [lib/aws/config.ts](../lib/aws/config.ts).
- **S3 writes fail:** verify `s3:PutObject` on the bucket and the output prefix.
- **Zod validation errors in derived insights:** `DERIVED_INSIGHTS_SCHEMA` in [lib/agents/agent1/contracts.ts](../lib/agents/agent1/contracts.ts) caps arrays — check the raw model output if the pipeline rejects it.
